import { apiClient } from './api';

export const subjectService = {
  getAllSubjects: async () => {
    return apiClient.get('/subjects');
  },
  getTopicsBySubject: async (subjectId: string) => {
    return apiClient.get(`/topics/subject/${subjectId}`);
  },
  getSubTopicsByTopic: async (topicId: string) => {
    return apiClient.get(`/sub-topics/topic/${topicId}`);
  },
  getSubTopicsByMultiTopics: async (topicIds: string[]) => {
    return apiClient.post('/sub-topics/multi-topics', { topicIds });
  }
};
