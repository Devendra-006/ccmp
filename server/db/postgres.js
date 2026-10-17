import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine SSL requirement: disabled for local Docker/localhost unless DATABASE_SSL=true
const dbUrl = process.env.DATABASE_URL || '';
const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('@postgres:') || dbUrl.includes('db:5432');
const useSsl = process.env.DATABASE_SSL === 'true' || (!isLocal && process.env.DATABASE_SSL !== 'false' && (dbUrl.includes('supabase') || dbUrl.includes('neon') || dbUrl.includes('aws')));

export const pool = new Pool({
  connectionString: dbUrl,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});

// Helper for running parameterized queries
export const query = (text, params) => pool.query(text, params);

export default pool;
