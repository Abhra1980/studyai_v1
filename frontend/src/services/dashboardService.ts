import apiClient from './api';

export interface DueForReviewItem {
  topic_id: number;
  title: string;
}

export interface WeeklyDay {
  day: string;
  topics: number;
  mins: number;
}

export interface DashboardData {
  completed: number;
  total: number;
  streak: number;
  personal_best_streak: number;
  study_hours: number;
  topics_this_month: number;
  avg_quiz_score: number;
  due_for_review: DueForReviewItem[];
  weekly_activity: WeeklyDay[];
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  },
};
