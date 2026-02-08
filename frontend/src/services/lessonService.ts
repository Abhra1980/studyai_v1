import apiClient from './api';
import type { Lesson, LearnRequest, CachedContent } from '@/types/lesson';

export const lessonService = {
  // Get cached lesson for a topic
  async getCachedLesson(topicId: number) {
    try {
      const response = await apiClient.get<CachedContent>(`/learn/${topicId}/cached`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Generate a new lesson (POST request)
  async generateLesson(topicId: number, request: LearnRequest = {}) {
    try {
      const body: Record<string, unknown> = {
        user_level: request.user_level || 'intermediate',
        focus_areas: request.focus_areas || [],
        include_code: request.include_code !== false,
        include_quiz: request.include_quiz !== false,
      };
      if (request.sub_topic_id != null) {
        body.sub_topic_id = request.sub_topic_id;
      }
      const response = await apiClient.post<Lesson>(`/learn/${topicId}`, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate lesson direct (non-streaming POST)
  async generateLessonDirect(topicId: number, request: LearnRequest = {}) {
    try {
      const response = await apiClient.post<Lesson>(`/learn/${topicId}`, request);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate more context from follow-up question
  async generateMoreContext(
    topicId: number,
    question: string,
    existingExplanation?: string
  ): Promise<MoreContextResponse> {
    const response = await apiClient.post<MoreContextResponse>(
      `/learn/${topicId}/more-context`,
      { question, existing_explanation: existingExplanation }
    );
    return response.data;
  },
};

export interface MoreContextResponse {
  explanation: string;
  code_examples: Array<{ language?: string; code?: string; explanation?: string }>;
}

export default lessonService;
