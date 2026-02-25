import { useState } from 'react';
import { Trash2, Mail, Phone, Building2, CalendarDays, CheckCircle2, Award } from 'lucide-react';
import type { Employee } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { employeeApi } from '../../api/employees';
import { EmptyState } from '../ui/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  employees: Employee[];
  onRefresh: () => void;
}

export function EmployeeTable({ employees, onRefresh }: Props) {
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await employeeApi.delete(deletingId);
      toast.success('Employee deleted successfully');
      onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const emp = employees.find((e) => e.id === deletingId);

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No employees found"
        description="Add your first employee to get started with HRMS."
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
              <th className="table-th">Department</th>
              <th className="table-th">Contact</th>
              <th className="table-th text-center">Present Days</th>
              <th className="table-th">Joined</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="table-tr">
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-700">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{emp.full_name}</p>
                      <p className="text-xs text-gray-400">{emp.employee_id}</p>
                    </div>
                  </div>
                </td>

                <td className="table-td">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{emp.department}</p>
                    {emp.position && <p className="text-xs text-gray-400">{emp.position}</p>}
                  </div>
                </td>

                <td className="table-td">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Mail size={11} className="text-gray-400" />
                      <span className="truncate max-w-[170px]">{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" />
                        {emp.phone}
                      </div>
                    )}
                  </div>
                </td>

                <td className="table-td text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="font-semibold text-gray-800">{emp.total_present_days}</span>
                  </div>
                </td>

                <td className="table-td text-sm text-gray-500">
                  {format(new Date(emp.created_at), 'MMM d, yyyy')}
                </td>

                <td className="table-td text-right">
                  <button
                    onClick={() => handleDeleteClick(emp.id)}
                    className="btn btn-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                    title="Delete employee"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {employees.map((emp) => (
          <div key={emp.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-700">{emp.full_name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{emp.full_name}</p>
                  <p className="text-xs text-gray-400">{emp.employee_id}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteClick(emp.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><Building2 size={12} />{emp.department}</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" />{emp.total_present_days} present days</div>
              <div className="flex items-center gap-1.5 col-span-2"><Mail size={12} />{emp.email}</div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Employee"
        message={`Are you sure you want to delete ${emp?.full_name ?? 'this employee'}? This will permanently remove all their attendance records.`}
        confirmLabel="Delete Employee"
      />
    </>
  );
}
