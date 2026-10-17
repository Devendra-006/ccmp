import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- Testing Razorpay API Credentials ---');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testRazorpay() {
  try {
    const options = {
      amount: 50000, // 500.00 INR in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      notes: {
        system: 'Cloud-Based Student Management System',
        test: 'Credential Verification'
      }
    };

    console.log('Calling Razorpay Orders API...');
    const order = await razorpay.orders.create(options);
    console.log('✓ Razorpay API keys are AUTHENTIC and WORKING!');
    console.log(`  Order ID generated: ${order.id}`);
    console.log(`  Order Status: ${order.status}`);
    console.log(`  Currency: ${order.currency}`);
    console.log(`  Amount (in paise): ${order.amount}`);
  } catch (err) {
    console.error('Razorpay verification error:', err);
  }
}

testRazorpay();
