import { pool } from '../db/postgres.js';
import { razorpayClient } from '../services/razorpay.js';
import { resend } from '../services/mailer.js';
import { supabaseAdmin } from '../db/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('====================================================');
console.log('CLOUD STUDENT MANAGEMENT SYSTEM - SERVICES INTEGRITY');
console.log('====================================================\n');

async function verifyAll() {
  let hasFailure = false;

  // 1. PostgreSQL
  try {
    const res = await pool.query('SELECT current_database(), version();');
    console.log('✅ 1. PostgreSQL Database: CONNECTED');
    console.log(`   Database: ${res.rows[0].current_database}`);
    console.log(`   Version:  ${res.rows[0].version.split(',')[0]}\n`);
  } catch (e) {
    console.error('❌ 1. PostgreSQL Database: FAILED', e.message, '\n');
    hasFailure = true;
  }

  // 2. Supabase Auth
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;
    console.log('✅ 2. Supabase Cloud Auth API: OPERATIONAL');
    console.log(`   Auth Users Managed: ${data.users.length}\n`);
  } catch (e) {
    console.error('❌ 2. Supabase Auth API: FAILED', e.message, '\n');
    hasFailure = true;
  }

  // 3. Razorpay Payment Gateway
  try {
    const order = await razorpayClient.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: `verify_${Date.now()}`
    });
    console.log('✅ 3. Razorpay Payment Gateway: ACTIVE (Test Mode)');
    console.log(`   Generated Order ID: ${order.id}\n`);
  } catch (e) {
    console.error('❌ 3. Razorpay Payment Gateway: FAILED', e.message, '\n');
    hasFailure = true;
  }

  // 4. Resend Transactional Email
  try {
    const domains = await resend.domains.list();
    console.log('✅ 4. Resend Email Service: OPERATIONAL');
    console.log(`   Sending Domain Status: Verified API connection\n`);
  } catch (e) {
    console.error('❌ 4. Resend Email Service: FAILED', e.message, '\n');
    hasFailure = true;
  }

  console.log('====================================================');
  if (hasFailure) {
    console.log('⚠️  One or more services reported warnings.');
    process.exit(1);
  } else {
    console.log('🚀 ALL 4 CLOUD SERVICES VERIFIED AND OPERATIONAL!');
    console.log('====================================================');
    process.exit(0);
  }
}

verifyAll();
