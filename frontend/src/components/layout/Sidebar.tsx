import { Link, useLocation } from 'react-router-dom';
import { useAppContext, useAuthContext } from '@/contexts';
import { Menu, X, Home, BookOpen, Sparkles, LogOut, Settings } from 'lucide-react';

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const { isAuthenticated, logout, user } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/syllabus', label: 'Syllabus', icon: BookOpen },
    { path: '/generate', label: 'Generate Content', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-500">StudyAI</h1>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Learning</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-700 pt-6 space-y-4">
          {/* User Info */}
          {isAuthenticated && user && (
            <div className="px-4 py-3 bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}

          {/* Settings */}
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>

          {/* Logout */}
          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-red-900 hover:text-red-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
