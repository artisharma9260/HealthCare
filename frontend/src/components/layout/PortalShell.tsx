import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PORTAL_ACCENT } from '@/constants';
import type { UserRole } from '@/types';
import {
  Calendar, Users, LayoutDashboard, Search, FileText, Settings,
  LogOut, Menu, Bell, ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard size={18} /> },
    { label: 'Find Doctors', path: '/patient/search', icon: <Search size={18} /> },
    { label: 'My Appointments', path: '/patient/appointments', icon: <Calendar size={18} /> },
  ],
  doctor: [
    { label: 'Schedule', path: '/doctor', icon: <Calendar size={18} /> },
    { label: 'Appointments', path: '/doctor/appointments', icon: <FileText size={18} /> },
    { label: 'Patients', path: '/doctor/patients', icon: <Users size={18} /> },
  ],
  admin: [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Manage Doctors', path: '/admin/doctors', icon: <Users size={18} /> },
    { label: 'All Appointments', path: '/admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ],
};

const PORTAL_LABELS: Record<UserRole, string> = {
  patient: 'Patient Portal',
  doctor: 'Doctor Portal',
  admin: 'Admin Portal',
};

interface Props {
  children: ReactNode;
  role: UserRole;
}

export default function PortalShell({ children, role }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = NAV_ITEMS[role];

  const isActive = (path: string) =>
    location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-black/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
            <span className="text-sm font-bold text-white">H</span>
          </div>
          <div>
            <p className="text-xs font-mono text-white/60 uppercase tracking-wider">HealthCare</p>
            <p className="text-sm font-medium text-white leading-tight">{PORTAL_LABELS[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left
                ${active
                  ? role === 'patient'
                    ? 'bg-[#1C4A45] text-white font-medium'
                    : 'bg-white/15 text-white font-medium'
                  : role === 'patient'
                    ? 'text-[#1A2523]/70 hover:bg-[#D0E2DA] hover:text-[#1C4A45]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className={active ? 'opacity-100' : 'opacity-60'}>{item.icon}</span>
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className={`px-4 py-4 border-t ${role === 'patient' ? 'border-[#C4D9CE]' : 'border-white/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
            ${role === 'patient' ? 'bg-[#1C4A45] text-white' : 'bg-white/20 text-white'}`}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${role === 'patient' ? 'text-[#1A2523]' : 'text-white'}`}>
              {user?.name || 'User'}
            </p>
            <p className={`text-xs truncate ${role === 'patient' ? 'text-[#1A2523]/50' : 'text-white/50'}`}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`p-1.5 rounded-md transition-colors ${role === 'patient'
              ? 'text-[#1A2523]/40 hover:text-[#C4482E] hover:bg-red-50'
              : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-60 shrink-0 border-r
        ${role === 'patient' ? 'bg-[#E8EFEC] border-[#C4D9CE]' : ''}
        ${role === 'doctor' ? 'bg-[#1C4A45] border-[#154039]' : ''}
        ${role === 'admin' ? 'bg-[#2C3E4A] border-[#1E2E38]' : ''}
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className={`relative flex flex-col w-60 z-50
            ${role === 'patient' ? 'bg-[#E8EFEC]' : ''}
            ${role === 'doctor' ? 'bg-[#1C4A45]' : ''}
            ${role === 'admin' ? 'bg-[#2C3E4A]' : ''}
          `}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#E0E8E4] flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-md text-[#1A2523]/50 hover:bg-[#E8EFEC]"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-medium text-[#1A2523]/60 hidden lg:block">
              {navItems.find(i => isActive(i.path))?.label || 'Healthcare Manager'}
            </h1>
          </div>
          <button className="p-2 rounded-md text-[#1A2523]/40 hover:bg-[#E8EFEC] hover:text-[#1C4A45] transition-colors" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className={`hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full
            ${role === 'patient' ? 'bg-[#E8EFEC] text-[#3D7A60]' : ''}
            ${role === 'doctor' ? 'bg-[#E8F4F0] text-[#1C4A45]' : ''}
            ${role === 'admin' ? 'bg-slate-100 text-slate-600' : ''}
          `}>
            {PORTAL_LABELS[role]}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
