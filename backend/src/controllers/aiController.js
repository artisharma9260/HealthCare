import { GoogleGenerativeAI } from '@google/generative-ai';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

function extractJSON(text) {
  const clean = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

// POST /api/ai/pre-visit-summary
// body: { symptoms, severity, duration }
export async function generatePreVisitSummary(req, res) {
  const { symptoms, severity, duration } = req.body;
  if (!symptoms) {
    return res.status(400).json({ message: 'symptoms is required.' });
  }

  const model = getModel();
  if (!model) {
    return res.status(503).json({ message: 'AI service is not configured (missing GEMINI_API_KEY).' });
  }

  const prompt = `You are a clinical decision support assistant. Analyze patient symptoms and return a JSON object with exactly these fields:
- urgencyLevel: one of "Low", "Medium", or "High"
- chiefComplaint: a brief clinical description (max 15 words)
- suggestedQuestions: an array of exactly 3 specific questions for the doctor to ask

Return ONLY valid JSON, no markdown, no extra text.

Symptoms: ${symptoms}
Duration: ${duration || 'Not specified'}
Severity (1-10): ${severity || 'Not specified'}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJSON(text);

    const urgency = ['Low', 'Medium', 'High'].includes(parsed.urgencyLevel) ? parsed.urgencyLevel : 'Low';

    return res.json({
      urgencyLevel: urgency,
      chiefComplaint: parsed.chiefComplaint || 'Symptoms requiring clinical evaluation',
      suggestedQuestions: parsed.suggestedQuestions || [],
      generatedAt: new Date().toISOString(),
      llmStatus: 'success',
    });
  } catch (err) {
    return res.status(502).json({ message: err.message || 'AI generation failed.' });
  }
}

// POST /api/ai/post-visit-summary
// body: { clinicalNotes, prescription }
export async function generatePostVisitSummary(req, res) {
  const { clinicalNotes, prescription } = req.body;
  if (!clinicalNotes) {
    return res.status(400).json({ message: 'clinicalNotes is required.' });
  }

  const model = getModel();
  if (!model) {
    return res.status(503).json({ message: 'AI service is not configured (missing GEMINI_API_KEY).' });
  }

  const rxText =
    prescription && prescription.length > 0
      ? prescription
          .map((p) => `${p.medicineName} ${p.dosage}: ${p.frequencyPerDay}x daily for ${p.durationDays} days. ${p.instructions}`)
          .join('\n')
      : 'No medications prescribed';

  const prompt = `You are a patient communication specialist. Convert clinical notes into a patient-friendly summary and return a JSON object with exactly these fields:
- patientFriendlyText: a warm, clear paragraph (2-3 sentences) for the patient
- medicationSchedule: array of strings describing each medication's schedule
- followUpSteps: array of 2-4 actionable follow-up steps for the patient

Return ONLY valid JSON, no markdown, no extra text.

Clinical Notes: ${clinicalNotes}
Prescriptions:
${rxText}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJSON(text);

    return res.json({
      patientFriendlyText: parsed.patientFriendlyText || 'Your visit has been completed.',
      medicationSchedule: parsed.medicationSchedule || [],
      followUpSteps: parsed.followUpSteps || [],
      generatedAt: new Date().toISOString(),
      llmStatus: 'success',
    });
  } catch (err) {
    return res.status(502).json({ message: err.message || 'AI generation failed.' });
  }
}
