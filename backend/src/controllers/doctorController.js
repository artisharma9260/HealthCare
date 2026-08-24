import Doctor from '../models/Doctor.js';

// GET /api/doctors
export async function getDoctors(req, res) {
  const doctors = await Doctor.find({ isActive: true }).sort({ name: 1 });
  return res.json(doctors.map((d) => d.toPublicJSON()));
}

// GET /api/doctors/:id
export async function getDoctorById(req, res) {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
  return res.json(doctor.toPublicJSON());
}

// GET /api/doctors/by-user/:userId
export async function getDoctorByUserId(req, res) {
  const doctor = await Doctor.findOne({ userId: req.params.userId });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found.' });
  return res.json(doctor.toPublicJSON());
}

// POST /api/doctors  (admin only)
export async function createDoctor(req, res) {
  const { name, email, specialisation, bio, slotDurationMinutes, leaveDays, workingHours, avatarUrl } = req.body;
  if (!name || !email || !specialisation) {
    return res.status(400).json({ message: 'name, email and specialisation are required.' });
  }
  const doctor = await Doctor.create({
    name,
    email,
    specialisation,
    bio: bio || '',
    slotDurationMinutes: slotDurationMinutes || 30,
    leaveDays: leaveDays || [],
    workingHours: workingHours || [],
    avatarUrl: avatarUrl || null,
  });
  return res.status(201).json(doctor.toPublicJSON());
}

// PATCH /api/doctors/:id  (admin only)
export async function updateDoctor(req, res) {
  const allowed = ['name', 'email', 'specialisation', 'bio', 'slotDurationMinutes', 'leaveDays', 'workingHours', 'avatarUrl'];
  const payload = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
  return res.json(doctor.toPublicJSON());
}

// DELETE /api/doctors/:id  (admin only, soft delete)
export async function deleteDoctor(req, res) {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
  return res.status(204).send();
}

// POST /api/doctors/:id/leave  (admin only) - body: { dates: string[] }
export async function markDoctorLeave(req, res) {
  const { dates } = req.body;
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
  const existing = new Set(doctor.leaveDays);
  (dates || []).forEach((d) => existing.add(d));
  doctor.leaveDays = Array.from(existing);
  await doctor.save();
  return res.json(doctor.toPublicJSON());
}

// DELETE /api/doctors/:id/leave/:date  (admin only)
export async function removeDoctorLeave(req, res) {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
  doctor.leaveDays = doctor.leaveDays.filter((d) => d !== req.params.date);
  await doctor.save();
  return res.json(doctor.toPublicJSON());
}
