import { apiRequest } from '@/lib/api';
import type { DoctorProfile } from '@/types';

export async function getDoctors(): Promise<DoctorProfile[]> {
  return apiRequest<DoctorProfile[]>('/doctors');
}

export async function getDoctorById(id: string): Promise<DoctorProfile | null> {
  try {
    return await apiRequest<DoctorProfile>(`/doctors/${id}`);
  } catch {
    return null;
  }
}

export async function getDoctorByUserId(userId: string): Promise<DoctorProfile | null> {
  try {
    return await apiRequest<DoctorProfile>(`/doctors/by-user/${userId}`);
  } catch {
    return null;
  }
}

export async function createDoctor(doctor: Omit<DoctorProfile, 'id' | 'userId'>): Promise<DoctorProfile> {
  return apiRequest<DoctorProfile>('/doctors', { method: 'POST', body: doctor });
}

export async function updateDoctor(
  id: string,
  updates: Partial<Omit<DoctorProfile, 'id' | 'userId'>>
): Promise<DoctorProfile> {
  return apiRequest<DoctorProfile>(`/doctors/${id}`, { method: 'PATCH', body: updates });
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiRequest<void>(`/doctors/${id}`, { method: 'DELETE' });
}

export async function markDoctorLeave(doctorId: string, dates: string[]): Promise<void> {
  await apiRequest<DoctorProfile>(`/doctors/${doctorId}/leave`, { method: 'POST', body: { dates } });
}

export async function removeDoctorLeave(doctorId: string, date: string): Promise<void> {
  await apiRequest<DoctorProfile>(`/doctors/${doctorId}/leave/${date}`, { method: 'DELETE' });
}
