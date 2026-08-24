import type { PreVisitSummary, PostVisitSummary, LLMStatus, UrgencyLevel, Prescription } from '@/types';
import { AI_SUMMARY_RESPONSES } from './mockData';

function detectKeyword(text: string): keyof typeof AI_SUMMARY_RESPONSES {
  const lower = text.toLowerCase();
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation')) return 'chest';
  if (lower.includes('headache') || lower.includes('migraine') || lower.includes('head pain')) return 'headache';
  if (lower.includes('fatigue') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('energy')) return 'fatigue';
  return 'default';
}

function adjustUrgency(base: UrgencyLevel, severity: string): UrgencyLevel {
  const sev = parseInt(severity);
  if (isNaN(sev)) return base;
  if (sev >= 8) {
    if (base === 'Low') return 'Medium';
    if (base === 'Medium') return 'High';
    return 'High';
  }
  if (sev <= 2) {
    if (base === 'High') return 'Medium';
    if (base === 'Medium') return 'Low';
    return 'Low';
  }
  return base;
}

export async function generatePreVisitSummary(
  symptoms: string,
  severity: string,
  _duration: string
): Promise<PreVisitSummary> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1800));

  // Simulate occasional failure (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('LLM service temporarily unavailable');
  }

  const key = detectKeyword(symptoms);
  const template = AI_SUMMARY_RESPONSES[key];
  const urgency = adjustUrgency(template.urgencyLevel, severity);

  return {
    urgencyLevel: urgency,
    chiefComplaint: template.chiefComplaint,
    suggestedQuestions: template.suggestedQuestions,
    generatedAt: new Date().toISOString(),
    llmStatus: 'success' as LLMStatus,
  };
}

export async function generatePostVisitSummary(
  clinicalNotes: string,
  prescription: Prescription[]
): Promise<PostVisitSummary> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2200));

  // Simulate occasional failure (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('LLM service temporarily unavailable');
  }

  const medSchedule = prescription.map(p =>
    `${p.medicineName} ${p.dosage} — ${p.frequencyPerDay}× daily for ${p.durationDays} days. ${p.instructions}`
  );

  const hasHighComplexity = clinicalNotes.length > 300;

  const followUpSteps = [
    'Schedule a follow-up appointment in 4–6 weeks if symptoms persist or worsen',
    'Contact the clinic immediately if you experience any new or severe symptoms',
  ];
  if (hasHighComplexity) {
    followUpSteps.push('Your doctor may request additional tests — you will be contacted with details');
  }
  followUpSteps.push('Keep a brief daily symptom diary to help track your progress');

  // Build a friendly summary
  const notesLower = clinicalNotes.toLowerCase();
  let summaryText = '';

  if (notesLower.includes('blood') || notesLower.includes('test') || notesLower.includes('result')) {
    summaryText = "Your appointment is complete. Some tests have been ordered or reviewed — your doctor will review the results and be in touch if any follow-up is needed. ";
  } else {
    summaryText = "Your appointment has been completed. Your doctor has reviewed your concerns and provided a treatment plan tailored to you. ";
  }

  if (prescription.length > 0) {
    summaryText += `You have been prescribed ${prescription.length === 1 ? 'a medication' : `${prescription.length} medications`} — please follow the schedule below carefully and complete the full course. `;
  } else {
    summaryText += "No medication has been prescribed at this time. ";
  }

  summaryText += "If you have any questions about your treatment, don't hesitate to contact the clinic.";

  return {
    patientFriendlyText: summaryText,
    medicationSchedule: medSchedule.length > 0 ? medSchedule : ['No medications prescribed'],
    followUpSteps,
    generatedAt: new Date().toISOString(),
    llmStatus: 'success' as LLMStatus,
  };
}
