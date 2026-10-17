import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

export async function migrate() {
  console.log('--- Initializing Database Schema Migration on PostgreSQL ---');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('✓ schema.sql executed successfully!');

    // Verify all created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified tables created in public schema:');
    res.rows.forEach(r => console.log(`  - ${r.table_name}`));

    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}
