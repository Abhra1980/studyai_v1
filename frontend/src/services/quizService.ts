import apiClient from './api';
import type { Quiz } from '@/types/quiz';

export interface QuizRequest {
  user_level?: string;
  focus_areas?: string[];
  num_questions?: number;
  difficulty?: 'easy' | 'intermediate' | 'hard';
}

export const quizService = {
  // Generate a quiz for a topic
  async generateQuiz(topicId: number, request?: QuizRequest) {
    const response = await apiClient.post<Quiz>(`/quiz/${topicId}`, {
      user_level: request?.user_level || 'intermediate',
      focus_areas: request?.focus_areas || [],
      num_questions: request?.num_questions || 5,
      difficulty: request?.difficulty || 'intermediate',
    });
    return response.data;
  },
};

export default quizService;
