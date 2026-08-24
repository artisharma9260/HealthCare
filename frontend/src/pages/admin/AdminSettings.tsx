import PortalShell from '@/components/layout/PortalShell';
import { useQuery } from '@tanstack/react-query';
import { getDoctors } from '@/lib/doctorService';
import { getAppointments } from '@/lib/appointmentService';
import { Settings, Shield, Bell, Database, Globe, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';

export default function AdminSettings() {
  const { data: doctors = [], isLoading: loadDoctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors });
  const { data: appointments = [], isLoading: loadAppts } = useQuery({ queryKey: ['all-appointments'], queryFn: getAppointments });

  const pendingNotifications = 0; // future: fetch from notifications table
  const aiSuccessRate = appointments.length > 0
    ? Math.round((appointments.filter(a => a.preVisitSummary?.llmStatus === 'success').length / appointments.length) * 100)
    : 0;

  return (
    <PortalShell role="admin">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1A2523]">System Settings</h1>
          <p className="text-sm text-[#1A2523]/50 mt-1">Configuration and live status for the Healthcare Manager platform</p>
        </div>

        {/* Live Backend Status */}
        <div className="bg-white border border-[#C4D9CE] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#3D7A60] animate-pulse" />
            <h3 className="font-semibold text-[#1A2523] text-sm">Live Backend Status</h3>
            <span className="ml-auto text-xs font-mono text-[#3D7A60] bg-[#E8F4F0] px-2 py-0.5 rounded-full">OnSpace Cloud</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Doctors in DB', value: loadDoctors ? '…' : String(doctors.length) },
              { label: 'Total Appointments', value: loadAppts ? '…' : String(appointments.length) },
              { label: 'AI Success Rate', value: loadAppts ? '…' : `${aiSuccessRate}%` },
              { label: 'Pending Notifications', value: String(pendingNotifications) },
            ].map(stat => (
              <div key={stat.label} className="bg-[#F6F8F7] rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-[#1A2523]">{stat.value}</p>
                <p className="text-xs text-[#1A2523]/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {[
            {
              icon: <Shield size={18} />,
              title: 'Authentication & Security',
              status: 'Active',
              items: [
                'Email + Password authentication (OnSpace Cloud Auth)',
                'Role-based access: Patient / Doctor / Admin',
                'JWT sessions with automatic token refresh',
                'Minimum password length: 6 characters',
              ],
            },
            {
              icon: <Sparkles size={18} />,
              title: 'AI Summaries (OnSpace AI)',
              status: 'Active',
              items: [
                'Model: google/gemini-3-flash-preview',
                'Pre-visit: urgency triage, chief complaint, 3 suggested questions',
                'Post-visit: patient-friendly summary, medication schedule, follow-up steps',
                'Graceful failure: appointments never blocked by AI errors',
                'Retry on failure: LLM status tracked per appointment',
              ],
            },
            {
              icon: <Database size={18} />,
              title: 'Database (PostgreSQL)',
              status: 'Active',
              items: [
                'Tables: user_profiles, doctor_profiles, appointments, slot_holds, notifications',
                'Row-Level Security enabled on all tables',
                'Slot hold TTL: 5 minutes with unique compound index',
                'Atomic booking: hold → confirm with conflict prevention',
                'Indexes on patient_id, doctor_id, date, status',
              ],
            },
            {
              icon: <Bell size={18} />,
              title: 'Notification System',
              status: 'Configured',
              items: [
                'Notification queue table with status tracking (pending / sent / failed)',
                'Types: booking_confirmation, reminder, cancellation, leave_notice, medication_reminder',
                'Leave management: auto-cancels affected appointments on leave day creation',
                'Ready for email integration (Resend / SendGrid via Edge Function)',
              ],
            },
            {
              icon: <Globe size={18} />,
              title: 'Google Calendar Integration',
              status: 'Not Connected',
              items: [
                'Architecture ready: googleEventId fields in appointments table',
                'Requires: Google OAuth 2.0 setup in OnSpace Cloud Auth settings',
                'On booking: create events for patient and doctor',
                'On cancellation/reschedule: update or delete events via API',
              ],
            },
          ].map(section => (
            <div key={section.title} className="bg-white border border-[#E0E8E4] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1A2523] text-sm">{section.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${section.status === 'Active' || section.status === 'Configured'
                          ? 'bg-[#E8F4F0] text-[#3D7A60]'
                          : 'bg-amber-50 text-amber-700'}`}>
                        {section.status === 'Active' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Active</span>
                        ) : section.status === 'Configured' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Configured</span>
                        ) : (
                          <span className="flex items-center gap-1"><XCircle size={10} /> {section.status}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#1A2523]/70">
                    <span className="w-1 h-1 bg-[#6B9080] rounded-full shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-[#E8EFEC] border border-[#C4D9CE] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Settings size={18} className="text-[#1C4A45] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1C4A45]">Production Checklist</p>
              <ul className="mt-2 space-y-1">
                {[
                  'Backend: OnSpace Cloud (PostgreSQL + Auth + Edge Functions) ✅',
                  'AI: OnSpace AI (Gemini 3 Flash) ✅',
                  'Email notifications: Add Resend/SendGrid Edge Function',
                  'Google Calendar OAuth: Configure in OnSpace Cloud Auth Settings',
                  'Medication reminders: Implement scheduled Edge Function',
                ].map((item, i) => (
                  <li key={i} className="text-xs text-[#1A2523]/60 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">{item.includes('✅') ? '✅' : '○'}</span>
                    <span>{item.replace(' ✅', '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
