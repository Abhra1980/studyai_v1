import { useMutation } from '@tanstack/react-query';
import { quizService, type QuizRequest } from '@/services/quizService';
import type { Quiz } from '@/types/quiz';
import { useState, useCallback } from 'react';

export function useGenerateQuiz(topicId: number) {
  return useMutation<Quiz, Error, QuizRequest | undefined>({
    mutationFn: (request) => quizService.generateQuiz(topicId, request),
  });
}

export interface QuizState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  isSubmitted: boolean;
}

export function useQuizState(quiz: Quiz | null) {
  const [state, setState] = useState<QuizState>({
    quiz,
    currentQuestionIndex: 0,
    selectedAnswers: Array(quiz?.questions?.length || 0).fill(null),
    isSubmitted: false,
  });

  const selectAnswer = useCallback((questionIndex: number, answerIndex: number) => {
    setState((prev) => {
      if (prev.isSubmitted) return prev;
      const newAnswers = [...prev.selectedAnswers];
      newAnswers[questionIndex] = answerIndex;
      return { ...prev, selectedAnswers: newAnswers };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.quiz && prev.currentQuestionIndex < prev.quiz.questions.length - 1) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        };
      }
      return prev;
    });
  }, []);

  const prevQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex > 0) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  const submitQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSubmitted: true,
    }));
  }, []);

  const getScore = useCallback(() => {
    if (!state.quiz || !state.isSubmitted) return 0;

    let correct = 0;
    state.quiz.questions.forEach((question, index) => {
      if (state.selectedAnswers[index] === question.correct_index) {
        correct++;
      }
    });

    return (correct / state.quiz.questions.length) * 100;
  }, [state]);

  const reset = useCallback((newQuiz: Quiz) => {
    setState({
      quiz: newQuiz,
      currentQuestionIndex: 0,
      selectedAnswers: Array(newQuiz.questions.length).fill(null),
      isSubmitted: false,
    });
  }, []);

  return {
    ...state,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    getScore,
    reset,
    currentQuestion: state.quiz?.questions[state.currentQuestionIndex] || null,
    progress: ((state.currentQuestionIndex + 1) / (state.quiz?.questions.length || 1)) * 100,
  };
}
