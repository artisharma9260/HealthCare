import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { StatusBadge } from '@/components/features/StatusBadge';
import { PreVisitSummaryPanel } from '@/components/features/AISummaryPanel';
import { getAppointmentById, submitPostVisitNotes, savePostVisitSummary } from '@/lib/appointmentService';
import { generatePostVisitSummary } from '@/lib/aiService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2, Sparkles, Loader2, FileText, Pill, Calendar, Clock } from 'lucide-react';
import type { Prescription } from '@/types';

const EMPTY_RX: Prescription = { medicineName: '', dosage: '', frequencyPerDay: 1, durationDays: 7, instructions: '' };

export default function DoctorAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appt, isLoading, refetch } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentById(id!),
    enabled: !!id,
  });

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([{ ...EMPTY_RX }]);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return (
    <PortalShell role="doctor">
      <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-white/20" /></div>
    </PortalShell>
  );

  if (!appt) return (
    <PortalShell role="doctor">
      <div className="text-center py-20">
        <p className="text-white/50">Appointment not found.</p>
        <button onClick={() => navigate('/doctor')} className="mt-4 text-sm text-white/60 hover:text-white">Back</button>
      </div>
    </PortalShell>
  );

  const formattedDate = new Date(appt.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const addPrescription = () => setPrescriptions(p => [...p, { ...EMPTY_RX }]);
  const removePrescription = (i: number) => setPrescriptions(p => p.filter((_, idx) => idx !== i));
  const updateRx = (i: number, field: keyof Prescription, value: string | number) =>
    setPrescriptions(p => p.map((rx, idx) => idx === i ? { ...rx, [field]: value } : rx));

  const handleSubmitNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) return;
    setSubmitting(true);
    const validRx = prescriptions.filter(rx => rx.medicineName.trim());
    const notes = { clinicalNotes, prescription: validRx, submittedAt: new Date().toISOString() };

    try {
      await submitPostVisitNotes(appt.id, notes);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule'] });
      toast.success('Notes saved. Generating patient summary…');

      const summary = await generatePostVisitSummary(clinicalNotes, validRx);
      await savePostVisitSummary(appt.id, summary);
      refetch();
      toast.success('Patient-friendly summary generated.');
    } catch {
      await savePostVisitSummary(appt.id, {
        patientFriendlyText: 'Summary generation failed. The patient will be contacted separately.',
        medicationSchedule: [],
        followUpSteps: [],
        generatedAt: new Date().toISOString(),
        llmStatus: 'failed',
      });
      refetch();
      toast.warning('Notes saved, but AI summary failed.');
    }
    setSubmitting(false);
  };

  return (
    <PortalShell role="doctor">
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate('/doctor')} className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Back to Schedule
        </button>

        {/* Header */}
        <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#E8EFEC] rounded-full flex items-center justify-center text-sm font-bold text-[#1C4A45]">
                {appt.patientName.charAt(0)}
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#1A2523]">{appt.patientName}</h2>
                <p className="text-xs text-[#1A2523]/50 font-mono">Patient</p>
              </div>
            </div>
            <StatusBadge status={appt.status} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#F0F5F2] grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-[#1A2523]/60">
              <Calendar size={13} className="text-[#6B9080]" />
              <span className="font-mono">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#1A2523]/60">
              <Clock size={13} className="text-[#6B9080]" />
              <span className="font-mono">{appt.startTime} – {appt.endTime}</span>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        {appt.symptomForm ? (
          <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} className="text-[#6B9080]" />
              <h3 className="font-semibold text-[#1A2523] text-sm">Patient-Reported Symptoms</h3>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-[#1A2523]/30">Severity: {appt.symptomForm.severity}/10</span>
                {appt.symptomForm.duration && <span className="text-xs font-mono text-[#1A2523]/30">· {appt.symptomForm.duration}</span>}
              </div>
            </div>
            <p className="text-sm text-[#1A2523]/80 leading-relaxed">{appt.symptomForm.text}</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <FileText size={16} className="text-amber-500" />
            <p className="text-sm text-amber-800">Patient has not submitted a symptom form yet.</p>
          </div>
        )}

        {/* AI Pre-Visit Summary */}
        {appt.preVisitSummary && (
          <PreVisitSummaryPanel summary={appt.preVisitSummary} rawSymptoms={appt.symptomForm?.text} />
        )}

        {/* Post-Visit Notes — already submitted */}
        {appt.status === 'completed' && appt.postVisitNotes ? (
          <div className="bg-white border border-[#C4D9CE] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} className="text-[#1C4A45]" />
              <h3 className="font-semibold text-[#1A2523] text-sm">Clinical Notes (Submitted)</h3>
              <span className="ml-auto text-xs font-mono text-[#1A2523]/30">
                {new Date(appt.postVisitNotes.submittedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
            <p className="text-sm text-[#1A2523]/80 leading-relaxed">{appt.postVisitNotes.clinicalNotes}</p>
            {appt.postVisitNotes.prescription.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#F0F5F2]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Pill size={13} className="text-[#1C4A45]" />
                  <p className="text-xs text-[#1A2523]/50 uppercase tracking-wider font-mono">Prescriptions</p>
                </div>
                {appt.postVisitNotes.prescription.map((rx, i) => (
                  <div key={i} className="text-sm text-[#1A2523]/80 py-1.5 border-b border-[#F0F5F2] last:border-0">
                    <span className="font-medium">{rx.medicineName}</span> {rx.dosage} · {rx.frequencyPerDay}× daily · {rx.durationDays} days
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : appt.status === 'confirmed' ? (
          /* Notes Form */
          <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[#1C4A45]" />
              <h3 className="font-semibold text-[#1A2523]">Post-Visit Notes</h3>
            </div>
            <form onSubmit={handleSubmitNotes} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Clinical Notes *</label>
                <textarea
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  required rows={5}
                  placeholder="Enter your clinical notes, findings, diagnosis, and treatment plan…"
                  className="w-full px-4 py-3 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                    placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] resize-none transition-all"
                />
              </div>

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Pill size={14} className="text-[#1C4A45]" />
                    <label className="text-sm font-medium text-[#1A2523]/70">Prescriptions</label>
                  </div>
                  <button type="button" onClick={addPrescription} className="flex items-center gap-1 text-xs text-[#1C4A45] hover:text-[#163D38]">
                    <Plus size={13} /> Add medication
                  </button>
                </div>
                <div className="space-y-3">
                  {prescriptions.map((rx, i) => (
                    <div key={i} className="bg-[#F6F8F7] rounded-xl p-4 border border-[#E8EFEC] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-[#1A2523]/40">Medication {i + 1}</span>
                        {prescriptions.length > 1 && (
                          <button type="button" onClick={() => removePrescription(i)} className="text-[#C4482E]/60 hover:text-[#C4482E]">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { f: 'medicineName' as const, placeholder: 'Medicine name', type: 'text' },
                          { f: 'dosage' as const, placeholder: 'Dosage (e.g. 500mg)', type: 'text' },
                        ]).map(({ f, placeholder, type }) => (
                          <input key={f} type={type} value={rx[f]} onChange={e => updateRx(i, f, e.target.value)}
                            placeholder={placeholder}
                            className="px-3 py-2 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523] placeholder-[#1A2523]/30 focus:outline-none focus:ring-1 focus:ring-[#1C4A45] focus:border-[#1C4A45] transition-all"
                          />
                        ))}
                        <input type="number" min="1" max="6" value={rx.frequencyPerDay}
                          onChange={e => updateRx(i, 'frequencyPerDay', parseInt(e.target.value))}
                          placeholder="Daily frequency"
                          className="px-3 py-2 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523] focus:outline-none focus:ring-1 focus:ring-[#1C4A45] focus:border-[#1C4A45] transition-all"
                        />
                        <input type="number" min="1" value={rx.durationDays}
                          onChange={e => updateRx(i, 'durationDays', parseInt(e.target.value))}
                          placeholder="Duration (days)"
                          className="px-3 py-2 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523] focus:outline-none focus:ring-1 focus:ring-[#1C4A45] focus:border-[#1C4A45] transition-all"
                        />
                      </div>
                      <input type="text" value={rx.instructions}
                        onChange={e => updateRx(i, 'instructions', e.target.value)}
                        placeholder="Instructions (e.g. Take with food)"
                        className="w-full px-3 py-2 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523] placeholder-[#1A2523]/30 focus:outline-none focus:ring-1 focus:ring-[#1C4A45] focus:border-[#1C4A45] transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg
                  hover:bg-[#163D38] disabled:opacity-60 transition-all active:scale-[0.98]"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Saving & Generating…</>
                  : <><Sparkles size={14} /> Submit Notes & Generate Summary</>}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}
