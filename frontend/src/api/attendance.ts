import { apiClient } from './client';
import type { Attendance, AttendanceCreate, AttendanceUpdate } from '../types';

export const attendanceApi = {
  getAll: async (params?: {
    date_from?: string;
    date_to?: string;
    employee_id?: number;
    status?: string;
  }): Promise<Attendance[]> => {
    const res = await apiClient.get<Attendance[]>('/api/attendance', { params });
    return res.data;
  },

  mark: async (data: AttendanceCreate): Promise<Attendance> => {
    const res = await apiClient.post<Attendance>('/api/attendance', data);
    return res.data;
  },

  update: async (id: number, data: AttendanceUpdate): Promise<Attendance> => {
    const res = await apiClient.put<Attendance>(`/api/attendance/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/attendance/${id}`);
  },

  getByEmployee: async (employeeId: number): Promise<Attendance[]> => {
    const res = await apiClient.get<Attendance[]>(`/api/attendance/employee/${employeeId}`);
    return res.data;
  },
};
