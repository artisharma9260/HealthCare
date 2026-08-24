export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus = 'held' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type UrgencyLevel = 'Low' | 'Medium' | 'High';
export type LLMStatus = 'pending' | 'success' | 'failed' | 'unavailable';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface WorkingHours {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialisation: string;
  workingHours: WorkingHours[];
  slotDurationMinutes: number;
  leaveDays: string[];
  bio: string;
  avatarUrl?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
}

export interface Prescription {
  medicineName: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  instructions: string;
}

export interface PreVisitSummary {
  urgencyLevel: UrgencyLevel;
  chiefComplaint: string;
  suggestedQuestions: string[];
  generatedAt: string;
  llmStatus: LLMStatus;
  rawSymptoms?: string;
}

export interface PostVisitSummary {
  patientFriendlyText: string;
  medicationSchedule: string[];
  followUpSteps: string[];
  generatedAt: string;
  llmStatus: LLMStatus;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialisation: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  symptomForm?: {
    text: string;
    duration: string;
    severity: string;
    submittedAt: string;
  };
  preVisitSummary?: PreVisitSummary;
  postVisitNotes?: {
    clinicalNotes: string;
    prescription: Prescription[];
    submittedAt: string;
  };
  postVisitSummary?: PostVisitSummary;
  createdAt: string;
}

export interface SlotHold {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  patientId: string;
  expiresAt: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
