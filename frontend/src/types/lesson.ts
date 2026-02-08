export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
}

export interface Lesson {
  topic_id: number;
  topic_title: string;
  explanation: string;
  key_points: string[];
  code_examples: CodeExample[];
  math_formulas: string[];
  quiz?: { question: string; options: string[]; correct_index?: number; explanation?: string }[];
  further_reading: string[];
  model_used?: string;
}

export interface LearnRequest {
  user_level?: 'beginner' | 'intermediate' | 'advanced';
  focus_areas?: string[];
  include_code?: boolean;
  include_quiz?: boolean;
  sub_topic_id?: number;
}

export interface CachedContent {
  id: number;
  topic_id: number;
  content_type: string;
  content_json: Record<string, unknown>;
  model_used: string | null;
  created_at: string;
}
