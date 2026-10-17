import { pool } from '../db/postgres.js';
import { sendAttendanceWarningEmail } from '../services/mailer.js';
import { logAuditEvent } from '../middleware/audit.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cloud Scheduled Cron Job:
 * Scans all active students, computes real-time attendance percentage,
 * and sends transactional alert emails for any student with attendance < 75%.
 */
export async function runAttendanceCron() {
  console.log('--- [CRON JOB] Starting Daily Student Attendance Shortfall Audit ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    const query = `
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.roll_no,
        s.enrolment_no,
        u.email AS student_email,
        COUNT(a.id) AS total_classes,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS late_count
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.status = 'active' AND s.deleted_at IS NULL
      GROUP BY s.id, s.name, s.roll_no, s.enrolment_no, u.email
    `;

    const result = await pool.query(query);
    console.log(`Audited ${result.rows.length} total students.`);

    let alertCount = 0;
    for (const row of result.rows) {
      const total = parseInt(row.total_classes, 10);
      if (total === 0) continue; // No classes conducted yet

      const present = parseInt(row.present_count, 10);
      const late = parseInt(row.late_count, 10);
      const percentage = Math.round(((present + late) / total) * 100);

      if (percentage < 75) {
        alertCount++;
        console.log(`⚠️ Shortfall detected for ${row.student_name} (${row.roll_no}): ${percentage}% (${present}/${total})`);

        if (row.student_email) {
          await sendAttendanceWarningEmail({
            to: row.student_email,
            studentName: row.student_name,
            attendancePercentage: percentage
          }).catch(e => console.warn(`[Email Alert Failed for ${row.student_email}]:`, e.message));
        }

        // Record event in audit log
        await logAuditEvent({
          action: 'ATTENDANCE_SHORTFALL_ALERT',
          entity: 'Student',
          entityId: row.student_id,
          ipAddress: 'CRON_SCHEDULER'
        });
      }
    }

    console.log(`✓ Daily Attendance Audit Finished. Triggered ${alertCount} alerts.\n`);
    return { audited: result.rows.length, alertsTriggered: alertCount };
  } catch (err) {
    console.error('[CRON JOB ERROR]', err);
    throw err;
  }
}

// Standalone execution support
if (process.argv[1]?.includes('cronAttendanceAlert')) {
  runAttendanceCron()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
