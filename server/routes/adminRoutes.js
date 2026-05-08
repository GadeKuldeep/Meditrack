import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

export default router;
