import type { DoctorProfile } from '@/types';
import { MOCK_DOCTORS } from './mockData';

const DOCTORS_KEY = 'hcam_doctors';

export function getDoctors(): DoctorProfile[] {
  const stored = localStorage.getItem(DOCTORS_KEY);
  if (!stored) {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(MOCK_DOCTORS));
    return MOCK_DOCTORS;
  }
  return JSON.parse(stored);
}

export function saveDoctors(doctors: DoctorProfile[]) {
  localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
}

export function getDoctorById(id: string): DoctorProfile | null {
  return getDoctors().find(d => d.id === id) || null;
}

export function getDoctorByUserId(userId: string): DoctorProfile | null {
  return getDoctors().find(d => d.userId === userId) || null;
}

export function updateDoctor(updated: DoctorProfile): void {
  const doctors = getDoctors();
  const idx = doctors.findIndex(d => d.id === updated.id);
  if (idx !== -1) {
    doctors[idx] = updated;
    saveDoctors(doctors);
  }
}

export function addDoctor(doctor: DoctorProfile): void {
  const doctors = getDoctors();
  saveDoctors([...doctors, doctor]);
}

export function deleteDoctor(id: string): void {
  const doctors = getDoctors().filter(d => d.id !== id);
  saveDoctors(doctors);
}

export function markDoctorLeave(doctorId: string, dates: string[]): void {
  const doctors = getDoctors();
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx !== -1) {
    const existing = new Set(doctors[idx].leaveDays);
    dates.forEach(d => existing.add(d));
    doctors[idx] = { ...doctors[idx], leaveDays: Array.from(existing) };
    saveDoctors(doctors);
  }
}

export function removeDoctorLeave(doctorId: string, date: string): void {
  const doctors = getDoctors();
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx !== -1) {
    doctors[idx] = { ...doctors[idx], leaveDays: doctors[idx].leaveDays.filter(d => d !== date) };
    saveDoctors(doctors);
  }
}
