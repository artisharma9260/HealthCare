export const URGENCY_STYLES = {
  Low: {
    bg: 'bg-[#E8F4F0]',
    text: 'text-[#3D7A60]',
    border: 'border-[#6B9080]',
    dot: 'bg-[#6B9080]',
    label: 'Low Priority',
  },
  Medium: {
    bg: 'bg-[#FFF3E0]',
    text: 'text-[#B5692A]',
    border: 'border-[#D68A3C]',
    dot: 'bg-[#D68A3C]',
    label: 'Medium Priority',
  },
  High: {
    bg: 'bg-[#FDF0EE]',
    text: 'text-[#A33A25]',
    border: 'border-[#C4482E]',
    dot: 'bg-[#C4482E]',
    label: 'High Priority',
  },
} as const;

export const STATUS_STYLES = {
  held: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'On Hold' },
  confirmed: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', label: 'Confirmed' },
  completed: { bg: 'bg-[#E8F4F0]', text: 'text-[#3D7A60]', border: 'border-[#6B9080]', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', label: 'Cancelled' },
  'no-show': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', label: 'No Show' },
} as const;

export const PORTAL_ACCENT = {
  patient: {
    sidebar: 'bg-[#E8EFEC]',
    accent: '#6B9080',
    activeItem: 'bg-[#D0E2DA] text-[#1C4A45]',
    badge: 'bg-[#6B9080] text-white',
  },
  doctor: {
    sidebar: 'bg-[#1C4A45]',
    accent: '#1C4A45',
    activeItem: 'bg-[#2A6B63] text-white',
    badge: 'bg-[#1C4A45] text-white',
  },
  admin: {
    sidebar: 'bg-[#2C3E4A]',
    accent: '#2C3E4A',
    activeItem: 'bg-[#3D5264] text-white',
    badge: 'bg-[#2C3E4A] text-white',
  },
} as const;
