import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSyllabus, useMainTopic, useTopic, useProgress, usePartProgress, useDashboard } from '@/hooks';
import { lessonService } from '@/services/lessonService';
import type { PartProgressItem } from '@/services/syllabusService';
import { progressService } from '@/services/progressService';
import { Loader } from '@/components/common';
import { ChevronRight } from 'lucide-react';
import { useAuthContext } from '@/contexts';
import { isAdminUser } from '@/services/adminService';
import { AdminPage } from '@/components/pages';
import type { MainTopic } from '@/types/syllabus';
import type { Lesson } from '@/types/lesson';

const PART_ICONS: Record<number, string> = {
  1: '📊', 2: '🧠', 3: '🐍', 4: '⚛️', 5: '☁️', 6: '🔧',
  7: '📋', 8: '🎯', 9: '🤖', 10: '💻', 11: '🗄️', 12: '🛠️',
  13: '🚀', 14: '✨',
};
const PART_COLORS: Record<number, string> = {
  1: '#2563EB', 2: '#7C3AED', 3: '#059669', 4: '#0EA5E9', 5: '#D97706',
  6: '#DC2626', 7: '#4F46E5', 8: '#BE185D', 9: '#7C3AED', 10: '#0D9488',
  11: '#B45309', 12: '#6D28D9', 13: '#E11D48', 14: '#2563EB',
};

