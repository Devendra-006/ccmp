import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import academicRoutes from './routes/academic.js';
import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import examRoutes from './routes/exams.js';
import feeRoutes from './routes/fees.js';
import noticeRoutes from './routes/notices.js';

import helmet from 'helmet';
import { pool } from './db/postgres.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Helmet for HTTP header protection
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS: Lock to client origin with fallback for development
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? clientUrl : true,
  credentials: true
}));

app.use(express.json());

// Free In-Memory Rate Limiting (No paid Redis required)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/auth attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// Cloud Container Health Probe & Observability (Liveness/Readiness Probe)
app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const mem = process.memoryUsage();
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'Cloud Student Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    memory: {
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024)
    }
  });
});

// Mount Routes under /api/v1 (PRD Section 7)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', academicRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1', examRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/notices', noticeRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

import { initializeDatabase } from './db/initDb.js';

app.listen(PORT, async () => {
  console.log(`[CSMS API] Server running on http://localhost:${PORT}`);
  console.log(`[CSMS API] REST API base path: http://localhost:${PORT}/api/v1`);
  try {
    await initializeDatabase();
  } catch (e) {
    console.error('[DB Startup Init Error]', e.message);
  }
});
