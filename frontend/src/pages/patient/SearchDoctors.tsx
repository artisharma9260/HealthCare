import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import DoctorCard from '@/components/features/DoctorCard';
import { getDoctors } from '@/lib/doctorService';
import { SPECIALISATIONS } from '@/lib/mockData';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function SearchDoctors() {
  const [query, setQuery] = useState('');
  const [specialisation, setSpecialisation] = useState('All Specialisations');

  const { data: allDoctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
    staleTime: 60_000,
  });

  const filtered = allDoctors.filter(d => {
    const matchesQuery = !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialisation.toLowerCase().includes(query.toLowerCase()) ||
      d.bio.toLowerCase().includes(query.toLowerCase());
    const matchesSpec = specialisation === 'All Specialisations' || d.specialisation === specialisation;
    return matchesQuery && matchesSpec;
  });

  return (
    <PortalShell role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">Find a Doctor</h1>
          <p className="text-sm text-[#1A2523]/50 mt-1">Search by name, specialisation, or area of expertise</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or keyword…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
            />
          </div>
          <div className="relative sm:w-52">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
            <select
              value={specialisation}
              onChange={e => setSpecialisation(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] appearance-none transition-all"
            >
              {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#1C4A45]/40" />
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#1A2523]/40 font-mono mb-3">
              {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-[#E0E8E4]">
                <Search size={36} className="text-[#6B9080]/40 mx-auto mb-3" />
                <p className="font-medium text-[#1A2523]">No doctors found</p>
                <p className="text-sm text-[#1A2523]/50 mt-1">Try adjusting your search or filter</p>
                <button
                  onClick={() => { setQuery(''); setSpecialisation('All Specialisations'); }}
                  className="mt-3 text-sm text-[#1C4A45] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
