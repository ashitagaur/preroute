import { apiClient } from './api';
import { Question } from '../types';

export const questionService = {
  bulkCreate: async (questions: Question[]) => {
    return apiClient.post('/questions/bulk', { questions });
  },
  fetchBulk: async (questionIds: string[]) => {
    return apiClient.post('/questions/fetchBulk', { question_ids: questionIds });
  }
};