export default function StudyAIPage() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isLearn = location.pathname.startsWith('/learn/');
  const isAdminPage = location.pathname === '/admin';
  const isAdmin = isAdminUser(user?.email);
  const resolvedTopicId = isLearn && topicId ? parseInt(topicId, 10) : null;

  const { data: mainTopics, isLoading } = useSyllabus();
  const [expandedPart, setExpandedPart] = useState<number | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<number | null>(null);
  const [selectedMainTopicId, setSelectedMainTopicId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(resolvedTopicId);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const { data: mainTopicDetail } = useMainTopic(selectedMainTopicId ?? 0);
  const { data: topicDetail, isLoading: loadingSubTopics } = useTopic(selectedTopicId ?? 0);
  const { completed, total, invalidate: invalidateProgress } = useProgress();
  const { partProgress, invalidate: invalidatePartProgress } = usePartProgress();
  const queryClient = useQueryClient();
  const invalidateAll = () => {
    invalidateProgress();
    invalidatePartProgress();
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  // When navigating to /learn/:id directly, find parent part/unit from topicDetail
  useEffect(() => {
    if (resolvedTopicId && topicDetail && mainTopics?.length && !selectedMainTopicId) {
      const part = mainTopics.find((p) => p.name === topicDetail.main_topic_name);
      if (part) {
        setSelectedMainTopicId(part.id);
        setExpandedPart(part.id);
      }
    }
  }, [resolvedTopicId, topicDetail?.main_topic_name, mainTopics, selectedMainTopicId]);

  useEffect(() => {
    if (mainTopicDetail && topicDetail && !selectedUnitId) {
      const unit = mainTopicDetail.units?.find((u) => u.name === topicDetail.unit_name);
      if (unit) {
        setSelectedUnitId(unit.id);
        setExpandedUnitId(unit.id);
      }
    }
  }, [mainTopicDetail, topicDetail?.unit_name, selectedUnitId]);

  const units = mainTopicDetail?.units ?? [];
  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const topics = selectedUnit?.topics ?? [];
  const subTopics = topicDetail?.sub_topics ?? [];
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const filteredParts = mainTopics?.filter(
    (p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const startLearning = (topicId: number, unitId: number, mainTopicId: number) => {
    setSelectedTopicId(topicId);
    setSelectedUnitId(unitId);
    setSelectedMainTopicId(mainTopicId);
    setSelectedSubTopicId(null);
    navigate(`/learn/${topicId}`);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubTopic = (id: number) => {
    setSelectedSubTopicId(id);
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSyllabus = () => {
    setSelectedTopicId(null);
    navigate('/');
  };

  if (isLoading) return <Loader message="Loading curriculum..." />;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--sa-bg)', fontFamily: 'var(--sa-serif)', color: 'var(--sa-text)' }}
    >
      {/* ═══ SIDEBAR (StudyAI reference) ═══ */}
      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: 360,
          minWidth: 360,
          background: 'var(--sa-white)',
          borderRight: '1px solid var(--sa-border)',
        }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'var(--sa-border)' }}>
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-base font-extrabold flex-shrink-0"
              style={{
                fontFamily: 'var(--sa-sans)',
                background: 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              S
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5, fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }}>StudyAI</div>
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', fontFamily: 'var(--sa-sans)', letterSpacing: 0.5 }}>INTELLIGENT LEARNING</div>
            </div>
          </Link>
        </div>

        <div className="flex px-4 pt-3 gap-1 flex-wrap">
          <Link to="/" className={`flex-1 py-2 rounded-lg border-none text-center text-xs font-semibold no-underline transition-all min-w-0 ${!isDashboard && !isLearn && !isAdminPage ? 'bg-[var(--sa-blue-light)] text-[var(--sa-blue)]' : 'bg-transparent text-[var(--sa-muted)]'}`} style={{ fontFamily: 'var(--sa-sans)' }}>📚 Syllabus</Link>
          <Link to="/dashboard" className={`flex-1 py-2 rounded-lg border-none text-center text-xs font-semibold no-underline transition-all min-w-0 ${isDashboard ? 'bg-[var(--sa-blue-light)] text-[var(--sa-blue)]' : 'bg-transparent text-[var(--sa-muted)]'}`} style={{ fontFamily: 'var(--sa-sans)' }}>📊 Dashboard</Link>
          {isAdmin && (
            <Link to="/admin" className={`flex-1 py-2 rounded-lg border-none text-center text-xs font-semibold no-underline transition-all min-w-0 ${isAdminPage ? 'bg-[var(--sa-blue-light)] text-[var(--sa-blue)]' : 'bg-transparent text-[var(--sa-muted)]'}`} style={{ fontFamily: 'var(--sa-sans)' }}>⚙️ Admin</Link>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: 'var(--sa-surface)', borderColor: 'var(--sa-border)' }}>
            <span className="text-[13px]" style={{ color: 'var(--sa-light)' }}>🔍</span>
            <input placeholder="Search 2,000+ topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-none bg-transparent outline-none flex-1 text-[12.5px] placeholder-[var(--sa-light)]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1 px-2.5">
          {filteredParts.map((part) => {
            const isExpanded = expandedPart === part.id;
            return (
              <div key={part.id} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => { setExpandedPart(isExpanded ? null : part.id); setSelectedMainTopicId(isExpanded ? null : part.id); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none text-left cursor-pointer transition-colors ${isExpanded ? 'bg-[var(--sa-blue-light)]' : 'hover:bg-[var(--sa-surface)]'}`}
                >
                  <span className="text-lg">{PART_ICONS[part.id] ?? '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold break-words leading-tight" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }}>{part.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-light)' }}>{(part as { unit_count?: number }).unit_count ?? 0} modules</div>
                  </div>
                  <ChevronRight size={10} className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--sa-light)' }} />
                </button>
                {isExpanded && (
                  <SyllabusTree
                    part={part}
                    mainTopicDetail={mainTopicDetail}
                    selectedUnitId={selectedUnitId}
                    selectedTopicId={selectedTopicId}
                    onSelectTopic={startLearning}
                    expandedUnitId={expandedUnitId}
                    onExpandUnit={(id) => setExpandedUnitId((prev) => (prev === id ? null : id))}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3.5 border-t" style={{ borderColor: 'var(--sa-border)', background: 'var(--sa-bg)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ fontFamily: 'var(--sa-sans)', background: 'linear-gradient(135deg, var(--sa-orange), #EF4444)' }}>
              {(user?.name || 'U')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ fontFamily: 'var(--sa-sans)' }}>{user?.name ?? 'User'}</div>
              <div className="text-[10px]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-light)' }}>Pro Plan • 7🔥 streak</div>
            </div>
          </div>
          <button type="button" onClick={() => logout()} className="block mt-2 text-[10px] border-none bg-transparent cursor-pointer p-0 text-left hover:opacity-80" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>Logout</button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[54px] flex items-center justify-between px-7 flex-shrink-0" style={{ background: 'var(--sa-white)', borderBottom: '1px solid var(--sa-border)' }}>
          <div className="flex items-center gap-3.5">
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--sa-sans)' }}>
              {isAdminPage ? 'Admin' : isLearn ? 'Generate Content' : isDashboard ? 'Learning Dashboard' : 'Curriculum Overview'}
            </span>
            {isLearn && mainTopicDetail && selectedUnit && selectedTopic && (
              <div className="flex items-center gap-1.5 text-[11px]" style={{ fontFamily: 'var(--sa-sans)' }}>
                <button type="button" onClick={goToSyllabus} className="border-none bg-transparent cursor-pointer p-0 hover:opacity-80" style={{ color: 'var(--sa-light)' }}>{mainTopicDetail.name}</button>
                <span style={{ color: 'var(--sa-faint)' }}>/</span>
                <span style={{ color: 'var(--sa-light)' }}>{selectedUnit.name}</span>
                <span style={{ color: 'var(--sa-faint)' }}>/</span>
                <span style={{ color: 'var(--sa-text)', fontWeight: 600 }}>{selectedTopic.title}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isLearn && (
              <select value={userLevel} onChange={(e) => setUserLevel(e.target.value as typeof userLevel)} className="px-3 py-1.5 rounded-lg border outline-none text-[11px] cursor-pointer" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text-3)', borderColor: 'var(--sa-border)', background: 'var(--sa-bg)' }}>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">📘 Intermediate</option>
                <option value="advanced">🔬 Advanced</option>
              </select>
            )}
            <div className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: 'var(--sa-blue-light)', color: 'var(--sa-blue)', fontFamily: 'var(--sa-sans)' }}>{completed}/{total} completed</div>
          </div>
        </header>

        <div ref={contentScrollRef} className="flex-1 overflow-y-auto" style={{ background: 'var(--sa-bg)' }}>
          {isAdminPage && isAdmin && <AdminPage />}
          {isAdminPage && !isAdmin && null}
          {isDashboard && !isAdminPage && <DashboardView />}
          {!isDashboard && !isLearn && !isAdminPage && <SyllabusGridView mainTopics={mainTopics ?? []} partProgress={partProgress} onExpandPart={(id) => { setExpandedPart(id); setSelectedMainTopicId(id); }} />}
          {isLearn && selectedTopicId && (
            <LearnView
              topicId={selectedTopicId}
              mainTopic={mainTopicDetail ?? { id: 0, name: topicDetail?.main_topic_name ?? 'Loading...' }}
              unit={selectedUnit ?? { id: 0, name: topicDetail?.unit_name ?? 'Loading...' }}
              topic={selectedTopic ?? (topicDetail ? { id: topicDetail.id, title: topicDetail.title, number: topicDetail.number } : { id: 0, title: 'Loading...', number: '' })}
              subTopics={subTopics}
              selectedSubTopicId={selectedSubTopicId}
              onSelectSubTopic={handleSelectSubTopic}
              loadingSubTopics={loadingSubTopics}
              userLevel={userLevel}
              onTopicCompleted={invalidateAll}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Syllabus Tree ─────────────────────────────────────────────────
interface SyllabusTreeProps {
  part: { id: number; name: string };
  mainTopicDetail: MainTopic | null | undefined;
  selectedUnitId: number | null;
  selectedTopicId: number | null;
  onSelectTopic: (topicId: number, unitId: number, mainTopicId: number) => void;
  expandedUnitId: number | null;
  onExpandUnit: (id: number) => void;
}

function SyllabusTree({ part, mainTopicDetail, selectedUnitId, selectedTopicId, onSelectTopic, expandedUnitId, onExpandUnit }: SyllabusTreeProps) {
  const units = mainTopicDetail?.units ?? [];
  const partColor = PART_COLORS[part.id] ?? '#2563EB';
  if (!mainTopicDetail || mainTopicDetail.id !== part.id) {
    return <div className="pl-5 py-2 text-xs" style={{ color: 'var(--sa-muted)', fontFamily: 'var(--sa-sans)' }}>Loading...</div>;
  }
  return (
    <div className="pl-5 pt-1">
      {units.map((unit) => {
        const isUnitExpanded = expandedUnitId === unit.id;
        const unitTopics = unit.topics ?? [];
        return (
          <div key={unit.id} className="mb-0.5">
            <button type="button" onClick={() => onExpandUnit(unit.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors ${selectedUnitId === unit.id && !selectedTopicId ? 'bg-[var(--sa-blue-light)]' : 'hover:bg-[var(--sa-surface)]'}`} style={{ borderLeftColor: selectedUnitId === unit.id && !selectedTopicId ? partColor : 'transparent' }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium break-words leading-tight" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }}>{unit.name}</div>
                <div className="text-[10px]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-pale)' }}>{unitTopics.length} topics</div>
              </div>
              <ChevronRight size={10} className={`flex-shrink-0 transition-transform ${isUnitExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--sa-light)' }} />
            </button>
            {isUnitExpanded && unitTopics.map((t) => (
              <button key={t.id} type="button" onClick={() => onSelectTopic(t.id, unit.id, part.id)} className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors ml-0 ${selectedTopicId === t.id ? 'bg-[rgba(37,99,235,0.06)]' : 'hover:bg-[var(--sa-surface)]'}`} style={{ borderLeftColor: selectedTopicId === t.id ? 'var(--sa-blue)' : 'transparent', fontFamily: 'var(--sa-sans)' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ background: selectedTopicId === t.id ? 'var(--sa-blue)' : 'var(--sa-border)', color: selectedTopicId === t.id ? '#fff' : 'var(--sa-light)' }}>{t.number}</span>
                <span className="text-xs font-medium leading-snug break-words" style={{ color: 'var(--sa-text)' }}>{t.title}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Syllabus Grid View ────────────────────────────────────────────
function SyllabusGridView({ mainTopics, partProgress, onExpandPart }: { mainTopics: MainTopic[]; partProgress: PartProgressItem[]; onExpandPart: (id: number) => void }) {
  const getProgress = (partId: number) => partProgress.find((p) => p.part_id === partId) ?? { completed: 0, total: 0 };
  return (
    <div className="max-w-[960px] mx-auto py-9 px-7">
      <h2 className="text-[26px] font-extrabold mb-2" style={{ fontFamily: 'var(--sa-sans)', letterSpacing: -0.8 }}>Complete AI & Full-Stack Curriculum</h2>
      <p className="text-sm mb-8" style={{ color: '#6B7280', fontFamily: 'var(--sa-sans)', lineHeight: 1.6 }}>{mainTopics.length} parts • Expand a part in the sidebar to select Unit → Topic → Sub-Topic</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {mainTopics.map((part) => {
          const { completed, total } = getProgress(part.id);
          const totalModules = total || ((part as { topic_count?: number }).topic_count ?? (part as { unit_count?: number }).unit_count ?? 0);
          const pct = totalModules > 0 ? Math.min(100, Math.round((completed / totalModules) * 100)) : 0;
          return (
            <button key={part.id} type="button" onClick={() => onExpandPart(part.id)} className="relative p-5 rounded-[14px] border text-left transition-all hover:-translate-y-0.5 overflow-hidden" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70" style={{ background: PART_COLORS[part.id] ?? '#2563EB' }} />
              <div className="text-[28px] mb-2.5">{PART_ICONS[part.id] ?? '📚'}</div>
              <div className="text-[13px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }}>Part {part.id}: {part.name}</div>
              <div className="text-[11px] mb-3" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>{completed} / {totalModules} modules</div>
              <div className="h-[3px] rounded-sm overflow-hidden" style={{ background: 'var(--sa-surface-2)' }}>
                <div className="h-full rounded-sm opacity-60" style={{ width: `${pct}%`, background: PART_COLORS[part.id] ?? '#2563EB' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────
function DashboardView() {
  const { data: dashboard, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto py-8 px-7 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--sa-border)] border-t-[var(--sa-blue)]" />
      </div>
    );
  }

  const d = dashboard ?? {
    completed: 0,
    total: 0,
    streak: 0,
    personal_best_streak: 0,
    study_hours: 0,
    topics_this_month: 0,
    avg_quiz_score: 0,
    due_for_review: [],
    weekly_activity: [{ day: 'Mon', topics: 0, mins: 0 }, { day: 'Tue', topics: 0, mins: 0 }, { day: 'Wed', topics: 0, mins: 0 }, { day: 'Thu', topics: 0, mins: 0 }, { day: 'Fri', topics: 0, mins: 0 }, { day: 'Sat', topics: 0, mins: 0 }, { day: 'Sun', topics: 0, mins: 0 }],
  };
  const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;

  const statCards = [
    { label: 'Topics Completed', value: String(d.completed), sub: `of ${d.total}`, color: '#2563EB', pct },
    { label: 'Current Streak', value: `${d.streak} days ${d.streak > 0 ? '🔥' : ''}`, sub: `Personal best: ${d.personal_best_streak}`, color: '#F97316' },
    { label: 'Study Hours', value: String(d.study_hours), sub: 'This month', color: '#059669' },
    { label: 'Avg Quiz Score', value: `${d.avg_quiz_score}%`, sub: 'Last 30 days', color: '#7C3AED' },
  ];

  return (
    <div className="max-w-[900px] mx-auto py-8 px-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="p-5 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
            <div className="text-[11px] mb-2" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)', fontWeight: 500 }}>{s.label}</div>
            <div className="text-[28px] font-extrabold" style={{ fontFamily: 'var(--sa-sans)', color: s.color, letterSpacing: -1 }}>{s.value}</div>
            <div className="text-[10px] mt-1" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-pale)' }}>{s.sub}</div>
            {s.pct !== undefined && (
              <div className="mt-2.5 h-1 rounded-sm overflow-hidden" style={{ background: 'var(--sa-surface-2)' }}>
                <div className="h-full rounded-sm transition-[width] duration-1000" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-6 rounded-[14px] border mb-6" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-[15px] font-bold" style={{ fontFamily: 'var(--sa-sans)' }}>📅 Due for Review</div>
          <span className="text-[11px] font-semibold cursor-pointer hover:opacity-80" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-blue)' }}>See all →</span>
        </div>
        {d.due_for_review.length === 0 ? (
          <div className="py-6 text-center text-[13px]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>No topics due for review yet. Complete more topics to see them here.</div>
        ) : (
          d.due_for_review.map((t, i) => (
            <div key={t.topic_id} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: 'var(--sa-surface-2)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i === 0 ? '#EF4444' : i === 1 ? '#F97316' : '#F59E0B' }} />
                <span className="text-[13px]" style={{ fontFamily: 'var(--sa-sans)' }}>{t.title}</span>
              </div>
              <button type="button" onClick={() => navigate(`/learn/${t.topic_id}`)} className="px-3.5 py-1.5 rounded-md border text-[11px] font-medium cursor-pointer hover:bg-[var(--sa-blue-light)] hover:text-[var(--sa-blue)] hover:border-[var(--sa-blue-border)]" style={{ fontFamily: 'var(--sa-sans)', borderColor: 'var(--sa-border)', background: 'var(--sa-bg)', color: 'var(--sa-text-3)' }}>Review</button>
            </div>
          ))
        )}
      </div>
      <div className="p-6 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
        <div className="text-[15px] font-bold mb-5" style={{ fontFamily: 'var(--sa-sans)' }}>📈 This Week</div>
        <div className="flex gap-3 items-end h-[120px]">
          {d.weekly_activity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="text-[9px]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>{day.topics}t</div>
              <div className="w-full rounded-md transition-[height] duration-700" style={{ height: Math.max(4, day.mins * 1.1), background: day.mins === 0 ? 'var(--sa-surface-2)' : 'linear-gradient(180deg, var(--sa-blue), var(--sa-violet))', opacity: day.mins === 0 ? 0.5 : 0.85 }} />
              <div className="text-[10px] font-medium" style={{ fontFamily: 'var(--sa-sans)', color: day.mins === 0 ? 'var(--sa-faint)' : 'var(--sa-text-3)' }}>{day.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Learn View (with streaming sections, quiz, follow-up) ─────────
interface LearnViewProps {
  topicId: number;
  mainTopic: MainTopic;
  unit: { id: number; name: string };
  topic: { id: number; title: string; number: string };
  subTopics: { id: number; content: string }[];
  selectedSubTopicId: number | null;
  onSelectSubTopic: (id: number) => void;
  loadingSubTopics: boolean;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onTopicCompleted?: () => void;
}

interface AdditionalContext {
  explanation: string;
  code_examples: Array<{ language?: string; code?: string; explanation?: string }>;
}

function LearnView({ topicId, mainTopic, unit, topic, subTopics, selectedSubTopicId, onSelectSubTopic, loadingSubTopics, userLevel, onTopicCompleted }: LearnViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [additionalContent, setAdditionalContent] = useState<AdditionalContext[]>([]);
  const [showFollowUpInput, setShowFollowUpInput] = useState(false);
  const canGenerate = !!selectedSubTopicId;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    setLesson(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setAdditionalContent([]);
    setShowFollowUpInput(false);
    try {
      const result = await lessonService.generateLesson(topicId, { user_level: userLevel, sub_topic_id: selectedSubTopicId ?? undefined });
      setLesson(result as unknown as Lesson);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendFollowUp = async () => {
    const q = followUpQuestion.trim();
    if (!q || !lesson || isGeneratingMore) return;
    setIsGeneratingMore(true);
    setError(null);
    const fullContext = [lesson.explanation, ...additionalContent.map((b) => b.explanation)].join('\n\n---\n\n');
    try {
      const result = await lessonService.generateMoreContext(topicId, q, fullContext);
      setAdditionalContent((prev) => [...prev, result]);
      setFollowUpQuestion('');
      setShowFollowUpInput(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate more context');
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const quiz = (lesson as { quiz?: { question: string; options: string[]; correct_index?: number }[] })?.quiz ?? [];

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    const correctCount = Object.entries(quizAnswers).filter(
      ([qi, ai]) => ai === (quiz[parseInt(qi)] as { correct_index?: number }).correct_index
    ).length;
    const percentage = quiz.length > 0 ? Math.round((correctCount / quiz.length) * 100) : undefined;
    try {
      await progressService.markTopicComplete(topicId, percentage);
      onTopicCompleted?.();
    } catch {
      // Ignore - progress update is best-effort
    }
  };

  return (
    <div className="max-w-[780px] mx-auto py-9 px-7 pb-16">
      <div className="mb-8">
        <div className="flex gap-2 mb-2.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold" style={{ fontFamily: 'var(--sa-sans)', background: 'var(--sa-blue-light)', color: 'var(--sa-blue)' }}>{mainTopic.name}</span>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold" style={{ fontFamily: 'var(--sa-sans)', background: 'var(--sa-violet-light)', color: 'var(--sa-violet)' }}>{unit.name}</span>
        </div>
        <h1 className="text-[30px] font-extrabold mb-2" style={{ fontFamily: 'var(--sa-sans)', letterSpacing: -1, color: 'var(--sa-text)' }}>{topic.title}</h1>
        <div className="flex gap-4 text-xs mb-6" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>
          <span>⏱️ ~25 min</span>
          <span>📖 {userLevel}</span>
          <span>{subTopics.length} sub-topics</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] font-medium mb-3" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>Select a sub-topic to generate content:</p>
        <div className="space-y-1">
          {loadingSubTopics ? <div className="text-sm" style={{ color: 'var(--sa-muted)' }}>Loading...</div> : subTopics.map((st) => (
            <button key={st.id} type="button" onClick={() => onSelectSubTopic(st.id)} className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors ${selectedSubTopicId === st.id ? 'bg-[rgba(37,99,235,0.06)]' : 'hover:bg-[var(--sa-surface)]'}`} style={{ borderLeftColor: selectedSubTopicId === st.id ? 'var(--sa-blue)' : 'transparent', fontFamily: 'var(--sa-sans)' }}>
              <span className="text-xs font-medium leading-snug" style={{ color: 'var(--sa-text)' }}>{st.content}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={handleGenerate} disabled={!canGenerate || isGenerating} className="w-full py-3.5 rounded-[10px] font-bold text-sm border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={canGenerate && !isGenerating ? { fontFamily: 'var(--sa-sans)', background: 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))', boxShadow: '0 2px 8px rgba(37,99,235,0.3)', color: '#fff' } : { fontFamily: 'var(--sa-sans)', background: 'var(--sa-border)', color: 'var(--sa-muted)' }}>
        {isGenerating ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI Teacher is generating your lesson...</span> : <span className="flex items-center justify-center gap-2">✨ Generate Content</span>}
      </button>

      {isGenerating && (
        <div className="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-[10px] border" style={{ borderColor: 'var(--sa-blue-border)', background: 'linear-gradient(135deg, var(--sa-blue-light), var(--sa-violet-light))' }}>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--sa-blue)] animate-sa-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
          <span className="text-xs font-medium" style={{ fontFamily: 'var(--sa-sans)', color: '#4B5EAA' }}>Generating content with examples...</span>
        </div>
      )}

      {error && <div className="mt-6 p-5 rounded-[14px] border" style={{ borderColor: 'var(--sa-red-border)', background: 'var(--sa-red-light)', color: '#7F1D1D', fontFamily: 'var(--sa-sans)' }}>{error}</div>}

      {lesson && !isGenerating && (
        <>
          {/* Concept Explanation */}
          <div className="mt-8 p-6 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📖</span>
              <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-blue)' }}>Concept Explanation</span>
            </div>
            <div className="prose prose-slate max-w-none text-[15px] leading-[1.75]" style={{ fontFamily: 'var(--sa-serif)', color: 'var(--sa-text-2)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.explanation}</ReactMarkdown>
            </div>
          </div>

          {/* Code Examples */}
          {lesson.code_examples?.length > 0 && lesson.code_examples.map((ex, i) => (
            <div key={i} className="mt-6 rounded-[14px] border overflow-hidden" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ background: '#F8FAFC', borderBottom: '1px solid var(--sa-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">💻</span>
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-green)' }}>Code Example</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ fontFamily: 'var(--sa-sans)', background: 'var(--sa-green-light)', color: 'var(--sa-green)' }}>{ex.language}</span>
                </div>
                <button type="button" className="px-3 py-1 rounded-md text-[11px] font-semibold border cursor-pointer" style={{ fontFamily: 'var(--sa-sans)', borderColor: 'var(--sa-border)', background: '#fff', color: '#6B7280' }}>📋 Copy</button>
              </div>
              <pre className="m-0 p-5 overflow-x-auto text-[12.5px] leading-relaxed" style={{ fontFamily: 'var(--sa-mono)', background: '#1E293B', color: '#E2E8F0' }}><code>{ex.code}</code></pre>
            </div>
          ))}

          {/* Quiz */}
          {quiz.length > 0 && (
            <div className="mt-8 p-7 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧪</span>
                  <span className="text-[15px] font-bold" style={{ fontFamily: 'var(--sa-sans)' }}>Knowledge Check</span>
                </div>
                <span className="text-[11px]" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>{quiz.length} questions</span>
              </div>
              {quiz.map((q, qi) => (
                <div key={qi} className="mb-6 pb-6 border-b last:border-b-0 last:mb-0 last:pb-0" style={{ borderColor: 'var(--sa-surface-2)' }}>
                  <div className="text-[14px] font-semibold mb-3.5" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--sa-blue)', marginRight: 8 }}>Q{qi + 1}.</span>{q.question}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options ?? []).map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi;
                      const correctIdx = (q as { correct_index?: number }).correct_index ?? 0;
                      const isCorrect = oi === correctIdx;
                      return (
                        <button key={oi} type="button" onClick={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [qi]: oi }))} disabled={quizSubmitted} className={`px-4 py-3 rounded-[10px] text-left text-[13px] transition-all border ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'} ${quizSubmitted ? (isCorrect ? 'border-2 border-[var(--sa-green)] bg-[var(--sa-green-light)]' : selected ? 'border-2 border-[#EF4444] bg-[var(--sa-red-light)]' : 'border border-[var(--sa-border)] bg-[var(--sa-bg)]') : selected ? 'border-2 border-[var(--sa-blue)] bg-[var(--sa-blue-light)]' : 'border border-[var(--sa-border)] bg-[var(--sa-bg)] hover:bg-[var(--sa-blue-light)] hover:border-[var(--sa-blue-border)]'}`} style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text-2)', lineHeight: 1.4 }}>
                          <span className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-md mr-2.5 text-[11px] font-bold ${quizSubmitted ? (isCorrect ? 'bg-[var(--sa-green)] text-white' : selected ? 'bg-[#EF4444] text-white' : 'bg-[var(--sa-border)] text-[var(--sa-muted)]') : selected ? 'bg-[var(--sa-blue)] text-white' : 'bg-[var(--sa-border)] text-[var(--sa-muted)]'}`}>{quizSubmitted ? (isCorrect ? '✓' : selected ? '✕' : String.fromCharCode(65 + oi)) : String.fromCharCode(65 + oi)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <button type="button" onClick={handleQuizSubmit} disabled={Object.keys(quizAnswers).length < quiz.length} className={`w-full py-3.5 rounded-[10px] border-none text-[14px] font-bold mt-6 transition-all ${Object.keys(quizAnswers).length >= quiz.length ? 'cursor-pointer' : 'cursor-default'}`} style={{ fontFamily: 'var(--sa-sans)', background: Object.keys(quizAnswers).length >= quiz.length ? 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))' : 'var(--sa-border)', color: Object.keys(quizAnswers).length >= quiz.length ? '#fff' : 'var(--sa-light)', boxShadow: Object.keys(quizAnswers).length >= quiz.length ? '0 2px 8px rgba(37,99,235,0.3)' : 'none' }}>
                  {Object.keys(quizAnswers).length >= quiz.length ? 'Submit Answers' : `Answer all ${quiz.length} questions`}
                </button>
              ) : (
                <div className="mt-6 py-4 px-5 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, var(--sa-blue-light), var(--sa-violet-light))', border: '1px solid var(--sa-blue-border)' }}>
                  <div className="text-[28px] font-extrabold mb-1" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-blue)' }}>{Object.entries(quizAnswers).filter(([qi, ai]) => ai === (quiz[parseInt(qi)] as { correct_index?: number }).correct_index).length}/{quiz.length}</div>
                  <div className="text-[13px]" style={{ fontFamily: 'var(--sa-sans)', color: '#6B7280' }}>Review the highlighted answers above.</div>
                </div>
              )}
            </div>
          )}

          {/* Additional context blocks (from follow-up questions) */}
          {additionalContent.map((block, idx) => (
            <div key={idx} className="mt-8 p-6 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">✨</span>
                <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-violet)' }}>Additional Context</span>
              </div>
              <div className="prose prose-slate max-w-none text-[15px] leading-[1.75]" style={{ fontFamily: 'var(--sa-serif)', color: 'var(--sa-text-2)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.explanation}</ReactMarkdown>
              </div>
              {block.code_examples?.length > 0 && block.code_examples.map((ex, i) => (
                <div key={i} className="mt-4 rounded-[14px] border overflow-hidden" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)' }}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ background: '#F8FAFC', borderBottom: '1px solid var(--sa-border)' }}>
                    <span className="text-xs font-bold" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-green)' }}>{ex.language || 'Code'}</span>
                  </div>
                  <pre className="m-0 p-5 overflow-x-auto text-[12.5px] leading-relaxed" style={{ fontFamily: 'var(--sa-mono)', background: '#1E293B', color: '#E2E8F0' }}><code>{ex.code || ''}</code></pre>
                </div>
              ))}
            </div>
          ))}

          {/* Do you want more context? */}
          <div className="mt-6 p-5 rounded-[14px] border" style={{ background: 'var(--sa-white)', borderColor: 'var(--sa-border)', boxShadow: 'var(--sa-shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💬</span>
              <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)' }}>Do you want to Generate more context on this?</span>
            </div>
            {!showFollowUpInput ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowFollowUpInput(true)} className="px-4 py-2 rounded-lg border-none cursor-pointer text-xs font-semibold" style={{ fontFamily: 'var(--sa-sans)', background: 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))', color: '#fff', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}>Yes</button>
                <button type="button" onClick={() => setShowFollowUpInput(false)} className="px-4 py-2 rounded-lg border cursor-pointer text-xs font-semibold" style={{ fontFamily: 'var(--sa-sans)', borderColor: 'var(--sa-border)', background: 'var(--sa-bg)', color: 'var(--sa-muted)' }}>No</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    placeholder={`Ask a follow-up question about ${topic.title}...`}
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
                    disabled={isGeneratingMore}
                    className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-[13.5px] outline-none focus:ring-2 focus:ring-[var(--sa-blue)]"
                    style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-text)', borderColor: 'var(--sa-border)' }}
                  />
                  <button type="button" onClick={handleSendFollowUp} disabled={!followUpQuestion.trim() || isGeneratingMore} className="px-4 py-2 rounded-lg border-none cursor-pointer text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: 'var(--sa-sans)', background: 'linear-gradient(135deg, var(--sa-blue), var(--sa-violet))', color: '#fff', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}>{isGeneratingMore ? 'Generating...' : 'Send'}</button>
                </div>
                <button type="button" onClick={() => { setShowFollowUpInput(false); setFollowUpQuestion(''); }} className="text-[11px] self-start" style={{ fontFamily: 'var(--sa-sans)', color: 'var(--sa-muted)' }}>Cancel</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
