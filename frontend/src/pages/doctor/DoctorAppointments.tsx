import { useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import AppointmentCard from '@/components/features/AppointmentCard';
import { getDoctorAppointments } from '@/lib/appointmentService';
import { getDoctorByUserId } from '@/lib/doctorService';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import type { AppointmentStatus } from '@/types';

type FilterTab = 'all' | AppointmentStatus;

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
];

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');

  const { data: doctor } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: () => getDoctorByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { data: allAppointments = [], isLoading } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id],
    queryFn: () => getDoctorAppointments(doctor!.id),
    enabled: !!doctor?.id,
  });

  const filtered = allAppointments
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => !query || a.patientName.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PortalShell role="doctor">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">All Appointments</h1>
          <p className="text-sm text-white/40 mt-1">Full appointment list</p>
        </div>

        <div className="flex gap-1 bg-[#163D38] rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                ${filter === tab.value ? 'bg-white text-[#1C4A45] shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30" />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by patient name…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
              placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : (
          <>
            <p className="text-xs text-white/40 font-mono">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="doctor" />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/10 rounded-xl border border-white/10">
                <p className="font-medium text-white/60">No appointments found</p>
              </div>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}
