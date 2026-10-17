import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/postgres.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { sendWelcomeCredentialsEmail } from '../services/mailer.js';

const router = express.Router();

// User Login with PostgreSQL & bcrypt
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role, status FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}. Please contact the administrator.` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role verification (admin/super_admin alias compatibility)
    if (role) {
      const matchRole = user.role === role || 
        (role === 'admin' && (user.role === 'super_admin' || user.role === 'academic_admin'));
      if (!matchRole) {
        return res.status(403).json({ error: `Account exists but is registered with role '${user.role}', not '${role}'` });
      }
    }

    // Fetch linked teacher or student profile if exists
    let profile = null;
    if (user.role === 'teacher') {
      const teacherRes = await pool.query('SELECT * FROM teachers WHERE user_id = $1', [user.id]);
      if (teacherRes.rows.length > 0) profile = teacherRes.rows[0];
    } else if (user.role === 'student') {
      const studentRes = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      if (studentRes.rows.length > 0) profile = studentRes.rows[0];
    }

    const token = generateToken(user);

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Authentication service error', details: err.message });
  }
});

// Register user (Admin or Self-Registration)
router.post('/register', async (req, res) => {
  const { email, password, role = 'student', name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const validRoles = ['super_admin', 'academic_admin', 'admin', 'teacher', 'student', 'parent', 'accountant'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role specified. Allowed: ${validRoles.join(', ')}` });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, status) 
       VALUES ($1, $2, $3, 'active') 
       RETURNING id, email, role, status, created_at`,
      [email.trim(), hashedPassword, role]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    // If name is provided, dispatch welcome onboarding credentials via Resend
    if (name) {
      sendWelcomeCredentialsEmail({
        to: newUser.email,
        name,
        email: newUser.email,
        tempPassword: password,
        role: newUser.role
      }).catch(e => console.warn('[Onboarding Email Notice]', e.message));
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (err) {
    console.error('[Register Error]', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Get current authenticated user session
router.get('/me', authenticate, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'teacher') {
      const teacherRes = await pool.query('SELECT * FROM teachers WHERE user_id = $1', [req.user.id]);
      if (teacherRes.rows.length > 0) profile = teacherRes.rows[0];
    } else if (req.user.role === 'student') {
      const studentRes = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
      if (studentRes.rows.length > 0) profile = studentRes.rows[0];
    }

    res.json({
      user: {
        ...req.user,
        profile
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
