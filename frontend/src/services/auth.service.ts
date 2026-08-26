import { apiClient } from './api';

export const authService = {
  login: async (userId: string, password: string) => {
    return apiClient.post('/auth/login', { userId, password });
  }
};
