import type { AttendanceStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

const config: Record<AttendanceStatus, { label: string; className: string }> = {
  Present:  { label: 'Present',  className: 'badge-present'  },
  Absent:   { label: 'Absent',   className: 'badge-absent'   },
  Late:     { label: 'Late',     className: 'badge-late'     },
  'Half Day': { label: 'Half Day', className: 'badge-halfday' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status] ?? { label: status, className: 'badge bg-gray-100 text-gray-700' };
  return (
    <span className={className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
