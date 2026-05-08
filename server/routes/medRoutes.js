import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getMedications, 
  createMedication, 
  updateMedication, 
  deleteMedication 
} from '../controllers/medController.js';

const router = express.Router();

router.route('/')
  .get(protect, getMedications)
  .post(protect, createMedication);

router.route('/:id')
  .put(protect, updateMedication)
  .delete(protect, deleteMedication);

export default router;
