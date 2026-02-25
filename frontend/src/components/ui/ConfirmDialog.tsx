import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const colorMap = {
    danger:  { bg: 'bg-red-100',    icon: 'text-red-600',    btn: 'btn-danger' },
    warning: { bg: 'bg-amber-100',  icon: 'text-amber-600',  btn: 'btn bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm' },
  };
  const colors = colorMap[variant];

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <AlertTriangle className={colors.icon} size={18} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} disabled={loading} className="btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} className={colors.btn + ' btn'}>
          {loading && <LoadingSpinner size="sm" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
