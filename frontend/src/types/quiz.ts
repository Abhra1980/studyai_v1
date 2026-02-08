export interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Quiz {
  topic_id: number;
  topic_title: string;
  questions: Question[];
  model_used: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedIndex: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: QuizAnswer[];
  completedAt: string;
}
