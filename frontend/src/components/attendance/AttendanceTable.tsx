import { useState } from 'react';
import { Trash2, CalendarDays, Pencil } from 'lucide-react';
import type { Attendance, AttendanceStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { attendanceApi } from '../../api/attendance';
import { EmptyState } from '../ui/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  records: Attendance[];
  onRefresh: () => void;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Half Day'];

export function AttendanceTable({ records, onRefresh }: Props) {
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editRecord, setEditRecord]   = useState<Attendance | null>(null);
  const [editStatus, setEditStatus]   = useState<AttendanceStatus>('Present');
  const [editNote,   setEditNote]     = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await attendanceApi.delete(deletingId);
      toast.success('Record deleted');
      onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
    }
  };

  const openEdit = (r: Attendance) => {
    setEditRecord(r);
    setEditStatus(r.status as AttendanceStatus);
    setEditNote(r.note ?? '');
  };

  const handleEdit = async () => {
    if (!editRecord) return;
    setEditLoading(true);
    try {
      await attendanceApi.update(editRecord.id, { status: editStatus, note: editNote || undefined });
      toast.success('Record updated');
      onRefresh();
      setEditRecord(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setEditLoading(false);
    }
  };

  if (records.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No attendance records"
        description="Mark attendance for employees to see records here."
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="table-th">Employee</th>
              <th className="table-th">Date</th>
              <th className="table-th">Status</th>
              <th className="table-th">Note</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} className="table-tr">
                <td className="table-td">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{rec.employee_name}</p>
                    <p className="text-xs text-gray-400">{rec.employee_code}</p>
                  </div>
                </td>
                <td className="table-td text-gray-600">
                  {format(new Date(rec.date + 'T00:00:00'), 'EEE, MMM d yyyy')}
                </td>
                <td className="table-td">
                  <StatusBadge status={rec.status as AttendanceStatus} />
                </td>
                <td className="table-td text-xs text-gray-500 max-w-[200px] truncate">
                  {rec.note || <span className="text-gray-300">—</span>}
                </td>
                <td className="table-td text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(rec)}
                      className="btn btn-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-200"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(rec.id)}
                      className="btn btn-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {records.map((rec) => (
          <div key={rec.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{rec.employee_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{format(new Date(rec.date + 'T00:00:00'), 'EEE, MMM d yyyy')}</p>
              </div>
              <StatusBadge status={rec.status as AttendanceStatus} />
            </div>
            {rec.note && <p className="text-xs text-gray-500 mt-2 italic">"{rec.note}"</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => openEdit(rec)} className="btn-secondary btn-sm">
                <Pencil size={12} /> Edit
              </button>
              <button onClick={() => handleDeleteClick(rec.id)} className="btn btn-sm text-red-500 hover:bg-red-50 border border-red-200">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Edit Attendance" size="sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-3">
              Updating record for <strong>{editRecord?.employee_name}</strong> on{' '}
              <strong>{editRecord ? format(new Date(editRecord.date + 'T00:00:00'), 'MMM d, yyyy') : ''}</strong>
            </p>
          </div>
          <div>
            <label className="form-label">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditStatus(s)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all
                    ${editStatus === s
                      ? s === 'Present' ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : s === 'Absent' ? 'border-red-400 bg-red-50 text-red-700'
                        : s === 'Late' ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Note</label>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="form-input resize-none"
              rows={2}
              maxLength={300}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={() => setEditRecord(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleEdit} disabled={editLoading} className="btn-primary">
            Save Changes
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        confirmLabel="Delete Record"
      />
    </>
  );
}
