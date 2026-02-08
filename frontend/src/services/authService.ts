import apiClient from './api';

export const authService = {
  async forgotPassword(email: string): Promise<{ reset_token: string }> {
    const res = await apiClient.post<{ message: string; reset_token: string }>(
      '/auth/forgot-password',
      { email }
    );
    return { reset_token: res.data.reset_token };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};
