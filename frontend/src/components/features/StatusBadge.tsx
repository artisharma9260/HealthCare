import { URGENCY_STYLES, STATUS_STYLES } from '@/constants';
import type { UrgencyLevel, AppointmentStatus } from '@/types';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  size?: 'sm' | 'md';
}

export function UrgencyBadge({ level, size = 'md' }: UrgencyBadgeProps) {
  const styles = URGENCY_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium
      ${styles.bg} ${styles.text} ${styles.border}
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} aria-hidden="true" />
      {level} Priority
    </span>
  );
}

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium
      ${styles.bg} ${styles.text} ${styles.border}
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0`}
        style={{ backgroundColor: styles.text.replace('text-', '').includes('[') 
          ? styles.text.replace('text-[', '').replace(']', '') 
          : undefined }}
        aria-hidden="true" 
      />
      {styles.label}
    </span>
  );
}
