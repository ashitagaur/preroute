import { apiClient } from './api';
import { Test } from '../types';

export const testService = {
  getAll: async () => {
    return apiClient.get('/tests');
  },
  getById: async (id: string) => {
    return apiClient.get(`/tests/${id}`);
  },
  create: async (data: Partial<Test>) => {
    return apiClient.post('/tests', data);
  },
  update: async (id: string, data: Partial<Test>) => {
    return apiClient.put(`/tests/${id}`, data);
  },
  publish: async (id: string) => {
    return apiClient.put(`/tests/${id}`, { status: 'live' });
  }
};
