import { useCallback, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        const response = await fetch(
          `${apiUrl}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          }
        );

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const message = typeof errBody?.detail === 'string'
            ? errBody.detail
            : errBody?.detail?.[0]?.msg || 'Login failed';
          throw new Error(message);
        }

        const data = await response.json();
        const newToken = data.access_token;
        const userData: User = {
          id: data.user_id,
          email: data.email,
          name: data.name || email.split('@')[0],
        };

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
      } catch (err) {
        let message = 'Login failed';
        if (err instanceof Error) {
          message = err.message;
          if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
            message = 'Cannot connect to server. Make sure the backend is running.';
          }
        }
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        const response = await fetch(
          `${apiUrl}/auth/register`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          }
        );

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const message = typeof errBody?.detail === 'string'
            ? errBody.detail
            : errBody?.detail?.[0]?.msg || 'Registration failed';
          throw new Error(message);
        }

        const data = await response.json();
        const newToken = data.access_token;
        const userData: User = {
          id: data.user_id,
          email: data.email,
          name: data.name || name,
        };

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
      } catch (err) {
        let message = 'Registration failed';
        if (err instanceof Error) {
          message = err.message;
          if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
            message = 'Cannot connect to server. Make sure the backend is running.';
          }
        }
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const refreshToken = useCallback(async () => {
    if (!token) throw new Error('No token available');

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const response = await fetch(
        `${apiUrl}/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ refresh_token: token }),
        }
      );

      if (!response.ok) {
        logout();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.access_token;

      setToken(newToken);
      localStorage.setItem('token', newToken);

      return newToken;
    } catch (err) {
      logout();
      throw err;
    }
  }, [token]);

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  };
}
