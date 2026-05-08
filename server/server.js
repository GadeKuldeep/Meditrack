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
connectDB();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'https://meditrack-e.netlify.app';
const allowedOrigins = [
  clientUrl,
  'https://meditrack-e.netlify.app',
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// ─── CORS must be applied BEFORE helmet and all other middleware ───
// This ensures CORS headers are set even when helmet rewrites security headers.
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly for all routes
app.options('*', cors(corsOptions));

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
// Render free tier spins down after inactivity. The frontend can ping
// this lightweight endpoint first to wake the server before real requests.
app.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));

// Rate limiting for auth
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
