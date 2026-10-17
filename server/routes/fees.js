import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/postgres.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.js';
import { sendFeeReceiptEmail } from '../services/mailer.js';

const router = express.Router();

// List fee structures
router.get('/structures', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fs.*, p.name AS programme_name 
      FROM fee_structures fs 
      LEFT JOIN programmes p ON fs.programme_id = p.id 
      ORDER BY fs.created_at DESC
    `);

    const formatted = result.rows.map(r => ({
      ...r,
      programmeId: r.programme_id,
      amountInPaise: parseInt(r.amount_in_paise, 10),
      dueDate: r.due_date,
      programmeName: r.programme_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create fee structure (Admin only - PRD FEE-1)
router.post('/structures', authenticate, requireRole(['admin']), async (req, res) => {
  const { programmeId, semester, head, amountInPaise, dueDate } = req.body;
  if (!head || !amountInPaise || !dueDate) {
    return res.status(400).json({ error: 'head, amountInPaise, and dueDate are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO fee_structures (programme_id, semester, head, amount_in_paise, due_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [programmeId || null, parseInt(semester || 1, 10), head.trim(), parseInt(amountInPaise, 10), dueDate]
    );

    const s = result.rows[0];
    res.status(201).json({
      message: 'Fee structure created',
      data: {
        ...s,
        programmeId: s.programme_id,
        amountInPaise: parseInt(s.amount_in_paise, 10),
        dueDate: s.due_date
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dues (Student sees own; Admin sees all - PRD FEE-2)
router.get('/dues', optionalAuth, async (req, res) => {
  const { studentId, status } = req.query;
  try {
    let queryText = `
      SELECT fd.*, fs.head, fs.due_date, fs.semester, 
             s.name AS student_name, s.roll_no, s.enrolment_no, u.email AS student_email,
             p.id AS payment_id, p.receipt_no, p.paid_at, p.mode AS payment_mode, p.gateway_ref
      FROM fee_dues fd 
      JOIN fee_structures fs ON fd.fee_structure_id = fs.id 
      JOIN students s ON fd.student_id = s.id 
      LEFT JOIN users u ON s.user_id = u.id 
      LEFT JOIN payments p ON p.due_id = fd.id 
      WHERE 1=1
    `;
    const params = [];

    // Role-based scoping: Student can ONLY see their own dues
    if (req.user && req.user.role === 'student') {
      const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentRes.rows.length > 0) {
        params.push(studentRes.rows[0].id);
        queryText += ` AND fd.student_id = $${params.length}`;
      }
    } else if (studentId) {
      params.push(studentId);
      queryText += ` AND fd.student_id = $${params.length}`;
    }
    // If Admin or Accountant (or demo mode with no studentId), all dues are returned

    if (status && status !== 'ALL') {
      params.push(status.toUpperCase());
      queryText += ` AND fd.status = $${params.length}`;
    }

    queryText += ` ORDER BY fd.created_at DESC`;

    const result = await pool.query(queryText, params);
    const enriched = result.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      feeStructureId: r.fee_structure_id,
      amountInPaise: parseInt(r.amount_in_paise, 10),
      fineInPaise: parseInt(r.fine_in_paise || 0, 10),
      status: r.status,
      head: r.head,
      dueDate: r.due_date,
      semester: r.semester,
      studentName: r.student_name,
      rollNo: r.roll_no,
      enrolmentNo: r.enrolment_no,
      payment: r.payment_id ? {
        id: r.payment_id,
        receiptNo: r.receipt_no,
        paidAt: r.paid_at,
        mode: r.payment_mode,
        gatewayRef: r.gateway_ref,
        amountInPaise: parseInt(r.amount_in_paise, 10)
      } : null
    }));

    res.json({ data: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create fee due for student (Admin only)
router.post('/dues', authenticate, requireRole(['admin']), async (req, res) => {
  const { studentId, feeStructureId, amountInPaise } = req.body;
  if (!studentId || !feeStructureId) {
    return res.status(400).json({ error: 'studentId and feeStructureId are required' });
  }

  try {
    const structRes = await pool.query('SELECT * FROM fee_structures WHERE id = $1', [feeStructureId]);
    if (structRes.rows.length === 0) return res.status(404).json({ error: 'Fee structure not found' });
    const struct = structRes.rows[0];

    const amount = amountInPaise ? parseInt(amountInPaise, 10) : parseInt(struct.amount_in_paise, 10);

    const result = await pool.query(
      `INSERT INTO fee_dues (student_id, fee_structure_id, amount_in_paise, status) 
       VALUES ($1, $2, $3, 'PENDING') 
       RETURNING *`,
      [studentId, feeStructureId, amount]
    );

    res.status(201).json({ message: 'Fee due recorded', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Razorpay Order Creation
router.post('/create-razorpay-order', authenticate, async (req, res) => {
  const { dueId } = req.body;
  if (!dueId) return res.status(400).json({ error: 'dueId is required' });

  try {
    const dueRes = await pool.query('SELECT * FROM fee_dues WHERE id = $1', [dueId]);
    if (dueRes.rows.length === 0) return res.status(404).json({ error: 'Fee due not found' });
    const due = dueRes.rows[0];

    if (due.status === 'PAID') return res.status(400).json({ error: 'Fee has already been paid' });

    const order = await createRazorpayOrder({
      amountInPaise: parseInt(due.amount_in_paise, 10),
      receipt: `due_${due.id.slice(0, 8)}`,
      notes: { dueId: due.id, studentId: due.student_id }
    });

    res.json({
      message: 'Razorpay order created',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[Razorpay Order Error]', err);
    res.status(500).json({ error: 'Failed to create Razorpay order', details: err.message });
  }
});

// Live Razorpay Payment Verification & Database Capture
router.post('/verify-razorpay-payment', authenticate, async (req, res) => {
  const { dueId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!dueId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required Razorpay verification parameters' });
  }

  try {
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature.' });
    }

    const dueRes = await pool.query(`
      SELECT fd.*, fs.head, s.name AS student_name, u.email AS student_email 
      FROM fee_dues fd 
      JOIN fee_structures fs ON fd.fee_structure_id = fs.id 
      JOIN students s ON fd.student_id = s.id 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE fd.id = $1
    `, [dueId]);

    if (dueRes.rows.length === 0) return res.status(404).json({ error: 'Fee due not found' });
    const due = dueRes.rows[0];

    // Update fee_dues status to PAID
    await pool.query("UPDATE fee_dues SET status = 'PAID' WHERE id = $1", [dueId]);

    // Insert payment record
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentRes = await pool.query(
      `INSERT INTO payments (due_id, amount_in_paise, mode, gateway_ref, receipt_no) 
       VALUES ($1, $2, 'upi', $3, $4) 
       RETURNING *`,
      [dueId, due.amount_in_paise, razorpay_payment_id, receiptNo]
    );

    const payment = paymentRes.rows[0];

    // Asynchronously dispatch receipt email
    if (due.student_email) {
      sendFeeReceiptEmail({
        to: due.student_email,
        studentName: due.student_name,
        receiptNo: payment.receipt_no,
        amount: parseInt(payment.amount_in_paise, 10),
        feeHead: due.head,
        paidAt: payment.paid_at
      }).catch(e => console.warn('[Email Receipt Warning]', e.message));
    }

    res.json({
      message: 'Razorpay payment successfully verified and recorded',
      data: {
        payment,
        receiptNo: payment.receipt_no
      }
    });
  } catch (err) {
    console.error('[Payment Verification Error]', err);
    res.status(500).json({ error: 'Payment processing error', details: err.message });
  }
});

// Sandbox Simulation Payment Flow (Directly implements PRD Flow 3 & FEE-3)
router.post('/pay-sandbox', optionalAuth, async (req, res) => {
  const { dueId, mode = 'sandbox_razorpay' } = req.body;
  if (!dueId) return res.status(400).json({ error: 'dueId is required' });

  // Guard in strict production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SANDBOX_PAYMENTS !== 'true') {
    return res.status(403).json({ error: 'Sandbox payments are disabled in production environment' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const dueRes = await client.query(`
      SELECT fd.*, fs.head, s.name AS student_name, s.user_id, u.email AS student_email 
      FROM fee_dues fd 
      JOIN fee_structures fs ON fd.fee_structure_id = fs.id 
      JOIN students s ON fd.student_id = s.id 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE fd.id = $1
      FOR UPDATE
    `, [dueId]);

    if (dueRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Fee due not found' });
    }
    const due = dueRes.rows[0];

    // Ownership check: If authenticated student, verify student owns this due
    if (req.user && req.user.role === 'student' && due.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized: You may only settle your own fee dues.' });
    }

    if (due.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Fee is already marked as paid' });
    }

    await client.query("UPDATE fee_dues SET status = 'PAID' WHERE id = $1", [dueId]);

    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const gatewayRef = `pay_mock_${crypto.randomBytes(6).toString('hex')}`;

    const paymentRes = await client.query(
      `INSERT INTO payments (due_id, amount_in_paise, mode, gateway_ref, receipt_no) 
       VALUES ($1, $2, 'sandbox_razorpay', $3, $4) 
       RETURNING *`,
      [dueId, due.amount_in_paise, gatewayRef, receiptNo]
    );

    const payment = paymentRes.rows[0];
    await client.query('COMMIT');

    // Asynchronously dispatch receipt email
    if (due.student_email) {
      sendFeeReceiptEmail({
        to: due.student_email,
        studentName: due.student_name,
        receiptNo: payment.receipt_no,
        amount: parseInt(payment.amount_in_paise, 10),
        feeHead: due.head,
        paidAt: payment.paid_at
      }).catch(e => console.warn('[Email Receipt Warning]', e.message));
    }

    res.json({
      message: 'Sandbox payment verified and captured',
      data: {
        payment,
        receiptNo: payment.receipt_no
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get receipt
router.get('/receipt/:receiptNo', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, fd.amount_in_paise AS due_amount, fs.head AS fee_head, 
             s.name AS student_name, s.roll_no, s.enrolment_no, s.batch, s.semester, s.section,
             prog.name AS programme_name
      FROM payments p 
      JOIN fee_dues fd ON p.due_id = fd.id 
      JOIN fee_structures fs ON fd.fee_structure_id = fs.id 
      JOIN students s ON fd.student_id = s.id 
      LEFT JOIN programmes prog ON s.programme_id = prog.id 
      WHERE p.receipt_no = $1
    `, [req.params.receiptNo]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Receipt not found' });

    const row = result.rows[0];
    res.json({
      data: {
        payment: {
          id: row.id,
          receiptNo: row.receipt_no,
          amountInPaise: parseInt(row.amount_in_paise, 10),
          mode: row.mode,
          gatewayRef: row.gateway_ref,
          paidAt: row.paid_at
        },
        feeHead: row.fee_head,
        student: {
          name: row.student_name,
          rollNo: row.roll_no,
          enrolmentNo: row.enrolment_no,
          programmeName: row.programme_name,
          semester: row.semester,
          section: row.section
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
