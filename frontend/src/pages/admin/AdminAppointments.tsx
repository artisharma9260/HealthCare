import { useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import { StatusBadge, UrgencyBadge } from '@/components/features/StatusBadge';
import { getAppointments, cancelAppointment } from '@/lib/appointmentService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Filter, XCircle, Loader2 } from 'lucide-react';
import type { AppointmentStatus } from '@/types';

export default function AdminAppointments() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: getAppointments,
  });

  const filtered = appointments
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a => !query ||
      a.patientName.toLowerCase().includes(query.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(query.toLowerCase()) ||
      a.doctorSpecialisation.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleCancel = async (id: string) => {
    await cancelAppointment(id);
    queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    toast.success('Appointment cancelled.');
  };

  return (
    <PortalShell role="admin">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">All Appointments</h1>
          <p className="text-sm text-[#1A2523]/50 mt-1">{isLoading ? '…' : `${filtered.length} of ${appointments.length} total`}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30" />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search patient, doctor, specialisation…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] transition-all"
            />
          </div>
          <div className="relative sm:w-44">
            <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] appearance-none transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="held">On Hold</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-[#E0E8E4] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F5F2] bg-[#F6F8F7]">
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Doctor</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Urgency</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(appt => (
                    <tr key={appt.id} className="border-b border-[#F0F5F2] last:border-0 hover:bg-[#F6F8F7] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A2523]">{appt.patientName}</td>
                      <td className="px-4 py-3">
                        <p className="text-[#1A2523]">{appt.doctorName}</p>
                        <p className="text-xs text-[#1A2523]/40">{appt.doctorSpecialisation}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-[#1A2523]">
                          {new Date(appt.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="font-mono text-xs text-[#1A2523]/40">{appt.startTime} – {appt.endTime}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={appt.status} size="sm" /></td>
                      <td className="px-4 py-3">
                        {appt.preVisitSummary
                          ? <UrgencyBadge level={appt.preVisitSummary.urgencyLevel} size="sm" />
                          : <span className="text-xs text-[#1A2523]/30">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {(appt.status === 'confirmed' || appt.status === 'held') && (
                          <button onClick={() => handleCancel(appt.id)}
                            className="p-1.5 rounded-md text-[#1A2523]/30 hover:text-[#C4482E] hover:bg-red-50 transition-colors"
                            title="Cancel appointment"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center py-8 text-sm text-[#1A2523]/40">No appointments match your filters.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
