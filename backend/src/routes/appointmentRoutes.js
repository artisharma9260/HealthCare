import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  getDoctorAppointmentsByDate,
  confirmAppointment,
  cancelAppointment,
  submitSymptomForm,
  savePreVisitSummary,
  submitPostVisitNotes,
  savePostVisitSummary,
  createSlotHold,
  clearSlotHold,
  generateTimeSlots,
  createNotification,
  getNotifications,
} from '../controllers/appointmentController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All appointment routes require an authenticated user.
router.use(protect);

router.get('/', requireRole('admin'), asyncHandler(getAppointments));
router.get('/patient/:patientId', asyncHandler(getPatientAppointments));
router.get('/doctor/:doctorId', asyncHandler(getDoctorAppointments));
router.get('/doctor/:doctorId/date/:date', asyncHandler(getDoctorAppointmentsByDate));
router.get('/slots/:doctorId/:date', asyncHandler(generateTimeSlots));

router.post('/slot-holds', asyncHandler(createSlotHold));
router.delete('/slot-holds', asyncHandler(clearSlotHold));

router.post('/confirm', asyncHandler(confirmAppointment));
router.patch('/:id/cancel', asyncHandler(cancelAppointment));
router.patch('/:id/symptoms', asyncHandler(submitSymptomForm));
router.patch('/:id/pre-visit-summary', asyncHandler(savePreVisitSummary));
router.patch('/:id/post-visit-notes', asyncHandler(submitPostVisitNotes));
router.patch('/:id/post-visit-summary', asyncHandler(savePostVisitSummary));

router.post('/notifications', asyncHandler(createNotification));
router.get('/notifications/:recipientId', asyncHandler(getNotifications));

router.get('/:id', asyncHandler(getAppointmentById));

export default router;
