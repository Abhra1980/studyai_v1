import apiClient from './api';

const ADMIN_EMAIL = 'virabhra@yahoo.com';

export function isAdminUser(email: string | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string | null;
  updated_at?: string | null;
}

export interface AdminUserProgress {
  user_id: string;
  email: string;
  name: string;
  completed: number;
  total: number;
  completed_topics: Array<{
    topic_id: number;
    title: string;
    unit_name: string;
    completed_at: string | null;
  }>;
}

export const adminService = {
  async getUserCount(): Promise<{ total: number; active: number }> {
    const res = await apiClient.get<{ total: number; active: number }>('/admin/users/count');
    return res.data;
  },

  async listUsers(activeOnly = false): Promise<AdminUser[]> {
    const res = await apiClient.get<AdminUser[]>('/admin/users', {
      params: { active_only: activeOnly },
    });
    return res.data;
  },

  async getUserProgress(userId: string): Promise<AdminUserProgress> {
    const res = await apiClient.get<AdminUserProgress>(`/admin/users/${userId}/progress`);
    return res.data;
  },

  async createUser(email: string, name: string, password: string): Promise<AdminUser> {
    const res = await apiClient.post<AdminUser>('/admin/users', {
      email,
      name,
      password,
    });
    return res.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
