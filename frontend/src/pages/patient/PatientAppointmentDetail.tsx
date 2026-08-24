import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { StatusBadge } from '@/components/features/StatusBadge';
import { PreVisitSummaryPanel, PostVisitSummaryPanel } from '@/components/features/AISummaryPanel';
import { getAppointmentById, submitSymptomForm, savePreVisitSummary, cancelAppointment } from '@/lib/appointmentService';
import { generatePreVisitSummary } from '@/lib/aiService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, Calendar, Clock, Sparkles, FileText, Pill, XCircle, Loader2 } from 'lucide-react';

export default function PatientAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: appt, isLoading, refetch } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentById(id!),
    enabled: !!id,
  });

  const [symptomText, setSymptomText] = useState('');
  const [severity, setSeverity] = useState('5');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) return (
    <PortalShell role="patient">
      <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1C4A45]/40" /></div>
    </PortalShell>
  );

  if (!appt) return (
    <PortalShell role="patient">
      <div className="text-center py-20">
        <p className="text-[#1A2523]/50">Appointment not found.</p>
        <button onClick={() => navigate('/patient/appointments')} className="mt-4 text-sm text-[#1C4A45] hover:underline">Back</button>
      </div>
    </PortalShell>
  );

  const handleSubmitSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;
    setSubmitting(true);
    try {
      await submitSymptomForm(appt.id, { text: symptomText, severity, duration });
      toast.success('Symptom form submitted. Generating AI summary…');
      const summary = await generatePreVisitSummary(symptomText, severity, duration);
      await savePreVisitSummary(appt.id, summary);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      toast.success('AI pre-visit summary generated.');
    } catch (err: unknown) {
      await savePreVisitSummary(appt.id, {
        urgencyLevel: 'Low',
        chiefComplaint: 'Summary generation failed',
        suggestedQuestions: [],
        generatedAt: new Date().toISOString(),
        llmStatus: 'failed',
        rawSymptoms: symptomText,
      });
      refetch();
      toast.warning('Symptoms saved, but AI summary is temporarily unavailable.');
    }
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!appt) return;
    setCancelling(true);
    await cancelAppointment(appt.id);
    refetch();
    queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
    toast.success('Appointment cancelled.');
    setCancelling(false);
  };

  const formattedDate = new Date(appt.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <PortalShell role="patient">
      <div className="max-w-2xl mx-auto space-y-5">
        <button onClick={() => navigate('/patient/appointments')} className="flex items-center gap-1 text-sm text-[#1A2523]/50 hover:text-[#1C4A45] transition-colors">
          <ChevronLeft size={16} /> Back to Appointments
        </button>

        {/* Header */}
        <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <StatusBadge status={appt.status} />
              </div>
              <h2 className="font-serif text-xl font-semibold text-[#1A2523]">{appt.doctorName}</h2>
              <p className="text-sm text-[#1C4A45] font-medium">{appt.doctorSpecialisation}</p>
            </div>
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
          {(appt.status === 'confirmed' || appt.status === 'held') && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-4 flex items-center gap-1.5 text-xs text-[#C4482E] hover:text-[#A33A25] transition-colors disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Cancel appointment
            </button>
          )}
        </div>

        {/* Symptom Form */}
        {appt.status === 'confirmed' && !appt.symptomForm && (
          <div className="bg-white border border-[#C4D9CE] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[#1C4A45]" />
              <h3 className="font-semibold text-[#1A2523]">Pre-Visit Symptom Form</h3>
            </div>
            <p className="text-sm text-[#1A2523]/60 mb-4 leading-relaxed">
              Describe your symptoms. Our AI will generate a summary and suggested questions for your doctor.
            </p>
            <form onSubmit={handleSubmitSymptoms} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Describe your symptoms *</label>
                <textarea
                  value={symptomText}
                  onChange={e => setSymptomText(e.target.value)}
                  required
                  rows={4}
                  placeholder="Please describe what you're experiencing in as much detail as you can…"
                  className="w-full px-4 py-3 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                    placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45]
                    transition-all resize-none leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 3 days, 2 weeks"
                    className="w-full px-3 py-2.5 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                      placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">
                    Severity: <span className="font-mono text-[#1C4A45]">{severity}/10</span>
                  </label>
                  <input
                    type="range" min="1" max="10"
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full accent-[#1C4A45] mt-2"
                  />
                  <div className="flex justify-between text-xs text-[#1A2523]/30 font-mono mt-1">
                    <span>Mild</span><span>Severe</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg
                  hover:bg-[#163D38] disabled:opacity-60 transition-all active:scale-[0.98]"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Generating AI Summary…</>
                  : <><Sparkles size={14} /> Submit & Generate Summary</>}
              </button>
            </form>
          </div>
        )}

        {/* Submitted Symptoms */}
        {appt.symptomForm && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={15} className="text-[#6B9080]" />
                <h3 className="font-semibold text-[#1A2523] text-sm">Submitted Symptoms</h3>
                <span className="ml-auto text-xs font-mono text-[#1A2523]/30">
                  {new Date(appt.symptomForm.submittedAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-sm text-[#1A2523]/80 leading-relaxed">{appt.symptomForm.text}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-[#F0F5F2]">
                {appt.symptomForm.duration && (
                  <div>
                    <p className="text-xs text-[#1A2523]/40 font-mono">Duration</p>
                    <p className="text-sm text-[#1A2523]">{appt.symptomForm.duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#1A2523]/40 font-mono">Severity</p>
                  <p className="text-sm text-[#1A2523]">{appt.symptomForm.severity}/10</p>
                </div>
              </div>
            </div>
            {appt.preVisitSummary && (
              <PreVisitSummaryPanel summary={appt.preVisitSummary} rawSymptoms={appt.symptomForm.text} />
            )}
          </div>
        )}

        {/* Post-Visit Summary */}
        {appt.postVisitSummary && (
          <div className="space-y-4">
            {appt.postVisitNotes?.prescription && appt.postVisitNotes.prescription.length > 0 && (
              <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Pill size={15} className="text-[#1C4A45]" />
                  <h3 className="font-semibold text-[#1A2523] text-sm">Prescriptions</h3>
                </div>
                <div className="space-y-3">
                  {appt.postVisitNotes.prescription.map((rx, i) => (
                    <div key={i} className="bg-[#F6F8F7] rounded-lg px-4 py-3 border border-[#E8EFEC]">
                      <p className="font-medium text-[#1A2523] text-sm">{rx.medicineName}</p>
                      <p className="text-xs text-[#1A2523]/60 mt-0.5">{rx.dosage} · {rx.frequencyPerDay}× daily · {rx.durationDays} days</p>
                      {rx.instructions && <p className="text-xs text-[#1A2523]/50 mt-2 leading-relaxed">{rx.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <PostVisitSummaryPanel summary={appt.postVisitSummary} />
          </div>
        )}
      </div>
    </PortalShell>
  );
}
