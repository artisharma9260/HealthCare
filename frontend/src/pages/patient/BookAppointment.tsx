import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalShell from '@/components/layout/PortalShell';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById } from '@/lib/doctorService';
import { generateTimeSlots, createSlotHold, confirmAppointment } from '@/lib/appointmentService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Timer, Loader2 } from 'lucide-react';
import type { DoctorProfile, TimeSlot, SlotHold } from '@/types';

type Step = 'select-date' | 'select-slot' | 'confirm' | 'booked';

function buildAvailableDates(doctor: DoctorProfile) {
  const dates: { date: string; dayName: string; isLeave: boolean; workingDay: boolean }[] = [];
  const today = new Date();
  for (let i = 1; i <= 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
    const isLeave = doctor.leaveDays.includes(dateStr);
    const workingDay = doctor.workingHours.some(w => w.day === dayName);
    if (workingDay) dates.push({ date: dateStr, dayName, isLeave, workingDay });
  }
  return dates.slice(0, 14);
}

export default function BookAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: doctor, isLoading: loadingDoctor } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => getDoctorById(doctorId!),
    enabled: !!doctorId,
  });

  const [step, setStep] = useState<Step>('select-date');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentHold, setCurrentHold] = useState<SlotHold | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [confirmedId, setConfirmedId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const availableDates = doctor ? buildAvailableDates(doctor) : [];

  // Countdown
  useEffect(() => {
    if (!currentHold) return;
    if (timeLeft <= 0) {
      setCurrentHold(null);
      setStep('select-slot');
      setSelectedSlot(null);
      toast.error('Hold expired. Please select a new slot.');
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [currentHold, timeLeft]);

  const handleDateSelect = async (date: string) => {
    if (!doctor) return;
    setSelectedDate(date);
    setLoadingSlots(true);
    setStep('select-slot');
    const s = await generateTimeSlots(doctor, date);
    setSlots(s);
    setLoadingSlots(false);
  };

  const handleSlotSelect = async (slot: TimeSlot) => {
    if (!slot.available || !user || !doctor) return;
    try {
      const hold = await createSlotHold({
        doctorId: doctor.id,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        patientId: user.id,
      });
      setSelectedSlot(slot);
      setCurrentHold(hold);
      setTimeLeft(300);
      setStep('confirm');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not hold this slot.');
    }
  };

  const handleConfirm = async () => {
    if (!user || !doctor || !selectedSlot || !currentHold) return;
    setConfirming(true);
    try {
      const appt = await confirmAppointment(currentHold, user.name, doctor.name, doctor.specialisation);
      setCurrentHold(null);
      setConfirmedId(appt.id);
      setStep('booked');
      toast.success('Appointment confirmed!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm appointment.');
    }
    setConfirming(false);
  };

  if (loadingDoctor) return (
    <PortalShell role="patient">
      <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1C4A45]/40" /></div>
    </PortalShell>
  );

  if (!doctor) return (
    <PortalShell role="patient">
      <div className="text-center py-20">
        <p className="text-[#1A2523]/50">Doctor not found.</p>
        <button onClick={() => navigate('/patient/search')} className="mt-4 text-sm text-[#1C4A45] hover:underline">Back to search</button>
      </div>
    </PortalShell>
  );

  return (
    <PortalShell role="patient">
      <div className="max-w-2xl mx-auto space-y-5">
        <button
          onClick={() => step === 'select-date' ? navigate('/patient/search') : setStep(step === 'confirm' ? 'select-slot' : 'select-date')}
          className="flex items-center gap-1 text-sm text-[#1A2523]/50 hover:text-[#1C4A45] transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Doctor Info */}
        <div className="bg-white border border-[#E0E8E4] rounded-xl p-5 flex items-start gap-4">
          <img
            src={doctor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1C4A45&color=fff`}
            alt={doctor.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#E8EFEC] shrink-0"
          />
          <div>
            <h2 className="font-serif font-semibold text-[#1A2523] text-lg">{doctor.name}</h2>
            <p className="text-sm text-[#1C4A45] font-medium">{doctor.specialisation}</p>
            <p className="text-xs text-[#1A2523]/50 mt-1">{doctor.slotDurationMinutes}-minute appointments</p>
          </div>
        </div>

        {/* Select Date */}
        {(step === 'select-date' || step === 'select-slot') && (
          <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-[#1C4A45]" />
              <h3 className="font-semibold text-[#1A2523]">Select a Date</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableDates.map(({ date, isLeave }) => {
                const d = new Date(date + 'T12:00:00');
                const isSelected = selectedDate === date;
                return (
                  <button
                    key={date}
                    onClick={() => !isLeave && handleDateSelect(date)}
                    disabled={isLeave}
                    className={`p-2.5 rounded-lg border text-center transition-all text-sm
                      ${isSelected ? 'bg-[#1C4A45] border-[#1C4A45] text-white' : ''}
                      ${!isSelected && !isLeave ? 'border-[#E0E8E4] hover:border-[#6B9080] hover:bg-[#F6F8F7] text-[#1A2523]' : ''}
                      ${isLeave ? 'border-[#F0F0F0] bg-[#F9F9F9] text-[#1A2523]/25 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="font-mono text-xs opacity-60">{d.toLocaleDateString('en-GB', { month: 'short' })}</div>
                    <div className="font-bold text-lg leading-tight">{d.getDate()}</div>
                    <div className="text-xs opacity-60 truncate">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                    {isLeave && <div className="text-xs text-[#C4482E] mt-0.5">Leave</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Select Slot */}
        {step === 'select-slot' && selectedDate && (
          <div className="bg-white border border-[#E0E8E4] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[#1C4A45]" />
              <h3 className="font-semibold text-[#1A2523]">
                Available Times — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            {loadingSlots ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#1C4A45]/40" /></div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[#1A2523]/50 text-center py-4">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.startTime}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-mono font-medium transition-all
                      ${slot.available
                        ? 'border-[#C4D9CE] text-[#1C4A45] hover:bg-[#1C4A45] hover:text-white hover:border-[#1C4A45] active:scale-95'
                        : 'border-[#F0F0F0] bg-[#F9F9F9] text-[#1A2523]/25 cursor-not-allowed line-through'
                      }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Confirm */}
        {step === 'confirm' && selectedSlot && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
              ${timeLeft < 60 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <Timer size={16} className={timeLeft < 60 ? 'text-red-500' : 'text-amber-500'} />
              <p className={`text-sm ${timeLeft < 60 ? 'text-red-700' : 'text-amber-700'}`}>
                Slot held for <span className="font-mono font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span> — confirm before it expires.
              </p>
            </div>
            <div className="bg-white border border-[#E0E8E4] rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-[#1A2523]">Confirm Appointment</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Doctor', value: doctor.name },
                  { label: 'Specialisation', value: doctor.specialisation },
                  { label: 'Date', value: new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
                  { label: 'Time', value: `${selectedSlot.startTime} – ${selectedSlot.endTime}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-[#F0F5F2] last:border-0">
                    <span className="text-[#1A2523]/50">{row.label}</span>
                    <span className="font-medium text-[#1A2523] font-mono text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C4A45] text-white text-sm font-semibold rounded-lg
                  hover:bg-[#163D38] active:scale-[0.98] disabled:opacity-60 transition-all duration-150"
              >
                {confirming ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}

        {/* Booked */}
        {step === 'booked' && (
          <div className="bg-white border border-[#C4D9CE] rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-[#E8F4F0] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-[#3D7A60]" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1A2523] mb-2">Appointment Confirmed</h3>
            <p className="text-sm text-[#1A2523]/60 max-w-sm mx-auto">
              Your appointment with <strong>{doctor.name}</strong> on{' '}
              <strong>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at{' '}
              <strong>{selectedSlot?.startTime}</strong> is confirmed.
            </p>
            <div className="mt-6 bg-[#E8EFEC] rounded-lg p-4 text-sm text-[#1C4A45] text-left">
              <p className="font-medium mb-1">Next step: Fill your symptom form</p>
              <p className="text-xs text-[#1A2523]/60">
                Submitting a symptom form allows our AI to generate a pre-visit summary for your doctor.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/patient/appointments/${confirmedId}`)}
                className="flex-1 py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg hover:bg-[#163D38] transition-colors"
              >
                Fill Symptom Form
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="flex-1 py-2.5 bg-[#E8EFEC] text-[#1C4A45] text-sm font-medium rounded-lg hover:bg-[#D0E2DA] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
