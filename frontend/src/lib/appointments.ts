import type { Appointment, SlotHold, TimeSlot, DoctorProfile } from '@/types';
import { INITIAL_APPOINTMENTS } from './mockData';

const APPOINTMENTS_KEY = 'hcam_appointments';
const HOLD_KEY = 'hcam_slot_hold';
const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function getAppointments(): Appointment[] {
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  if (!stored) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  return JSON.parse(stored);
}

export function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

export function getAppointmentById(id: string): Appointment | null {
  return getAppointments().find(a => a.id === id) || null;
}

export function getPatientAppointments(patientId: string): Appointment[] {
  return getAppointments().filter(a => a.patientId === patientId);
}

export function getDoctorAppointments(doctorId: string): Appointment[] {
  return getAppointments().filter(a => a.doctorId === doctorId);
}

export function getDoctorAppointmentsByDate(doctorId: string, date: string): Appointment[] {
  return getAppointments().filter(a => a.doctorId === doctorId && a.date === date);
}

export function createSlotHold(hold: Omit<SlotHold, 'expiresAt'>): SlotHold {
  const fullHold: SlotHold = {
    ...hold,
    expiresAt: Date.now() + HOLD_DURATION_MS,
  };
  localStorage.setItem(HOLD_KEY, JSON.stringify(fullHold));
  return fullHold;
}

export function getSlotHold(): SlotHold | null {
  const stored = localStorage.getItem(HOLD_KEY);
  if (!stored) return null;
  const hold: SlotHold = JSON.parse(stored);
  if (Date.now() > hold.expiresAt) {
    localStorage.removeItem(HOLD_KEY);
    return null;
  }
  return hold;
}

export function clearSlotHold() {
  localStorage.removeItem(HOLD_KEY);
}

export function confirmAppointment(hold: SlotHold, patientName: string, doctorName: string, doctorSpecialisation: string): Appointment {
  const appointment: Appointment = {
    id: `a_${Date.now()}`,
    patientId: hold.patientId,
    patientName,
    doctorId: hold.doctorId,
    doctorName,
    doctorSpecialisation,
    date: hold.date,
    startTime: hold.startTime,
    endTime: hold.endTime,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  const appointments = getAppointments();
  saveAppointments([...appointments, appointment]);
  clearSlotHold();
  return appointment;
}

export function cancelAppointment(appointmentId: string): boolean {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx === -1) return false;
  appointments[idx] = { ...appointments[idx], status: 'cancelled' };
  saveAppointments(appointments);
  return true;
}

export function submitSymptomForm(
  appointmentId: string,
  symptoms: { text: string; duration: string; severity: string }
): Appointment | null {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx === -1) return null;
  appointments[idx] = {
    ...appointments[idx],
    symptomForm: { ...symptoms, submittedAt: new Date().toISOString() },
  };
  saveAppointments(appointments);
  return appointments[idx];
}

export function savePreVisitSummary(appointmentId: string, summary: Appointment['preVisitSummary']): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx !== -1) {
    appointments[idx] = { ...appointments[idx], preVisitSummary: summary };
    saveAppointments(appointments);
  }
}

export function submitPostVisitNotes(
  appointmentId: string,
  notes: NonNullable<Appointment['postVisitNotes']>
): Appointment | null {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx === -1) return null;
  appointments[idx] = {
    ...appointments[idx],
    postVisitNotes: notes,
    status: 'completed',
  };
  saveAppointments(appointments);
  return appointments[idx];
}

export function savePostVisitSummary(appointmentId: string, summary: Appointment['postVisitSummary']): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx !== -1) {
    appointments[idx] = { ...appointments[idx], postVisitSummary: summary };
    saveAppointments(appointments);
  }
}

export function markAppointmentCompleted(appointmentId: string): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx !== -1) {
    appointments[idx] = { ...appointments[idx], status: 'completed' };
    saveAppointments(appointments);
  }
}

export function generateTimeSlots(doctor: DoctorProfile, date: string): TimeSlot[] {
  const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
  const wh = doctor.workingHours.find(w => w.day === dayName);
  if (!wh || doctor.leaveDays.includes(date)) return [];

  const slots: TimeSlot[] = [];
  const bookedAppts = getDoctorAppointmentsByDate(doctor.id, date).filter(a => a.status !== 'cancelled');
  const bookedTimes = new Set(bookedAppts.map(a => a.startTime));

  let [h, m] = wh.startTime.split(':').map(Number);
  const [eh, em] = wh.endTime.split(':').map(Number);
  const endMins = eh * 60 + em;

  while (h * 60 + m + doctor.slotDurationMinutes <= endMins) {
    const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const endM = m + doctor.slotDurationMinutes;
    const endH = h + Math.floor(endM / 60);
    const endMin = endM % 60;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    slots.push({ startTime: startStr, endTime: endStr, available: !bookedTimes.has(startStr) });
    m += doctor.slotDurationMinutes;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}
