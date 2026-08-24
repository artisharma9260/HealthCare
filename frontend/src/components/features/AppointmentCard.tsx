import type { Appointment } from '@/types';
import { StatusBadge, UrgencyBadge } from './StatusBadge';
import { Calendar, Clock, User, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  appointment: Appointment;
  viewAs: 'patient' | 'doctor' | 'admin';
}

export default function AppointmentCard({ appointment, viewAs }: Props) {
  const navigate = useNavigate();

  const detailPath = viewAs === 'patient'
    ? `/patient/appointments/${appointment.id}`
    : viewAs === 'doctor'
      ? `/doctor/appointments/${appointment.id}`
      : `/admin/appointments/${appointment.id}`;

  const isUpcoming = appointment.status === 'confirmed' || appointment.status === 'held';

  return (
    <div
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 group
        ${isUpcoming ? 'border-[#C4D9CE] hover:border-[#1C4A45]' : 'border-[#E0E8E4] hover:border-[#B0C4BC]'}`}
      onClick={() => navigate(detailPath)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(detailPath)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={appointment.status} size="sm" />
            {appointment.preVisitSummary?.urgencyLevel && appointment.status === 'confirmed' && (
              <UrgencyBadge level={appointment.preVisitSummary.urgencyLevel} size="sm" />
            )}
          </div>
          <h3 className="font-semibold text-[#1A2523] mt-2 text-sm leading-tight">
            {viewAs === 'patient' ? appointment.doctorName : appointment.patientName}
          </h3>
          <p className="text-xs text-[#1A2523]/60 mt-0.5">
            {viewAs === 'patient' ? appointment.doctorSpecialisation : 'Patient'}
          </p>
        </div>
        <ChevronRight size={16} className="text-[#1A2523]/30 group-hover:text-[#1C4A45] transition-colors shrink-0 mt-1" />
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0F5F2] grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#1A2523]/60">
          <Calendar size={12} className="text-[#6B9080]" />
          <span className="font-mono">
            {new Date(appointment.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#1A2523]/60">
          <Clock size={12} className="text-[#6B9080]" />
          <span className="font-mono">{appointment.startTime} – {appointment.endTime}</span>
        </div>
      </div>

      {!appointment.symptomForm && appointment.status === 'confirmed' && viewAs === 'patient' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[#D68A3C] bg-amber-50 rounded-lg px-3 py-2">
          <FileText size={12} />
          <span>Symptom form not yet submitted</span>
        </div>
      )}
    </div>
  );
}
