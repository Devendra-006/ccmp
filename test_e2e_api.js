import { pool } from './server/db/postgres.js';
import bcrypt from 'bcryptjs';

console.log('--- E2E System Test: Database, Auth & Services ---');

async function runTest() {
  try {
    // 1. Verify Database connectivity and admin account
    console.log('1. Checking PostgreSQL live database...');
    const userRes = await pool.query('SELECT id, email, role, status, password_hash FROM users WHERE email = $1', ['admin@campus.edu']);
    if (userRes.rows.length === 0) {
      throw new Error('Admin user not found in database');
    }
    const admin = userRes.rows[0];
    console.log(`✓ Admin user confirmed in database: ${admin.email} (Role: ${admin.role})`);

    // 2. Test bcrypt verification
    const isMatch = await bcrypt.compare('Admin@123', admin.password_hash);
    if (!isMatch) throw new Error('Password mismatch for Admin@123');
    console.log('✓ Password hash verified with bcrypt successfully');

    // 3. Test creating a sample department in live Supabase PostgreSQL
    console.log('2. Testing PostgreSQL INSERT & SELECT...');
    const testCode = `TEST_${Date.now().toString().slice(-4)}`;
    const insertDept = await pool.query(
      'INSERT INTO departments (code, name) VALUES ($1, $2) RETURNING *',
      [testCode, 'Test Engineering Department']
    );
    console.log(`✓ Department inserted into live PostgreSQL: ${insertDept.rows[0].name} (${insertDept.rows[0].code})`);

    // Fetch departments
    const depts = await pool.query('SELECT count(*) FROM departments');
    console.log(`✓ Total departments in database: ${depts.rows[0].count}`);

    // Clean up test department
    await pool.query('DELETE FROM departments WHERE id = $1', [insertDept.rows[0].id]);
    console.log('✓ Cleaned up test record cleanly.');

    console.log('\n========================================');
    console.log('ALL SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('========================================');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTest();
