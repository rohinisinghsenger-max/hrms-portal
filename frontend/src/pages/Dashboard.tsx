import { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, XCircle, Clock, Building2,
  RefreshCw, TrendingUp, CalendarDays, ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { LoadingPage } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import type { DashboardStats } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        <p className="text-sm text-gray-500 truncate">{label}</p>
        {trend && <p className="text-xs text-emerald-600 font-medium mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingPage />;
  if (error || !stats) return <ErrorState message={error || 'Failed to load dashboard'} onRetry={load} />;

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Welcome back, Admin 👋</h2>
            <p className="text-primary-100 text-sm mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold">{stats.attendance_rate_today}%</p>
              <p className="text-xs text-primary-100">Attendance Rate Today</p>
            </div>
            <button
              onClick={load}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-100 mb-1">
            <span>Today's Attendance</span>
            <span>{stats.present_today} / {stats.total_employees}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${stats.attendance_rate_today}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={stats.total_employees}
          icon={Users}
          iconBg="bg-primary-100"
          iconColor="text-primary-600"
          trend={`${stats.total_departments} departments`}
        />
        <StatCard
          label="Present Today"
          value={stats.present_today}
          icon={CheckCircle2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Absent Today"
          value={stats.absent_today}
          icon={XCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          label="Late / This Week"
          value={`${stats.late_today} / ${stats.attendance_this_week}`}
          icon={Clock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent employees */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Employees</h3>
            <Link to="/employees" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recent_employees.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No employees yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-700">{emp.full_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">{emp.department} · {emp.employee_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{emp.total_present_days}</p>
                    <p className="text-xs text-gray-400">days present</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link
              to="/employees"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors group"
            >
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-900">Manage Employees</p>
                <p className="text-xs text-primary-500">Add or view records</p>
              </div>
              <ArrowRight size={14} className="text-primary-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/attendance"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarDays size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Mark Attendance</p>
                <p className="text-xs text-emerald-500">Track daily attendance</p>
              </div>
              <ArrowRight size={14} className="text-emerald-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
              <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">{stats.total_departments} Departments</p>
                <p className="text-xs text-gray-400">Across the organization</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <TrendingUp size={13} className="text-emerald-500" />
              <span>
                <span className="text-gray-600 font-medium">{stats.attendance_this_week} records</span> this week
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
