import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider, AppProvider, useAuthContext } from '@/contexts';
import { ErrorBoundary } from '@/components/common';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage, RegisterPage, StudyAIPage } from '@/components/pages';
import { isAdminUser } from '@/services/adminService';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route (StudyAI uses its own full layout - no MainLayout)
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--sa-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--sa-border)] border-t-[var(--sa-blue)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin-only route – redirect non-admin to home
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex justify-center min-h-screen items-center" style={{ background: 'var(--sa-bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--sa-border)] border-t-[var(--sa-blue)]" />
      </div>
    );
  }

  if (!isAdminUser(user?.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Public Route Component
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - StudyAI full UI */}
      <Route path="/" element={<ProtectedRoute><StudyAIPage /></ProtectedRoute>} />
      <Route path="/syllabus" element={<Navigate to="/" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><StudyAIPage /></ProtectedRoute>} />
      <Route path="/learn/:topicId" element={<ProtectedRoute><StudyAIPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><StudyAIPage /></AdminRoute></ProtectedRoute>} />
      <Route path="/generate" element={<Navigate to="/" replace />} />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
