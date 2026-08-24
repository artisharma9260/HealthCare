import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { getDoctorAppointments } from '@/lib/appointmentService';
import { getDoctorByUserId } from '@/lib/doctorService';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { User, Search, ChevronRight, Calendar, Loader2 } from 'lucide-react';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const { data: doctor } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: () => getDoctorByUserId(user!.id),
    enabled: !!user?.id,
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id],
    queryFn: () => getDoctorAppointments(doctor!.id),
    enabled: !!doctor?.id,
  });

  const patients = (() => {
    const map = new Map<string, { name: string; count: number; lastDate: string; patientId: string }>();
    appointments.forEach(a => {
      const existing = map.get(a.patientId);
      if (!existing) {
        map.set(a.patientId, { name: a.patientName, count: 1, lastDate: a.date, patientId: a.patientId });
      } else {
        existing.count++;
        if (a.date > existing.lastDate) existing.lastDate = a.date;
      }
    });
    return Array.from(map.values())
      .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  })();

  return (
    <PortalShell role="doctor">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">Patients</h1>
          <p className="text-sm text-white/40 mt-1">All patients seen by {doctor?.name}</p>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30" />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search patients…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
              placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : (
          <div className="space-y-2">
            {patients.length > 0 ? patients.map(p => (
              <div key={p.patientId}
                className="bg-white border border-[#E0E8E4] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#1C4A45] hover:shadow-sm transition-all"
                onClick={() => navigate('/doctor/appointments')}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('/doctor/appointments')}
              >
                <div className="w-10 h-10 bg-[#E8EFEC] rounded-full flex items-center justify-center text-sm font-bold text-[#1C4A45]">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1A2523]">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-[#1A2523]/50 flex items-center gap-1">
                      <Calendar size={11} /> Last: {new Date(p.lastDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs text-[#1A2523]/50">{p.count} visit{p.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#1A2523]/30" />
              </div>
            )) : (
              <div className="text-center py-12 bg-white/10 rounded-xl border border-white/10">
                <User size={36} className="text-white/30 mx-auto mb-3" />
                <p className="font-medium text-white/60">No patients found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
