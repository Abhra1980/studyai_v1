// API Response types matching backend endpoints

export interface SubTopic {
  id: number;
  topic_id: number;
  content: string;
}

export interface Topic {
  id: number;
  number: string;
  title: string;
  unit_id?: number;
  unit_name: string;
  main_topic_name: string;
  sub_topics: SubTopic[];
}

export interface Unit {
  id: number;
  name: string;
  main_topic_id?: number;
  topics_count?: number;
  topics?: TopicBrief[];
}

export interface TopicBrief {
  id: number;
  number: string;
  title: string;
}

export interface MainTopic {
  id: number;
  name: string;
  sub_topic_count?: number;
  unit_count?: number;
  topic_count?: number;
  units?: Unit[];
}

export interface SearchResult {
  topic_id: number;
  topic_number: string;
  topic_title: string;
  unit_name: string;
  main_topic_name: string;
  matched_sub_topic: string | null;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  database: string;
  llm_provider: string;
  llm_model: string;
}
