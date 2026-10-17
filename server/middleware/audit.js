import { pool } from '../db/postgres.js';

/**
 * Record an immutable audit log entry into PostgreSQL
 * @param {Object} params
 * @param {string} [params.userId]
 * @param {string} params.action - e.g. 'CREATE_DEPARTMENT', 'RECORD_PAYMENT', 'ENROLL_STUDENT'
 * @param {string} params.entity - e.g. 'Department', 'Payment', 'Student'
 * @param {string} [params.entityId]
 * @param {string} [params.ipAddress]
 */
export async function logAuditEvent({ userId = null, action, entity, entityId = null, ipAddress = null }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entity, entityId ? String(entityId) : null, ipAddress || '127.0.0.1']
    );
  } catch (err) {
    console.warn('[Audit Log Warning]', err.message);
  }
}

export default logAuditEvent;
