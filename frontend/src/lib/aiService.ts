import { apiRequest } from '@/lib/api';
import type { PreVisitSummary, PostVisitSummary, Prescription } from '@/types';

export async function generatePreVisitSummary(
  symptoms: string,
  severity: string,
  duration: string
): Promise<PreVisitSummary> {
  return apiRequest<PreVisitSummary>('/ai/pre-visit-summary', {
    method: 'POST',
    body: { symptoms, severity, duration },
  });
}

export async function generatePostVisitSummary(
  clinicalNotes: string,
  prescription: Prescription[]
): Promise<PostVisitSummary> {
  return apiRequest<PostVisitSummary>('/ai/post-visit-summary', {
    method: 'POST',
    body: { clinicalNotes, prescription },
  });
}
