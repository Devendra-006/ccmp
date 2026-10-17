import jwt from 'jsonwebtoken';
import { pool } from '../db/postgres.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ccmp_jwt_2026_campus_secure';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, role, status FROM users WHERE id = $1 AND status = $2', 
      [decoded.id, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User account is inactive or no longer exists' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, role, status FROM users WHERE id = $1 AND status = $2', 
      [decoded.id, 'active']
    );
    req.user = result.rows.length > 0 ? result.rows[0] : null;
    next();
  } catch (_) {
    req.user = null;
    next();
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // Normalize admin check: 'admin' or 'super_admin' both count for admin privileges
    const userRole = req.user.role;
    const isAuthorized = allowedRoles.includes(userRole) || 
      (allowedRoles.includes('admin') && (userRole === 'super_admin' || userRole === 'academic_admin'));

    if (!isAuthorized) {
      return res.status(403).json({ 
        error: `Access denied. Role '${userRole}' is not authorized for this resource.` 
      });
    }
    next();
  };
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
