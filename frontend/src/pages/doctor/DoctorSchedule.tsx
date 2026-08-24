import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { StatusBadge, UrgencyBadge } from '@/components/features/StatusBadge';
import { getDoctorAppointmentsByDate } from '@/lib/appointmentService';
import { getDoctorByUserId } from '@/lib/doctorService';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Clock, FileText, Sparkles, Loader2 } from 'lucide-react';

export default function DoctorSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: doctor } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: () => getDoctorByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctor-schedule', doctor?.id, selectedDate],
    queryFn: () => getDoctorAppointmentsByDate(doctor!.id, selectedDate),
    enabled: !!doctor?.id,
  });

  const visibleAppts = appointments
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <PortalShell role="doctor">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">Daily Schedule</h1>
          <p className="text-sm text-white/40 mt-1">{doctor?.name} · {doctor?.specialisation}</p>
        </div>

        {/* Date Nav */}
        <div className="flex items-center gap-3 bg-white border border-[#E0E8E4] rounded-xl px-4 py-3">
          <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-[#F6F8F7] text-[#1A2523]/50 hover:text-[#1A2523] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-medium text-[#1A2523] text-sm">{formattedDate}</p>
            {isToday && <span className="text-xs font-mono text-[#1C4A45]">Today</span>}
          </div>
          <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg hover:bg-[#F6F8F7] text-[#1A2523]/50 hover:text-[#1A2523] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: visibleAppts.length },
            { label: 'Confirmed', value: visibleAppts.filter(a => a.status === 'confirmed').length },
            { label: 'With AI Summary', value: visibleAppts.filter(a => a.preVisitSummary?.llmStatus === 'success').length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E0E8E4] p-4 text-center">
              <p className="text-2xl font-bold text-[#1A2523]">{isLoading ? '–' : s.value}</p>
              <p className="text-xs text-[#1A2523]/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1C4A45]/40" /></div>
        ) : visibleAppts.length > 0 ? (
          <div className="space-y-3">
            {visibleAppts.map(appt => (
              <div
                key={appt.id}
                className="bg-white border border-[#E0E8E4] rounded-xl p-4 cursor-pointer hover:border-[#1C4A45] hover:shadow-sm transition-all"
                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/doctor/appointments/${appt.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 text-center min-w-[52px]">
                    <p className="text-lg font-bold font-mono text-[#1C4A45]">{appt.startTime}</p>
                    <p className="text-xs font-mono text-[#1A2523]/40">{appt.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={appt.status} size="sm" />
                      {appt.preVisitSummary?.urgencyLevel && (
                        <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />
                      )}
                    </div>
                    <p className="font-semibold text-[#1A2523]">{appt.patientName}</p>
                    {appt.preVisitSummary?.chiefComplaint && (
                      <p className="text-xs text-[#1A2523]/60 mt-0.5 flex items-center gap-1">
                        <Sparkles size={11} className="text-[#6B9080]" />
                        {appt.preVisitSummary.chiefComplaint}
                      </p>
                    )}
                    {!appt.symptomForm && (
                      <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                        <FileText size={11} /> No symptom form submitted
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-[#1A2523]/30 shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E0E8E4]">
            <Clock size={36} className="text-[#6B9080]/40 mx-auto mb-3" />
            <p className="font-medium text-[#1A2523]">No appointments scheduled</p>
            <p className="text-sm text-[#1A2523]/50 mt-1">Enjoy your free day, or check another date.</p>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
