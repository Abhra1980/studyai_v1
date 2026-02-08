import apiClient from './api';

export interface ProgressSummary {
  completed: number;
  total: number;
}

export const progressService = {
  async getProgress(): Promise<ProgressSummary> {
    const response = await apiClient.get<ProgressSummary>('/progress');
    return response.data;
  },

  async markTopicComplete(topicId: number, quizScore?: number): Promise<void> {
    await apiClient.post(`/progress/${topicId}/complete`, {
      quiz_score: quizScore,
    });
  },
};
