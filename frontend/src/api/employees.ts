import { apiClient } from './client';
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../types';

export const employeeApi = {
  getAll: async (search?: string, department?: string): Promise<Employee[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (department) params.department = department;
    const res = await apiClient.get<Employee[]>('/api/employees', { params });
    return res.data;
  },

  create: async (data: EmployeeCreate): Promise<Employee> => {
    const res = await apiClient.post<Employee>('/api/employees', data);
    return res.data;
  },

  update: async (id: number, data: EmployeeUpdate): Promise<Employee> => {
    const res = await apiClient.put<Employee>(`/api/employees/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/employees/${id}`);
  },

  getDepartments: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/api/employees/departments');
    return res.data;
  },
};
