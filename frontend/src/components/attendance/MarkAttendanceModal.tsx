import { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendance';
import { employeeApi } from '../../api/employees';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import type { AttendanceCreate, AttendanceStatus, Employee } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Half Day'];

/** Returns today's date as YYYY-MM-DD in the user's LOCAL timezone (not UTC). */
function localToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function MarkAttendanceModal({ open, onClose, onSuccess }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmps, setLoadingEmps] = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const today = localToday();
  const [form, setForm] = useState<AttendanceCreate>({
    employee_id: 0,
    date: today,
    status: 'Present',
    note: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AttendanceCreate, string>>>({});

  useEffect(() => {
    if (!open) return;
    setLoadingEmps(true);
    employeeApi
      .getAll()
      .then(setEmployees)
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoadingEmps(false));
  }, [open]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.employee_id) errs.employee_id = 'Select an employee';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await attendanceApi.mark({
        ...form,
        note: form.note?.trim() || undefined,
      });
      const emp = employees.find((e) => e.id === form.employee_id);
      toast.success(`Attendance marked for ${emp?.full_name ?? 'employee'}`);
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setForm({ employee_id: 0, date: today, status: 'Present', note: '' });
      setErrors({});
      onClose();
    }
  };

  const set = <K extends keyof AttendanceCreate>(k: K, v: AttendanceCreate[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const statusColors: Record<AttendanceStatus, string> = {
    Present:    'border-emerald-400 bg-emerald-50 text-emerald-700',
    Absent:     'border-red-400    bg-red-50    text-red-700',
    Late:       'border-amber-400  bg-amber-50  text-amber-700',
    'Half Day': 'border-blue-400   bg-blue-50   text-blue-700',
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Mark Attendance"
      description="Record attendance for an employee."
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Employee */}
          <div>
            <label className="form-label">Employee <span className="text-red-500">*</span></label>
            {loadingEmps ? (
              <div className="form-input flex items-center gap-2 text-gray-400">
                <LoadingSpinner size="sm" /> Loading employees…
              </div>
            ) : (
              <select
                value={form.employee_id || ''}
                onChange={(e) => set('employee_id', Number(e.target.value))}
                className={errors.employee_id ? 'form-input-error' : 'form-input'}
              >
                <option value="">Select employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            )}
            {errors.employee_id && <p className="form-error">{errors.employee_id}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="form-label">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.date}
              max={today}
              onChange={(e) => set('date', e.target.value)}
              className={errors.date ? 'form-input-error' : 'form-input'}
            />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="form-label">Status <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-150
                    ${form.status === s
                      ? statusColors[s]
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="form-label">Note <span className="text-gray-400 text-xs">(optional)</span></label>
            <textarea
              value={form.note ?? ''}
              onChange={(e) => set('note', e.target.value)}
              placeholder="Any additional notes…"
              rows={2}
              className="form-input resize-none"
              maxLength={300}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button type="button" onClick={handleClose} disabled={submitting} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting || loadingEmps} className="btn-primary">
            {submitting && <LoadingSpinner size="sm" />}
            Mark Attendance
          </button>
        </div>
      </form>
    </Modal>
  );
}
