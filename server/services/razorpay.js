import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpayClient = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Create a new Razorpay Order for student fee payments
 * @param {Object} params
 * @param {number} params.amountInPaise - e.g. 50000 for 500.00 INR
 * @param {string} params.receipt - internal receipt/due reference
 * @param {Object} [params.notes] - optional metadata
 */
export async function createRazorpayOrder({ amountInPaise, receipt, notes = {} }) {
  if (!amountInPaise || amountInPaise <= 0) {
    throw new Error('Invalid payment amount in paise');
  }

  const options = {
    amount: Math.round(amountInPaise),
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    notes
  };

  return await razorpayClient.orders.create(options);
}

/**
 * Verify Razorpay payment signature after frontend checkout
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @returns {boolean}
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

export default razorpayClient;
