import { useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, markDoctorLeave, removeDoctorLeave } from '@/lib/doctorService';
import { getDoctorAppointments, cancelAppointment } from '@/lib/appointmentService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Edit3, X, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { SPECIALISATIONS } from '@/lib/mockData';
import type { DoctorProfile } from '@/types';

const NEW_FORM = {
  name: '',
  email: '',
  specialisation: 'General Practice',
  bio: '',
  slotDurationMinutes: 30,
  leaveDays: [] as string[],
  workingHours: [
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', startTime: '09:00', endTime: '17:00' },
  ],
};

type Modal = { type: 'add' } | { type: 'edit'; doctor: DoctorProfile } | { type: 'leave'; doctor: DoctorProfile } | null;

export default function AdminDoctors() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<Modal>(null);
  const [form, setForm] = useState({ ...NEW_FORM });
  const [leaveDate, setLeaveDate] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['doctors'] });

  const openAdd = () => { setForm({ ...NEW_FORM }); setModal({ type: 'add' }); };
  const openEdit = (d: DoctorProfile) => { setForm({ ...d }); setModal({ type: 'edit', doctor: d }); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required.'); return; }
    setSaving(true);
    try {
      if (modal?.type === 'add') {
        await createDoctor(form);
        toast.success('Doctor added.');
      } else if (modal?.type === 'edit') {
        await updateDoctor((modal as { type: 'edit'; doctor: DoctorProfile }).doctor.id, form);
        toast.success('Doctor updated.');
      }
      refresh();
      setModal(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save doctor.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoctor(id);
    refresh();
    toast.success('Doctor removed.');
  };

  const handleAddLeave = async (doctor: DoctorProfile) => {
    if (!leaveDate) return;
    const appts = await getDoctorAppointments(doctor.id);
    const affected = appts.filter(a => a.date === leaveDate && (a.status === 'confirmed' || a.status === 'held'));
    await Promise.all(affected.map(a => cancelAppointment(a.id)));
    await markDoctorLeave(doctor.id, [leaveDate]);
    refresh();
    queryClient.invalidateQueries({ queryKey: ['all-appointments'] });
    if (affected.length > 0) toast.warning(`${affected.length} appointment${affected.length > 1 ? 's' : ''} cancelled due to leave.`);
    else toast.success('Leave day added.');
    setLeaveDate('');
    // Refresh leave modal
    const updated = doctors.find(d => d.id === doctor.id);
    if (updated) setModal({ type: 'leave', doctor: { ...updated, leaveDays: [...updated.leaveDays, leaveDate] } });
  };

  const handleRemoveLeave = async (doctor: DoctorProfile, date: string) => {
    await removeDoctorLeave(doctor.id, date);
    refresh();
    toast.success('Leave removed.');
    setModal({ type: 'leave', doctor: { ...doctor, leaveDays: doctor.leaveDays.filter(d => d !== date) } });
  };

  return (
    <PortalShell role="admin">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">Manage Doctors</h1>
            <p className="text-sm text-[#1A2523]/50 mt-1">{doctors.length} doctors registered</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2C3E4A] text-white text-sm font-medium rounded-lg hover:bg-[#1E2E38] active:scale-[0.98] transition-all"
          >
            <Plus size={15} /> Add Doctor
          </button>
        </div>

        <div className="bg-white border border-[#E0E8E4] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-slate-300" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0F5F2] bg-[#F6F8F7]">
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider hidden md:table-cell">Specialisation</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider hidden lg:table-cell">Slot</th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#1A2523]/40 uppercase tracking-wider">Leave</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id} className="border-b border-[#F0F5F2] last:border-0 hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={doc.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2C3E4A&color=fff&size=40`}
                          alt={doc.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p className="font-medium text-[#1A2523]">{doc.name}</p>
                          <p className="text-xs text-[#1A2523]/40 font-mono">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1A2523]/70 hidden md:table-cell">{doc.specialisation}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1A2523]/60 hidden lg:table-cell">{doc.slotDurationMinutes}min</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModal({ type: 'leave', doctor: doc })}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#2C3E4A] transition-colors"
                      >
                        <Calendar size={12} /> {doc.leaveDays.length} day{doc.leaveDays.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(doc)} className="p-1.5 rounded-md text-[#1A2523]/40 hover:text-[#2C3E4A] hover:bg-slate-100 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-md text-[#1A2523]/40 hover:text-[#C4482E] hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && doctors.length === 0 && (
            <p className="text-center py-8 text-sm text-[#1A2523]/40">No doctors yet. Add the first one.</p>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[#E0E8E4] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F5F2]">
              <h3 className="font-serif font-semibold text-[#1A2523]">
                {modal.type === 'add' ? 'Add Doctor' : 'Edit Doctor Profile'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-md text-[#1A2523]/40 hover:bg-[#F6F8F7]">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: 'Full Name *', field: 'name' as const, placeholder: 'Dr. First Last', col: 2 },
                  { label: 'Email *', field: 'email' as const, placeholder: 'doctor@clinic.com', col: 2 },
                ] as const).map(({ label, field, placeholder, col }) => (
                  <div key={field} className={`col-span-2 sm:col-span-${col}`}>
                    <label className="block text-xs font-medium text-[#1A2523]/60 mb-1">{label}</label>
                    <input type="text" value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] transition-all"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A2523]/60 mb-1">Specialisation</label>
                <select value={form.specialisation}
                  onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                    focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] appearance-none transition-all"
                >
                  {SPECIALISATIONS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A2523]/60 mb-1">Slot Duration (minutes)</label>
                <input type="number" min="10" max="120" step="5" value={form.slotDurationMinutes}
                  onChange={e => setForm(f => ({ ...f, slotDurationMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                    focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1A2523]/60 mb-1">Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Brief professional bio…"
                  className="w-full px-3 py-2 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                    focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] resize-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#F0F5F2] flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 bg-[#F6F8F7] text-[#1A2523]/70 text-sm font-medium rounded-lg hover:bg-[#E8EFEC] transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2C3E4A] text-white text-sm font-medium rounded-lg hover:bg-[#1E2E38] disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : (modal.type === 'add' ? 'Add Doctor' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {modal?.type === 'leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-[#E0E8E4] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F5F2]">
              <h3 className="font-serif font-semibold text-[#1A2523]">Leave — {modal.doctor.name}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-md text-[#1A2523]/40 hover:bg-[#F6F8F7]">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A2523]/60 mb-2">Add Leave Day</label>
                <div className="flex gap-2">
                  <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 bg-[#F6F8F7] border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                      focus:outline-none focus:ring-2 focus:ring-[#2C3E4A]/30 focus:border-[#2C3E4A] transition-all"
                  />
                  <button onClick={() => handleAddLeave(modal.doctor)}
                    className="px-3 py-2 bg-[#2C3E4A] text-white rounded-lg hover:bg-[#1E2E38] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {leaveDate && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    Confirmed appointments on this date will be cancelled.
                  </div>
                )}
              </div>
              {modal.doctor.leaveDays.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#1A2523]/60 mb-2">Current Leave Days</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {modal.doctor.leaveDays.sort().map(day => (
                      <div key={day} className="flex items-center justify-between bg-[#F6F8F7] rounded-lg px-3 py-2">
                        <span className="text-sm font-mono text-[#1A2523]">
                          {new Date(day + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={() => handleRemoveLeave(modal.doctor, day)} className="text-[#C4482E]/60 hover:text-[#C4482E] ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#F0F5F2]">
              <button onClick={() => setModal(null)}
                className="w-full py-2.5 bg-[#F6F8F7] text-[#1A2523]/70 text-sm font-medium rounded-lg hover:bg-[#E8EFEC] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
