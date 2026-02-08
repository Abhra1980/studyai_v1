import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext, useAuthContext } from '@/contexts';
import { useSearch } from '@/hooks';
import { Search, Moon, Sun, User } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useAppContext();
  const { isAuthenticated, user } = useAuthContext();
  const { searchQuery, setSearchQuery, debouncedQuery, results } = useSearch();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchSelect = (topicId: number) => {
    navigate(`/learn/${topicId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search topics, lessons..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && debouncedQuery && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.topic_id}
                    onClick={() => handleSearchSelect(result.topic_id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0 transition-colors"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {result.topic_title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {result.main_topic_name} → {result.unit_name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="text-slate-600 dark:text-yellow-400" size={20} />
            ) : (
              <Moon className="text-slate-400" size={20} />
            )}
          </button>

          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">
              <User size={18} />
              <span className="text-sm font-medium">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
