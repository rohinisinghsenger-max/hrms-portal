import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Filter, X } from 'lucide-react';
import { employeeApi } from '../api/employees';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import type { Employee } from '../types';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showModal, setShowModal]   = useState(false);

  // Filters
  const [search, setSearch]         = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [emps, depts] = await Promise.all([
        employeeApi.getAll(search || undefined, deptFilter || undefined),
        employeeApi.getDepartments(),
      ]);
      setEmployees(emps);
      setDepartments(depts);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const clearFilters = () => {
    setSearch('');
    setDeptFilter('');
  };

  const isFiltered = !!search || !!deptFilter;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${employees.length} employee${employees.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Add Employee
        </button>
      </div>

      {/* Filters bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID…"
            className="form-input pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Department filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="form-input pl-9 min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button onClick={clearFilters} className="btn-ghost text-sm">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingPage />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <EmployeeTable employees={employees} onRefresh={load} />
        )}
      </div>

      <AddEmployeeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={load}
      />
    </div>
  );
}
