import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const defaultSender = process.env.EMAIL_FROM || 'Campus Management <onboarding@resend.dev>';

export const resend = new Resend(resendApiKey);

/**
 * Send automated fee payment confirmation & receipt email
 */
export async function sendFeeReceiptEmail({ to, studentName, receiptNo, amount, feeHead, paidAt }) {
  if (!resendApiKey) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f172a; padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Fee Payment Confirmation</h2>
        <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Cloud-Based Student Management System</p>
      </div>
      <div style="padding: 24px 8px;">
        <p style="font-size: 15px; color: #334155;">Dear <strong>${studentName}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          Your payment for <strong>${feeHead}</strong> has been successfully processed and verified.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr><td style="padding: 6px 0; color: #64748b;">Receipt Number:</td><td style="text-align: right; font-weight: 700; font-family: monospace;">${receiptNo}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="text-align: right; font-weight: 700; color: #10b981;">₹${(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Transaction Date:</td><td style="text-align: right; color: #334155;">${new Date(paidAt || Date.now()).toLocaleDateString('en-IN')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Payment Status:</td><td style="text-align: right; font-weight: 700; color: #10b981;">PAID & SETTLED</td></tr>
          </table>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          This is an electronically generated receipt. You can download the full PDF anytime from your student dashboard.
        </p>
      </div>
    </div>
  `;

  return await resend.emails.send({
    from: defaultSender,
    to: [to],
    subject: `Fee Payment Receipt - ${receiptNo} (${feeHead})`,
    html
  });
}

/**
 * Send automated attendance shortfall warning (< 75%)
 */
export async function sendAttendanceWarningEmail({ to, studentName, attendancePercentage }) {
  if (!resendApiKey) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 12px; background: #ffffff;">
      <div style="background: #dc2626; padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Attendance Shortfall Alert</h2>
        <p style="margin: 4px 0 0; color: #fecaca; font-size: 13px;">Academic Regulations Department</p>
      </div>
      <div style="padding: 24px 8px;">
        <p style="font-size: 15px; color: #334155;">Dear Parent / Student <strong>${studentName}</strong>,</p>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          Your current recorded attendance is 
          <span style="color: #dc2626; font-weight: 700; font-size: 16px;">${attendancePercentage}%</span>, 
          which is below the mandatory university threshold of <strong>75%</strong>.
        </p>
        <p style="font-size: 13px; color: #64748b;">
          Please contact your department Head of Department or Class Coordinator immediately to avoid exam hall ticket debarment.
        </p>
      </div>
    </div>
  `;

  return await resend.emails.send({
    from: defaultSender,
    to: [to],
    subject: `[Urgent] Attendance Shortfall Warning: ${studentName} (${attendancePercentage}%)`,
    html
  });
}

/**
 * Send onboarding login credentials to newly created user
 */
export async function sendWelcomeCredentialsEmail({ to, name, email, tempPassword, role }) {
  if (!resendApiKey) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #4f46e5; padding: 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">Welcome to Campus Portal</h2>
        <p style="margin: 4px 0 0; color: #c7d2fe; font-size: 13px;">Role: ${role.toUpperCase()}</p>
      </div>
      <div style="padding: 24px 8px;">
        <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #64748b;">Your account has been created on the Student Management System. Here are your credentials:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Please log in and update your password on first sign-in.</p>
      </div>
    </div>
  `;

  return await resend.emails.send({
    from: defaultSender,
    to: [to],
    subject: `Your Campus Portal Account Credentials`,
    html
  });
}

export default {
  resend,
  sendFeeReceiptEmail,
  sendAttendanceWarningEmail,
  sendWelcomeCredentialsEmail
};
