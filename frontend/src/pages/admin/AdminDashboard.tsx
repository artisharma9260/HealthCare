import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { getDoctors } from '@/lib/doctorService';
import { getAppointments } from '@/lib/appointmentService';
import { StatusBadge } from '@/components/features/StatusBadge';
import { Users, Calendar, CheckCircle2, XCircle, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  });

  const { data: appointments = [], isLoading: loadingAppts } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: getAppointments,
  });

  const isLoading = loadingDoctors || loadingAppts;

  const stats = {
    doctors: doctors.length,
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    withAI: appointments.filter(a => a.preVisitSummary?.llmStatus === 'success').length,
  };

  const recentAppts = [...appointments]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <PortalShell role="admin">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">Admin Overview</h1>
          <p className="text-sm text-[#1A2523]/50 mt-1 font-mono">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Active Doctors', value: stats.doctors, icon: <Users size={18} />, color: 'bg-slate-100 text-slate-600' },
            { label: 'Total Appointments', value: stats.total, icon: <Calendar size={18} />, color: 'bg-[#E8EFEC] text-[#1C4A45]' },
            { label: 'Confirmed', value: stats.confirmed, icon: <TrendingUp size={18} />, color: 'bg-[#E8EFEC] text-[#1C4A45]' },
            { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={18} />, color: 'bg-[#E8F4F0] text-[#3D7A60]' },
            { label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={18} />, color: 'bg-red-50 text-red-500' },
            { label: 'With AI Summary', value: stats.withAI, icon: <TrendingUp size={18} />, color: 'bg-amber-50 text-amber-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E0E8E4] p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-[#1A2523]">{isLoading ? '–' : stat.value}</p>
              <p className="text-xs text-[#1A2523]/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/admin/doctors')}
            className="flex items-center gap-4 bg-[#2C3E4A] text-white rounded-xl p-5 hover:bg-[#1E2E38] active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="font-semibold">Manage Doctors</p>
              <p className="text-sm text-white/60">Add, edit, set leave days</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-white/40" />
          </button>
          <button onClick={() => navigate('/admin/appointments')}
            className="flex items-center gap-4 bg-white border border-[#E0E8E4] rounded-xl p-5 hover:border-slate-400 transition-all text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-[#1A2523]">All Appointments</p>
              <p className="text-sm text-[#1A2523]/50">View and manage all bookings</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-[#1A2523]/30" />
          </button>
        </div>

        {/* Recent Appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A2523]">Recent Appointments</h2>
            <button onClick={() => navigate('/admin/appointments')} className="text-xs text-slate-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="bg-white border border-[#E0E8E4] rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0F5F2] bg-[#F6F8F7]">
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider hidden sm:table-cell">Doctor</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppts.map(appt => (
                    <tr key={appt.id} className="border-b border-[#F0F5F2] last:border-0 hover:bg-[#F6F8F7] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A2523]">{appt.patientName}</td>
                      <td className="px-4 py-3 text-[#1A2523]/60 hidden sm:table-cell">{appt.doctorName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#1A2523]/60">
                        {new Date(appt.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={appt.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && recentAppts.length === 0 && (
              <p className="text-center py-8 text-sm text-[#1A2523]/40">No appointments yet.</p>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
