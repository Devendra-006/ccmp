import express from 'express';
import { pool } from '../db/postgres.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category, audience } = req.query;
  try {
    let queryText = `
      SELECT n.*, u.email AS author_email 
      FROM notices n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category.toLowerCase());
      queryText += ` AND LOWER(n.category) = $${params.length}`;
    }
    if (audience) {
      params.push(audience.toLowerCase());
      queryText += ` AND (LOWER(n.audience) = $${params.length} OR LOWER(n.audience) = 'all')`;
    }

    queryText += ` ORDER BY n.is_urgent DESC, n.created_at DESC`;

    const result = await pool.query(queryText, params);
    const formatted = result.rows.map(r => ({
      ...r,
      isUrgent: r.is_urgent,
      createdAt: r.created_at
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireRole(['admin', 'teacher']), async (req, res) => {
  const { title, body, category = 'General', audience = 'all', isUrgent = false } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  try {
    const aud = ['all', 'department', 'class', 'teachers', 'students'].includes(audience.toLowerCase())
      ? audience.toLowerCase()
      : 'all';

    const result = await pool.query(
      `INSERT INTO notices (title, body, category, audience, is_urgent, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title.trim(), body.trim(), category.trim(), aud, !!isUrgent, req.user ? req.user.id : null]
    );

    const notice = result.rows[0];
    res.status(201).json({
      message: 'Notice posted successfully',
      data: {
        ...notice,
        isUrgent: notice.is_urgent,
        createdAt: notice.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
