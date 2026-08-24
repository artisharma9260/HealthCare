import type { PreVisitSummary, PostVisitSummary } from '@/types';
import { UrgencyBadge } from './StatusBadge';
import { Sparkles, AlertTriangle, RefreshCw, HelpCircle, CheckCircle2, Pill, ArrowRight } from 'lucide-react';

interface PreVisitPanelProps {
  summary: PreVisitSummary;
  rawSymptoms?: string;
}

export function PreVisitSummaryPanel({ summary, rawSymptoms }: PreVisitPanelProps) {
  if (summary.llmStatus === 'failed' || summary.llmStatus === 'unavailable') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">AI Summary Unavailable</p>
            <p className="text-xs text-amber-700 mt-1">
              The AI summary could not be generated. The raw symptom information is shown below.
            </p>
            {rawSymptoms && (
              <div className="mt-3 bg-white rounded-lg border border-amber-200 p-3">
                <p className="text-xs text-[#1A2523]/70 leading-relaxed">{rawSymptoms}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#C4D9CE] rounded-xl overflow-hidden">
      <div className="bg-[#1C4A45] px-5 py-3 flex items-center gap-2">
        <Sparkles size={15} className="text-[#6B9080]" />
        <span className="text-sm font-medium text-white">AI Pre-Visit Summary</span>
        <span className="ml-auto text-xs font-mono text-white/40">
          {new Date(summary.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-[#1A2523]/50 uppercase tracking-wider font-mono mb-1">Chief Complaint</p>
            <p className="text-sm font-medium text-[#1A2523]">{summary.chiefComplaint}</p>
          </div>
          <UrgencyBadge level={summary.urgencyLevel} />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle size={13} className="text-[#6B9080]" />
            <p className="text-xs text-[#1A2523]/50 uppercase tracking-wider font-mono">Suggested Questions</p>
          </div>
          <ul className="space-y-2">
            {summary.suggestedQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1A2523]/80">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#E8EFEC] text-[#1C4A45] text-xs flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface PostVisitPanelProps {
  summary: PostVisitSummary;
}

export function PostVisitSummaryPanel({ summary }: PostVisitPanelProps) {
  if (summary.llmStatus === 'failed' || summary.llmStatus === 'unavailable') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Summary Unavailable</p>
            <p className="text-xs text-amber-700 mt-1">
              The post-visit summary could not be generated. Please contact the clinic for your visit notes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#C4D9CE] rounded-xl overflow-hidden">
      <div className="bg-[#1C4A45] px-5 py-3 flex items-center gap-2">
        <Sparkles size={15} className="text-[#6B9080]" />
        <span className="text-sm font-medium text-white">Your Visit Summary</span>
        <span className="ml-auto text-xs font-mono text-white/40">
          {new Date(summary.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="p-5 space-y-5">
        <div>
          <p className="text-sm text-[#1A2523]/80 leading-relaxed">{summary.patientFriendlyText}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Pill size={13} className="text-[#1C4A45]" />
            <p className="text-xs text-[#1A2523]/50 uppercase tracking-wider font-mono">Medication Schedule</p>
          </div>
          <ul className="space-y-2">
            {summary.medicationSchedule.map((med, i) => (
              <li key={i} className="flex items-start gap-2 bg-[#F6F8F7] rounded-lg px-3 py-2 text-sm text-[#1A2523]/80">
                <CheckCircle2 size={14} className="text-[#6B9080] shrink-0 mt-0.5" />
                {med}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <ArrowRight size={13} className="text-[#1C4A45]" />
            <p className="text-xs text-[#1A2523]/50 uppercase tracking-wider font-mono">Follow-Up Steps</p>
          </div>
          <ul className="space-y-2">
            {summary.followUpSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#1A2523]/80">
                <span className="shrink-0 w-5 h-5 rounded-full border border-[#6B9080] text-[#1C4A45] text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
