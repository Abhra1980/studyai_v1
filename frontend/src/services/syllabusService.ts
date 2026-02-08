import apiClient from './api';
import type { MainTopic, Topic, SearchResult, HealthResponse } from '@/types/syllabus';

export interface PartProgressItem {
  part_id: number;
  completed: number;
  total: number;
}

export const syllabusService = {
  // Get health status
  async getHealth() {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  // Get all main topics
  async listMainTopics() {
    const response = await apiClient.get<MainTopic[]>('/syllabus');
    return response.data;
  },

  // Get main topic with units and topics
  async getMainTopic(id: number) {
    const response = await apiClient.get<MainTopic>(`/syllabus/${id}`);
    return response.data;
  },

  // Get specific topic with sub-topics
  async getTopic(id: number) {
    const response = await apiClient.get<Topic>(`/syllabus/topics/${id}`);
    return response.data;
  },

  // Search topics
  async searchTopics(query: string, limit: number = 20) {
    const response = await apiClient.get<SearchResult[]>(`/syllabus/search/?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Get part progress (completed/total per part) for Curriculum grid
  async getPartProgress(): Promise<PartProgressItem[]> {
    const response = await apiClient.get<PartProgressItem[]>('/syllabus/part-progress');
    return response.data;
  },
};

export default syllabusService;
