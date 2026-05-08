import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import medRoutes from './routes/medRoutes.js';
import doseRoutes from './routes/doseRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import caregiverRoutes from './routes/caregiverRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Services
import { initCronJobs } from './services/cronService.js';
import { initSocket } from './services/socketService.js';

dotenv.config();

// ─── Prevent silent crashes ──────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// ─── Validate critical env vars ──────────────────────────────────
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`⚠️  WARNING: Missing env var ${key}`);
  }
});

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://meditrack-e.netlify.app',
  'https://meditrack-e.netlify.app/',
  'http://localhost:5173',
].filter(Boolean);

// ─── Brute Force CORS Configuration ─────────────────────────────
app.use((req, res, next) => {
  // Never use '*' with credentials. Fallback to specific frontend URL.
  const origin = req.headers.origin || 'https://meditrack-e.netlify.app';
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '600'); // Cache preflight for 10 mins
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ─── Health / Wake-up endpoint ────────────────────────────────────
app.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));

// ─── Debug endpoint (TEMPORARY — remove after debugging) ─────────
app.get('/api/debug-env', (_req, res) => res.json({
  NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  MONGO_URI: process.env.MONGO_URI ? 'SET ✓' : 'MISSING ✗',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET ✓' : 'MISSING ✗',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'SET ✓' : 'MISSING ✗',
  CLIENT_URL: process.env.CLIENT_URL || 'NOT SET',
}));

// Rate limiting for auth
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'OPTIONS', // Don't rate limit preflight
});
app.use('/api/auth', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medRoutes);
app.use('/api/doses', doseRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Initialize Cron Jobs
initCronJobs(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
