import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import AppointmentCard from '@/components/features/AppointmentCard';
import { useAuth } from '@/contexts/AuthContext';
import { getPatientAppointments } from '@/lib/appointmentService';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Search, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments', user?.id],
    queryFn: () => getPatientAppointments(user!.id),
    enabled: !!user?.id,
  });

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'held')
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const needsSymptoms = upcoming.filter(a => !a.symptomForm && a.status === 'confirmed');

  return (
    <PortalShell role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">
            Good morning, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-[#1A2523]/50 mt-1 font-mono">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {needsSymptoms.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Symptom form pending</p>
              <p className="text-xs text-amber-700">
                {needsSymptoms.length} upcoming appointment{needsSymptoms.length > 1 ? 's need' : ' needs'} your symptom form.
              </p>
            </div>
            <button
              onClick={() => navigate(`/patient/appointments/${needsSymptoms[0].id}`)}
              className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap"
            >
              Fill now <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: <Calendar size={18} />, color: 'text-[#1C4A45] bg-[#E8F4F0]' },
            { label: 'Completed', value: completed.length, icon: <CheckCircle2 size={18} />, color: 'text-[#3D7A60] bg-[#E8F4F0]' },
            { label: 'Cancelled', value: cancelled.length, icon: <XCircle size={18} />, color: 'text-slate-500 bg-slate-100' },
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
          <button
            onClick={() => navigate('/patient/search')}
            className="flex items-center gap-4 bg-[#1C4A45] text-white rounded-xl p-5 hover:bg-[#163D38] active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <Search size={20} />
            </div>
            <div>
              <p className="font-semibold">Find a Doctor</p>
              <p className="text-sm text-white/60">Search by specialisation</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-white/40" />
          </button>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="flex items-center gap-4 bg-white border border-[#E0E8E4] rounded-xl p-5 hover:border-[#6B9080] transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#E8EFEC] rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-[#1C4A45]" />
            </div>
            <div>
              <p className="font-semibold text-[#1A2523]">My Appointments</p>
              <p className="text-sm text-[#1A2523]/50">View history & details</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-[#1A2523]/30" />
          </button>
        </div>

        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A2523]">Upcoming Appointments</h2>
              <button onClick={() => navigate('/patient/appointments')} className="text-xs text-[#1C4A45] hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcoming.slice(0, 4).map(appt => (
                <AppointmentCard key={appt.id} appointment={appt} viewAs="patient" />
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <h2 className="font-semibold text-[#1A2523] mb-3">Recent Visits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completed.slice(0, 2).map(appt => (
                <AppointmentCard key={appt.id} appointment={appt} viewAs="patient" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && appointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#E0E8E4]">
            <Calendar size={40} className="text-[#6B9080] mx-auto mb-3 opacity-50" />
            <p className="font-medium text-[#1A2523]">No appointments yet</p>
            <p className="text-sm text-[#1A2523]/50 mt-1">Book your first appointment with a doctor</p>
            <button
              onClick={() => navigate('/patient/search')}
              className="mt-4 px-5 py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg hover:bg-[#163D38] transition-colors"
            >
              Find a Doctor
            </button>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
