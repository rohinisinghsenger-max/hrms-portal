// ─── Employee ─────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string | null;
  phone: string | null;
  created_at: string;
  total_present_days: number;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  position?: string;
  phone?: string;
}

export interface EmployeeUpdate {
  full_name?: string;
  email?: string;
  department?: string;
  position?: string;
  phone?: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
  employee_name: string;
  employee_code: string;
}

export interface AttendanceCreate {
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceUpdate {
  status: AttendanceStatus;
  note?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_employees: number;
  total_departments: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_rate_today: number;
  attendance_this_week: number;
  recent_employees: Employee[];
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[];
}
