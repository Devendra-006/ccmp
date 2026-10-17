import express from 'express';
import { pool } from '../db/postgres.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- DEPARTMENTS ---
router.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY created_at ASC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/departments', authenticate, requireRole(['admin']), async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Department code and name are required' });

  try {
    const result = await pool.query(
      'INSERT INTO departments (code, name) VALUES ($1, $2) RETURNING *',
      [code.trim().toUpperCase(), name.trim()]
    );
    res.status(201).json({ message: 'Department created', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROGRAMMES ---
router.get('/programmes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, d.name AS department_name, d.code AS department_code 
      FROM programmes p 
      LEFT JOIN departments d ON p.department_id = d.id 
      ORDER BY p.created_at ASC
    `);

    const formatted = result.rows.map(r => ({
      ...r,
      departmentId: r.department_id,
      durationSemesters: r.duration_semesters,
      departmentName: r.department_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programmes', authenticate, requireRole(['admin']), async (req, res) => {
  const { departmentId, code, name, durationSemesters = 8 } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Programme code and name are required' });

  try {
    const result = await pool.query(
      `INSERT INTO programmes (department_id, code, name, duration_semesters) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [departmentId || null, code.trim().toUpperCase(), name.trim(), parseInt(durationSemesters, 10)]
    );

    const prog = result.rows[0];
    res.status(201).json({
      message: 'Programme created',
      data: {
        ...prog,
        departmentId: prog.department_id,
        durationSemesters: prog.duration_semesters
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBJECTS ---
router.get('/subjects', async (req, res) => {
  const { programmeId, semester } = req.query;
  try {
    let queryText = `
      SELECT s.*, p.name AS programme_name, p.code AS programme_code 
      FROM subjects s 
      LEFT JOIN programmes p ON s.programme_id = p.id 
      WHERE 1=1
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

    queryText += ` ORDER BY s.semester ASC, s.code ASC`;

    const result = await pool.query(queryText, params);
    const formatted = result.rows.map(r => ({
      ...r,
      programmeId: r.programme_id,
      programmeName: r.programme_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', authenticate, requireRole(['admin']), async (req, res) => {
  const { programmeId, code, name, credits = 3, semester = 1, type = 'core' } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Subject code and name are required' });

  try {
    const result = await pool.query(
      `INSERT INTO subjects (programme_id, code, name, credits, semester, type) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [programmeId || null, code.trim().toUpperCase(), name.trim(), parseInt(credits, 10), parseInt(semester, 10), type]
    );

    const sub = result.rows[0];
    res.status(201).json({
      message: 'Subject created',
      data: {
        ...sub,
        programmeId: sub.programme_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLASSES ---
router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name AS programme_name 
      FROM classes c 
      LEFT JOIN programmes p ON c.programme_id = p.id 
      ORDER BY c.academic_year DESC, c.semester ASC, c.section ASC
    `);

    const formatted = result.rows.map(r => ({
      ...r,
      programmeId: r.programme_id,
      academicYear: r.academic_year,
      programmeName: r.programme_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/classes', authenticate, requireRole(['admin']), async (req, res) => {
  const { programmeId, semester, section, academicYear } = req.body;
  if (!section || !academicYear) return res.status(400).json({ error: 'Section and academic year are required' });

  try {
    const result = await pool.query(
      `INSERT INTO classes (programme_id, semester, section, academic_year) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [programmeId || null, parseInt(semester, 10), section.trim().toUpperCase(), academicYear.trim()]
    );

    const cls = result.rows[0];
    res.status(201).json({
      message: 'Class created',
      data: {
        ...cls,
        programmeId: cls.programme_id,
        academicYear: cls.academic_year
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TEACHERS ---
router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, d.name AS department_name, u.email 
      FROM teachers t 
      LEFT JOIN departments d ON t.department_id = d.id 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at ASC
    `);

    const formatted = result.rows.map(r => ({
      ...r,
      departmentId: r.department_id,
      employeeCode: r.employee_code,
      departmentName: r.department_name
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teachers', authenticate, requireRole(['admin']), async (req, res) => {
  const { name, employeeCode, departmentId, designation = 'Assistant Professor', phone, email } = req.body;
  if (!name || !employeeCode) return res.status(400).json({ error: 'Teacher name and employee code are required' });

  try {
    let userId = null;
    if (email) {
      // Auto-create teacher user account if email provided
      const userCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
      } else {
        const bcrypt = (await import('bcryptjs')).default;
        const hashedPassword = await bcrypt.hash('Teacher@123', 10);
        const userInsert = await pool.query(
          `INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, 'teacher', 'active') RETURNING id`,
          [email.trim(), hashedPassword]
        );
        userId = userInsert.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO teachers (user_id, department_id, employee_code, name, designation, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, departmentId || null, employeeCode.trim().toUpperCase(), name.trim(), designation, phone || null]
    );

    const teacher = result.rows[0];
    res.status(201).json({
      message: 'Teacher created',
      data: {
        ...teacher,
        employeeCode: teacher.employee_code,
        departmentId: teacher.department_id,
        email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
