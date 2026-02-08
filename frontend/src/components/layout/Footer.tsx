import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="px-6 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>Made with</span>
          <Heart size={16} className="text-red-500 fill-red-500" />
          <span>by StudyAI</span>
        </div>
        <p>&copy; {currentYear} StudyAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
