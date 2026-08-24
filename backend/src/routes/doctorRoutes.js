import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorByUserId,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  markDoctorLeave,
  removeDoctorLeave,
} from '../controllers/doctorController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getDoctors));
router.get('/by-user/:userId', asyncHandler(getDoctorByUserId));
router.get('/:id', asyncHandler(getDoctorById));

router.post('/', protect, requireRole('admin'), asyncHandler(createDoctor));
router.patch('/:id', protect, requireRole('admin'), asyncHandler(updateDoctor));
router.delete('/:id', protect, requireRole('admin'), asyncHandler(deleteDoctor));
router.post('/:id/leave', protect, requireRole('admin'), asyncHandler(markDoctorLeave));
router.delete('/:id/leave/:date', protect, requireRole('admin'), asyncHandler(removeDoctorLeave));

export default router;
