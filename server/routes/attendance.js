import express from 'express';
import { pool } from '../db/postgres.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get attendance logs
router.get('/', authenticate, async (req, res) => {
  const { studentId, subjectId, date } = req.query;
  try {
    let queryText = `
      SELECT a.*, s.name AS student_name, s.roll_no, sub.name AS subject_name, sub.code AS subject_code 
      FROM attendance a 
      LEFT JOIN students s ON a.student_id = s.id 
      LEFT JOIN subjects sub ON a.subject_id = sub.id 
      WHERE 1=1
    `;
    const params = [];

    if (studentId) {
      params.push(studentId);
      queryText += ` AND a.student_id = $${params.length}`;
    }
    if (subjectId) {
      params.push(subjectId);
      queryText += ` AND a.subject_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      queryText += ` AND a.date = $${params.length}`;
    }

    queryText += ` ORDER BY a.date DESC, a.period ASC`;

    const result = await pool.query(queryText, params);
    const formatted = result.rows.map(r => ({
      ...r,
      studentId: r.student_id,
      subjectId: r.subject_id,
      studentName: r.student_name,
      rollNo: r.roll_no,
      subjectName: r.subject_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance with UPSERT (Teacher / Admin)
router.post('/mark', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
  const { subjectId, date, period, records } = req.body;
  if (!subjectId || !date || !period || !Array.isArray(records)) {
    return res.status(400).json({ error: 'subjectId, date, period, and records array are required' });
  }

  try {
    // Look up teacher ID if current user is teacher
    let teacherId = null;
    if (req.user.role === 'teacher') {
      const tRes = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
      if (tRes.rows.length > 0) teacherId = tRes.rows[0].id;
    }

    const insertedRows = [];
    for (const r of records) {
      const status = (r.status || 'present').toLowerCase();
      const queryText = `
        INSERT INTO attendance (student_id, subject_id, date, period, status, marked_by) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (student_id, subject_id, date, period) 
        DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP 
        RETURNING *
      `;
      const resRow = await pool.query(queryText, [r.studentId, subjectId, date, period, status, teacherId]);
      insertedRows.push(resRow.rows[0]);
    }

    res.status(201).json({
      message: `Attendance marked successfully for ${insertedRows.length} students`,
      count: insertedRows.length,
      data: insertedRows.map(r => ({ ...r, studentId: r.student_id, subjectId: r.subject_id }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance summary for a student
router.get('/summary/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const queryText = `
      SELECT 
        COUNT(*) AS total_classes,
        COUNT(CASE WHEN status = 'present' THEN 1 END) AS present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) AS absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) AS late_count
      FROM attendance 
      WHERE student_id = $1
    `;
    const result = await pool.query(queryText, [studentId]);
    const row = result.rows[0];

    const total = parseInt(row.total_classes, 10) || 0;
    const present = parseInt(row.present_count, 10) || 0;
    const absent = parseInt(row.absent_count, 10) || 0;
    const late = parseInt(row.late_count, 10) || 0;

    // Weight late as 0.5 or present according to institutional rule
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    res.json({
      data: {
        studentId,
        totalClasses: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        percentage,
        isWarning: percentage < 75
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
