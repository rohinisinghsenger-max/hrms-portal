import { useState, useEffect, useCallback } from 'react';
import { CalendarPlus, Filter, X, Calendar, Users, BarChart2 } from 'lucide-react';
import { attendanceApi } from '../api/attendance';
import { employeeApi } from '../api/employees';
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import type { Attendance, Employee, AttendanceStatus } from '../types';

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Half Day'];

const STATUS_STAT_CONFIG: { status: AttendanceStatus; label: string; color: string; bg: string }[] = [
  { status: 'Present',  label: 'Present',  color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { status: 'Absent',   label: 'Absent',   color: 'text-red-700',     bg: 'bg-red-50'     },
  { status: 'Late',     label: 'Late',     color: 'text-amber-700',   bg: 'bg-amber-50'   },
  { status: 'Half Day', label: 'Half Day', color: 'text-blue-700',    bg: 'bg-blue-50'    },
];

export default function Attendance() {
  const [records, setRecords]       = useState<Attendance[]>([]);
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showModal, setShowModal]   = useState(false);

  // Filters – use local date, not UTC, so "today" is correct in every timezone
  const _d   = new Date();
  const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [empFilter, setEmpFilter]   = useState('');
  const [statusFilter, setStatus]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [recs, emps] = await Promise.all([
        attendanceApi.getAll({
          date_from:   dateFrom || undefined,
          date_to:     dateTo   || undefined,
          employee_id: empFilter ? Number(empFilter) : undefined,
          status:      statusFilter || undefined,
        }),
        employeeApi.getAll(),
      ]);
      setRecords(recs);
      setEmployees(emps);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, empFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setEmpFilter('');
    setStatus('');
  };

  const isFiltered = !!dateFrom || !!dateTo || !!empFilter || !!statusFilter;

  // Summary counts from current records
  const counts = STATUS_STAT_CONFIG.map(({ status, label, color, bg }) => ({
    label,
    color,
    bg,
    count: records.filter((r) => r.status === status).length,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${records.length} record${records.length !== 1 ? 's' : ''}`}
            {isFiltered && ' (filtered)'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <CalendarPlus size={16} />
          Mark Attendance
        </button>
      </div>

      {/* Mini stats bar */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {counts.map(({ label, count, color, bg }) => (
            <div key={label} className={`card p-4 flex items-center gap-3 ${bg} border-0`}>
              <BarChart2 size={16} className={color} />
              <div>
                <p className={`text-lg font-extrabold ${color}`}>{count}</p>
                <p className={`text-xs ${color} opacity-70`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date From */}
          <div>
            <label className="form-label text-xs">From Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                max={today}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input pl-9"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="form-label text-xs">To Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                max={today}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input pl-9"
              />
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="form-label text-xs">Employee</label>
            <div className="relative">
              <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={empFilter}
                onChange={(e) => setEmpFilter(e.target.value)}
                className="form-input pl-9"
              >
                <option value="">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="form-label text-xs">Status</label>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input pl-9"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isFiltered && (
          <div className="flex justify-end mt-3">
            <button onClick={clearFilters} className="btn-ghost text-sm">
              <X size={14} /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingPage />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <AttendanceTable records={records} onRefresh={load} />
        )}
      </div>

      <MarkAttendanceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={load}
      />
    </div>
  );
}
