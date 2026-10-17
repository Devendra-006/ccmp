import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from './postgres.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  console.log('[DB Init] Checking and initializing database schema...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);

    // Ensure 'admin' is explicitly accepted in users table
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('super_admin', 'academic_admin', 'admin', 'teacher', 'student', 'parent', 'accountant'));
    `);

    // Check if initial admin account exists
    const adminCheck = await pool.query("SELECT id, email, role FROM users WHERE email = 'admin@campus.edu'");
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      const insertAdmin = await pool.query(
        `INSERT INTO users (email, password_hash, role, status) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, role`,
        ['admin@campus.edu', hashedPassword, 'admin', 'active']
      );
      console.log('✓ Initial Admin account seeded:', insertAdmin.rows[0].email, `(Role: admin)`);
    } else {
      console.log('✓ Admin account already exists:', adminCheck.rows[0].email);
    }

    console.log('✓ Database initialization complete.');
  } catch (err) {
    console.error('[DB Init Error]', err);
  }
}

// Standalone execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
