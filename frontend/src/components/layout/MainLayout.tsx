import { ReactNode } from 'react';
import { useAppContext } from '@/contexts';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { darkMode } = useAppContext();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
