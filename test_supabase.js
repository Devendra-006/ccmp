import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

console.log('--- 1. Testing Supabase REST & Auth API ---');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSupabase() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Supabase Auth API error:', error.message);
    } else {
      console.log('✓ Supabase Auth & Service Role Key is WORKING!');
      console.log(`  Current users count in Auth: ${data.users.length}`);
    }
  } catch (err) {
    console.error('Supabase client error:', err.message);
  }

  console.log('\n--- 2. Testing Direct PostgreSQL Database Connection ---');
  // Try password as provided (without brackets)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Direct PostgreSQL connection SUCCESSFUL!');
    const res = await client.query('SELECT current_database(), version();');
    console.log(`  Connected database: ${res.rows[0].current_database}`);
    console.log(`  Version: ${res.rows[0].version.split(',')[0]}`);
    await client.end();
  } catch (err) {
    console.error('Direct PostgreSQL error:', err.message);
  }
}

testSupabase();
