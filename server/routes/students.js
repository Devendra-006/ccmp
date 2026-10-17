import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/postgres.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendWelcomeCredentialsEmail } from '../services/mailer.js';

const router = express.Router();

// Get students directory
router.get('/', authenticate, async (req, res) => {
  const { programmeId, semester, section, search } = req.query;
  try {
    let queryText = `
      SELECT s.*, p.name AS programme_name, p.code AS programme_code, u.email 
      FROM students s 
      LEFT JOIN programmes p ON s.programme_id = p.id 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.deleted_at IS NULL
    `;
    const params = [];

    if (programmeId) {
      params.push(programmeId);
      queryText += ` AND s.programme_id = $${params.length}`;
    }
    if (semester) {
      params.push(parseInt(semester, 10));
      queryText += ` AND s.semester = $${params.length}`;
    }
    if (section) {
      params.push(section);
      queryText += ` AND s.section = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(s.name) LIKE $${params.length} OR LOWER(s.roll_no) LIKE $${params.length} OR LOWER(s.enrolment_no) LIKE $${params.length})`;
    }

    queryText += ` ORDER BY s.created_at DESC`;

    const result = await pool.query(queryText, params);
    const formatted = result.rows.map(r => ({
      ...r,
      enrolmentNo: r.enrolment_no,
      rollNo: r.roll_no,
      programmeId: r.programme_id,
      programmeName: r.programme_name,
      bloodGroup: r.blood_group
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create / Enroll Student (Admin only)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
  const { enrolmentNo, rollNo, name, email, programmeId, batch, semester = 1, section = 'A', phone, address, bloodGroup } = req.body;
  if (!enrolmentNo || !rollNo || !name) {
    return res.status(400).json({ error: 'Enrolment number, roll number, and student name are required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM students WHERE enrolment_no = $1 OR roll_no = $2',
      [enrolmentNo.trim().toUpperCase(), rollNo.trim().toUpperCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Student with this enrolment or roll number already exists' });
    }

    let userId = null;
    const defaultPassword = 'Student@123';

    if (email) {
      const userCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
      } else {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const userInsert = await pool.query(
          `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, 'student', 'active') RETURNING id`,
          [email.trim(), hashedPassword]
        );
        userId = userInsert.rows[0].id;

        // Trigger welcome onboarding email
        sendWelcomeCredentialsEmail({
          to: email.trim(),
          name: name.trim(),
          email: email.trim(),
          tempPassword: defaultPassword,
          role: 'student'
        }).catch(e => console.warn('[Welcome Email Notice]', e.message));
      }
    }

    const insertResult = await pool.query(
      `INSERT INTO students (
        user_id, enrolment_no, roll_no, name, programme_id, batch, semester, section, phone, address, blood_group
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        userId,
        enrolmentNo.trim().toUpperCase(),
        rollNo.trim().toUpperCase(),
        name.trim(),
        programmeId || null,
        batch || '2024-2028',
        parseInt(semester, 10),
        section.trim().toUpperCase(),
        phone || null,
        address || null,
        bloodGroup || null
      ]
    );

    const student = insertResult.rows[0];
    res.status(201).json({
      message: 'Student enrolled successfully',
      data: {
        ...student,
        enrolmentNo: student.enrolment_no,
        rollNo: student.roll_no,
        programmeId: student.programme_id,
        email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.name AS programme_name, u.email 
      FROM students s 
      LEFT JOIN programmes p ON s.programme_id = p.id 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const s = result.rows[0];
    res.json({
      data: {
        ...s,
        enrolmentNo: s.enrolment_no,
        rollNo: s.roll_no,
        programmeId: s.programme_id,
        programmeName: s.programme_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
