import { apiRequest } from '@/lib/api';
import type { Appointment, SlotHold, TimeSlot, DoctorProfile } from '@/types';

// ── Appointments ──────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  return apiRequest<Appointment[]>('/appointments');
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    return await apiRequest<Appointment>(`/appointments/${id}`);
  } catch {
    return null;
  }
}

export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>(`/appointments/patient/${patientId}`);
}

export async function getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}`);
}

export async function getDoctorAppointmentsByDate(doctorId: string, date: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>(`/appointments/doctor/${doctorId}/date/${date}`);
}

export async function confirmAppointment(
  hold: SlotHold,
  patientName: string,
  doctorName: string,
  doctorSpecialisation: string
): Promise<Appointment> {
  return apiRequest<Appointment>('/appointments/confirm', {
    method: 'POST',
    body: {
      doctorId: hold.doctorId,
      date: hold.date,
      startTime: hold.startTime,
      endTime: hold.endTime,
      patientName,
      doctorName,
      doctorSpecialisation,
    },
  });
}

export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  try {
    await apiRequest<Appointment>(`/appointments/${appointmentId}/cancel`, { method: 'PATCH' });
    return true;
  } catch {
    return false;
  }
}

export async function submitSymptomForm(
  appointmentId: string,
  symptoms: { text: string; duration: string; severity: string }
): Promise<Appointment | null> {
  try {
    return await apiRequest<Appointment>(`/appointments/${appointmentId}/symptoms`, {
      method: 'PATCH',
      body: symptoms,
    });
  } catch {
    return null;
  }
}

export async function savePreVisitSummary(appointmentId: string, summary: Appointment['preVisitSummary']): Promise<void> {
  await apiRequest<Appointment>(`/appointments/${appointmentId}/pre-visit-summary`, {
    method: 'PATCH',
    body: summary,
  });
}

export async function submitPostVisitNotes(
  appointmentId: string,
  notes: NonNullable<Appointment['postVisitNotes']>
): Promise<Appointment | null> {
  try {
    return await apiRequest<Appointment>(`/appointments/${appointmentId}/post-visit-notes`, {
      method: 'PATCH',
      body: notes,
    });
  } catch {
    return null;
  }
}

export async function savePostVisitSummary(appointmentId: string, summary: Appointment['postVisitSummary']): Promise<void> {
  await apiRequest<Appointment>(`/appointments/${appointmentId}/post-visit-summary`, {
    method: 'PATCH',
    body: summary,
  });
}

// ── Slot Holds ────────────────────────────────────────────────────────────────

export async function createSlotHold(hold: Omit<SlotHold, 'expiresAt'>): Promise<SlotHold> {
  return apiRequest<SlotHold>('/appointments/slot-holds', {
    method: 'POST',
    body: {
      doctorId: hold.doctorId,
      date: hold.date,
      startTime: hold.startTime,
      endTime: hold.endTime,
    },
  });
}

export async function clearSlotHold(doctorId: string, date: string, startTime: string, _patientId: string): Promise<void> {
  await apiRequest<void>('/appointments/slot-holds', {
    method: 'DELETE',
    body: { doctorId, date, startTime },
  });
}

// ── Slot Generation ───────────────────────────────────────────────────────────

export async function generateTimeSlots(doctor: DoctorProfile, date: string): Promise<TimeSlot[]> {
  return apiRequest<TimeSlot[]>(`/appointments/slots/${doctor.id}/${date}`);
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function createNotification(notification: {
  appointmentId: string;
  recipientId: string;
  type: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await apiRequest('/appointments/notifications', { method: 'POST', body: notification });
}

export async function getNotifications(recipientId: string) {
  return apiRequest(`/appointments/notifications/${recipientId}`);
}
