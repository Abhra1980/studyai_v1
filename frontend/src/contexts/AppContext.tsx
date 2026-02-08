import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import type { MainTopic, Topic } from '@/types/syllabus';
import type { Lesson } from '@/types/lesson';
import type { Quiz } from '@/types/quiz';

interface AppContextType {
  currentMainTopic: MainTopic | null;
  setCurrentMainTopic: (topic: MainTopic | null) => void;

  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic | null) => void;

  currentLesson: Lesson | null;
  setCurrentLesson: (lesson: Lesson | null) => void;
  isLoadingLesson: boolean;
  setIsLoadingLesson: (loading: boolean) => void;

  currentQuiz: Quiz | null;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  isLoadingQuiz: boolean;
  setIsLoadingQuiz: (loading: boolean) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentMainTopic, setCurrentMainTopic] = useState<MainTopic | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      document.documentElement.classList.toggle('dark', newValue);
      return newValue;
    });
  }, []);

  const reset = useCallback(() => {
    setCurrentMainTopic(null);
    setCurrentTopic(null);
    setCurrentLesson(null);
    setCurrentQuiz(null);
    setIsLoadingLesson(false);
    setIsLoadingQuiz(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentMainTopic,
        setCurrentMainTopic,
        currentTopic,
        setCurrentTopic,
        currentLesson,
        setCurrentLesson,
        isLoadingLesson,
        setIsLoadingLesson,
        currentQuiz,
        setCurrentQuiz,
        isLoadingQuiz,
        setIsLoadingQuiz,
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        darkMode,
        toggleDarkMode,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
