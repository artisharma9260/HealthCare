import type { DoctorProfile, Appointment } from '@/types';

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'd1',
    userId: 'u_d1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@clinic.com',
    specialisation: 'Cardiology',
    bio: 'Board-certified cardiologist with 12 years of experience in preventive care and heart disease management.',
    slotDurationMinutes: 30,
    leaveDays: [],
    workingHours: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '15:00' },
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'd2',
    userId: 'u_d2',
    name: 'Dr. Marcus Reid',
    email: 'marcus.reid@clinic.com',
    specialisation: 'Neurology',
    bio: 'Specialist in neurological disorders, migraine management, and cognitive health. Research focus on early Alzheimer detection.',
    slotDurationMinutes: 45,
    leaveDays: [],
    workingHours: [
      { day: 'Monday', startTime: '10:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Friday', startTime: '10:00', endTime: '16:00' },
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'd3',
    userId: 'u_d3',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@clinic.com',
    specialisation: 'Dermatology',
    bio: 'Dermatologist specialising in skin cancer detection, eczema, and cosmetic dermatology. Gentle, patient-first approach.',
    slotDurationMinutes: 20,
    leaveDays: [],
    workingHours: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00' },
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'd4',
    userId: 'u_d4',
    name: 'Dr. James Okafor',
    email: 'james.okafor@clinic.com',
    specialisation: 'General Practice',
    bio: 'Experienced GP with a holistic approach to patient care. Focuses on preventive medicine and chronic disease management.',
    slotDurationMinutes: 20,
    leaveDays: [],
    workingHours: [
      { day: 'Monday', startTime: '08:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'Friday', startTime: '08:00', endTime: '17:00' },
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&auto=format',
  },
  {
    id: 'd5',
    userId: 'u_d5',
    name: 'Dr. Elena Vasquez',
    email: 'elena.vasquez@clinic.com',
    specialisation: 'Paediatrics',
    bio: 'Dedicated paediatrician with expertise in developmental health, childhood immunisations, and adolescent medicine.',
    slotDurationMinutes: 30,
    leaveDays: [],
    workingHours: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '15:00' },
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&auto=format',
  },
];

export const SPECIALISATIONS = [
  'All Specialisations',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'General Practice',
  'Paediatrics',
  'Orthopaedics',
  'Psychiatry',
  'Oncology',
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientId: 'u_p1',
    patientName: 'Alex Johnson',
    doctorId: 'd1',
    doctorName: 'Dr. Sarah Chen',
    doctorSpecialisation: 'Cardiology',
    date: '2026-08-25',
    startTime: '10:00',
    endTime: '10:30',
    status: 'confirmed',
    symptomForm: {
      text: 'Experiencing occasional chest tightness and shortness of breath after light exercise. Symptoms have been present for about 3 weeks.',
      duration: '3 weeks',
      severity: '4',
      submittedAt: '2026-08-23T10:00:00Z',
    },
    preVisitSummary: {
      urgencyLevel: 'Medium',
      chiefComplaint: 'Exertional chest tightness with dyspnoea',
      suggestedQuestions: [
        'Does the chest tightness radiate to your arm or jaw?',
        'Do you have a family history of heart disease?',
        'Have you noticed any swelling in your ankles or feet?',
      ],
      generatedAt: '2026-08-23T10:05:00Z',
      llmStatus: 'success',
    },
    createdAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'a2',
    patientId: 'u_p1',
    patientName: 'Alex Johnson',
    doctorId: 'd4',
    doctorName: 'Dr. James Okafor',
    doctorSpecialisation: 'General Practice',
    date: '2026-08-15',
    startTime: '09:00',
    endTime: '09:20',
    status: 'completed',
    symptomForm: {
      text: 'Annual check-up. General fatigue and low energy levels for the past month.',
      duration: '1 month',
      severity: '3',
      submittedAt: '2026-08-14T09:00:00Z',
    },
    preVisitSummary: {
      urgencyLevel: 'Low',
      chiefComplaint: 'Fatigue and low energy — annual review',
      suggestedQuestions: [
        'Have your sleep patterns changed recently?',
        'Any changes to your diet or exercise routine?',
        'Are you under more stress than usual?',
      ],
      generatedAt: '2026-08-14T09:05:00Z',
      llmStatus: 'success',
    },
    postVisitNotes: {
      clinicalNotes: 'Patient presents with generalised fatigue. CBC slightly low ferritin. No significant cardiac or respiratory findings. Recommend iron supplementation and follow-up in 6 weeks.',
      prescription: [
        {
          medicineName: 'Ferrous Sulfate',
          dosage: '200mg',
          frequencyPerDay: 1,
          durationDays: 42,
          instructions: 'Take on an empty stomach with a glass of water. Avoid dairy 1 hour before and after.',
        },
      ],
      submittedAt: '2026-08-15T09:25:00Z',
    },
    postVisitSummary: {
      patientFriendlyText: "Your appointment went well. Your blood tests showed that your iron levels are a little low — this is likely the cause of the fatigue you've been feeling. The good news is that this is very manageable with a simple supplement.",
      medicationSchedule: [
        'Ferrous Sulfate 200mg — once daily in the morning on an empty stomach',
        'Avoid tea, coffee, and dairy within 1 hour of taking the tablet',
      ],
      followUpSteps: [
        'Return for a repeat blood test in 6 weeks to check iron levels',
        'Aim for 7–8 hours of sleep per night',
        'Consider adding iron-rich foods: leafy greens, lean red meat, lentils',
      ],
      generatedAt: '2026-08-15T09:30:00Z',
      llmStatus: 'success',
    },
    createdAt: '2026-08-10T11:00:00Z',
  },
];

export const AI_SUMMARY_RESPONSES: Record<string, {
  urgencyLevel: 'Low' | 'Medium' | 'High';
  chiefComplaint: string;
  suggestedQuestions: string[];
}> = {
  default: {
    urgencyLevel: 'Low',
    chiefComplaint: 'Patient-reported symptoms requiring clinical evaluation',
    suggestedQuestions: [
      'When did you first notice these symptoms?',
      'Have these symptoms affected your daily activities?',
      'Have you tried any over-the-counter remedies?',
    ],
  },
  chest: {
    urgencyLevel: 'High',
    chiefComplaint: 'Chest pain with possible cardiac involvement',
    suggestedQuestions: [
      'Does the pain radiate to your left arm, jaw, or back?',
      'Do you experience shortness of breath alongside the pain?',
      'Have you had any similar episodes in the past?',
    ],
  },
  headache: {
    urgencyLevel: 'Medium',
    chiefComplaint: 'Recurrent headaches — possible tension or migrainous aetiology',
    suggestedQuestions: [
      'How would you describe the character of the headache (throbbing, pressure, stabbing)?',
      'Do you experience any visual disturbances before or during the headache?',
      'What makes the headache better or worse?',
    ],
  },
  fatigue: {
    urgencyLevel: 'Low',
    chiefComplaint: 'Persistent fatigue — possible haematological or thyroid cause',
    suggestedQuestions: [
      'Have your sleep patterns changed recently?',
      'Have you noticed any unexplained weight changes?',
      'Do you experience cold intolerance or hair loss?',
    ],
  },
};
