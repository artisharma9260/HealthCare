import type { DoctorProfile } from '@/types';
import { Clock, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  doctor: DoctorProfile;
}

export default function DoctorCard({ doctor }: Props) {
  const navigate = useNavigate();
  const workDays = doctor.workingHours.map(w => w.day.slice(0, 3)).join(', ');

  return (
    <div className="bg-white rounded-xl border border-[#E0E8E4] p-5 hover:shadow-md hover:border-[#6B9080] transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={doctor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1C4A45&color=fff&size=80`}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#E8EFEC]"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#6B9080] rounded-full border-2 border-white" title="Available" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A2523] text-base leading-tight font-serif">{doctor.name}</h3>
          <p className="text-sm text-[#1C4A45] font-medium mt-0.5">{doctor.specialisation}</p>
          <p className="text-xs text-[#1A2523]/60 mt-1 line-clamp-2 leading-relaxed">{doctor.bio}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#F0F5F2] grid grid-cols-2 gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#1A2523]/60">
          <Clock size={13} className="text-[#6B9080]" />
          <span className="font-mono">{doctor.slotDurationMinutes}min slots</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#1A2523]/60">
          <Calendar size={13} className="text-[#6B9080]" />
          <span className="truncate">{workDays}</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/patient/book/${doctor.id}`)}
        className="mt-4 w-full py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg
          hover:bg-[#163D38] active:scale-[0.98] transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-[#1C4A45] focus:ring-offset-2"
      >
        Book Appointment
      </button>
    </div>
  );
}
