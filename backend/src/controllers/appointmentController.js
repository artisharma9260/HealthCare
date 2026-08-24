import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import SlotHold from '../models/SlotHold.js';
import Notification from '../models/Notification.js';

// GET /api/appointments  (admin only - all appointments)
export async function getAppointments(req, res) {
  const appointments = await Appointment.find().sort({ date: -1 });
  return res.json(appointments.map((a) => a.toPublicJSON()));
}

// GET /api/appointments/:id
export async function getAppointmentById(req, res) {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// GET /api/appointments/patient/:patientId
export async function getPatientAppointments(req, res) {
  const appointments = await Appointment.find({ patientId: req.params.patientId }).sort({ date: -1 });
  return res.json(appointments.map((a) => a.toPublicJSON()));
}

// GET /api/appointments/doctor/:doctorId
export async function getDoctorAppointments(req, res) {
  const appointments = await Appointment.find({ doctorId: req.params.doctorId }).sort({ date: -1 });
  return res.json(appointments.map((a) => a.toPublicJSON()));
}

// GET /api/appointments/doctor/:doctorId/date/:date
export async function getDoctorAppointmentsByDate(req, res) {
  const appointments = await Appointment.find({
    doctorId: req.params.doctorId,
    date: req.params.date,
  }).sort({ startTime: 1 });
  return res.json(appointments.map((a) => a.toPublicJSON()));
}

// POST /api/appointments/confirm
// body: { doctorId, date, startTime, endTime, patientName, doctorName, doctorSpecialisation }
// Uses the authenticated patient's id as patientId.
export async function confirmAppointment(req, res) {
  const { doctorId, date, startTime, endTime, patientName, doctorName, doctorSpecialisation } = req.body;
  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'doctorId, date, startTime and endTime are required.' });
  }

  // Release any hold on this exact slot (including our own) before booking
  await SlotHold.deleteOne({ doctorId, date, startTime });

  try {
    const appointment = await Appointment.create({
      patientId: req.user._id,
      patientName: patientName || req.user.username,
      doctorId,
      doctorName,
      doctorSpecialisation,
      date,
      startTime,
      endTime,
      status: 'confirmed',
    });
    return res.status(201).json(appointment.toPublicJSON());
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to confirm appointment.' });
  }
}

// PATCH /api/appointments/:id/cancel
export async function cancelAppointment(req, res) {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// PATCH /api/appointments/:id/symptoms
// body: { text, duration, severity }
export async function submitSymptomForm(req, res) {
  const { text, duration, severity } = req.body;
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { symptomForm: { text, duration, severity, submittedAt: new Date().toISOString() } },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// PATCH /api/appointments/:id/pre-visit-summary
export async function savePreVisitSummary(req, res) {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { preVisitSummary: req.body },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// PATCH /api/appointments/:id/post-visit-notes
// body: { clinicalNotes, prescription }
export async function submitPostVisitNotes(req, res) {
  const { clinicalNotes, prescription } = req.body;
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      postVisitNotes: { clinicalNotes, prescription: prescription || [], submittedAt: new Date().toISOString() },
      status: 'completed',
    },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// PATCH /api/appointments/:id/post-visit-summary
export async function savePostVisitSummary(req, res) {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { postVisitSummary: req.body },
    { new: true }
  );
  if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
  return res.json(appointment.toPublicJSON());
}

// ── Slot Holds ────────────────────────────────────────────────────────────

// POST /api/appointments/slot-holds
// body: { doctorId, date, startTime, endTime }
export async function createSlotHold(req, res) {
  const { doctorId, date, startTime, endTime } = req.body;
  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'doctorId, date, startTime and endTime are required.' });
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Remove this slot's hold if it has already expired (MongoDB's TTL cleanup
  // runs on a background sweep every ~60s, so we also clean up eagerly here).
  const existing = await SlotHold.findOne({ doctorId, date, startTime });
  if (existing && existing.expiresAt <= new Date()) {
    await SlotHold.deleteOne({ _id: existing._id });
  } else if (existing && existing.patientId.toString() !== req.user._id.toString()) {
    return res.status(409).json({ message: 'Slot already held by another user. Please choose a different time.' });
  }

  try {
    const hold = await SlotHold.findOneAndUpdate(
      { doctorId, date, startTime },
      { doctorId, patientId: req.user._id, date, startTime, endTime, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json({
      doctorId: hold.doctorId.toString(),
      patientId: hold.patientId.toString(),
      date: hold.date,
      startTime: hold.startTime,
      endTime: hold.endTime,
      expiresAt: hold.expiresAt.getTime(),
    });
  } catch (err) {
    // Unique index violation - someone else grabbed the slot in a race
    return res.status(409).json({ message: 'Slot already held by another user. Please choose a different time.' });
  }
}

// DELETE /api/appointments/slot-holds
// body: { doctorId, date, startTime }
export async function clearSlotHold(req, res) {
  const { doctorId, date, startTime } = req.body;
  await SlotHold.deleteOne({ doctorId, date, startTime, patientId: req.user._id });
  return res.status(204).send();
}

// ── Slot Generation ──────────────────────────────────────────────────────

// GET /api/appointments/slots/:doctorId/:date
export async function generateTimeSlots(req, res) {
  const { doctorId, date } = req.params;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

  const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long' });
  const wh = doctor.workingHours.find((w) => w.day === dayName);
  if (!wh || doctor.leaveDays.includes(date)) {
    return res.json([]);
  }

  const bookedAppts = await Appointment.find({ doctorId, date, status: { $ne: 'cancelled' } });
  const bookedTimes = new Set(bookedAppts.map((a) => a.startTime));

  const activeHolds = await SlotHold.find({ doctorId, date, expiresAt: { $gt: new Date() } });
  const heldTimes = new Set(activeHolds.map((h) => h.startTime));

  const slots = [];
  let [h, m] = wh.startTime.split(':').map(Number);
  const [eh, em] = wh.endTime.split(':').map(Number);
  const endMins = eh * 60 + em;

  while (h * 60 + m + doctor.slotDurationMinutes <= endMins) {
    const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const endM = m + doctor.slotDurationMinutes;
    const endH = h + Math.floor(endM / 60);
    const endMin = endM % 60;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    slots.push({
      startTime: startStr,
      endTime: endStr,
      available: !bookedTimes.has(startStr) && !heldTimes.has(startStr),
    });
    m += doctor.slotDurationMinutes;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m %= 60;
    }
  }
  return res.json(slots);
}

// ── Notifications ────────────────────────────────────────────────────────

// POST /api/appointments/notifications
// body: { appointmentId, recipientId, type, payload }
export async function createNotification(req, res) {
  const { appointmentId, recipientId, type, payload } = req.body;
  const notification = await Notification.create({
    appointmentId: appointmentId || null,
    recipientId: recipientId || null,
    type,
    channel: 'email',
    status: 'pending',
    payload: payload || {},
  });
  return res.status(201).json(notification);
}

// GET /api/appointments/notifications/:recipientId
export async function getNotifications(req, res) {
  const notifications = await Notification.find({ recipientId: req.params.recipientId }).sort({ createdAt: -1 });
  return res.json(notifications);
}
