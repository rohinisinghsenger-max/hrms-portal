import { apiClient } from './client';
import type { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/api/dashboard/stats');
    return res.data;
  },
};
