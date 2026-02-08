import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSyllabus, useMainTopic, useTopic } from '@/hooks';
import { lessonService } from '@/services/lessonService';
import { Loader } from '@/components/common';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { MainTopic } from '@/types/syllabus';

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

export default function GenerateContentPage() {
  const { data: mainTopics, isLoading } = useSyllabus();
  const [expandedPart, setExpandedPart] = useState<number | null>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<number | null>(null);
  const [selectedMainTopicId, setSelectedMainTopicId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: mainTopicDetail } = useMainTopic(selectedMainTopicId ?? 0);
  const { data: topicDetail, isLoading: loadingSubTopics } = useTopic(selectedTopicId ?? 0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const units = mainTopicDetail?.units ?? [];
  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const topics = selectedUnit?.topics ?? [];
  const subTopics = topicDetail?.sub_topics ?? [];
  const selectedSubTopic = subTopics.find((s) => s.id === selectedSubTopicId);
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  const canGenerate = selectedMainTopicId && selectedUnitId && selectedTopicId && selectedSubTopicId;
  const showLearnView = !!selectedTopicId && !!mainTopicDetail && !!selectedUnit && !!selectedTopic;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedTopic) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);
    try {
      const result = await lessonService.generateLesson(selectedTopic.id, {
        user_level: 'intermediate',
        sub_topic_id: selectedSubTopicId ?? undefined,
      });
      setGeneratedContent(result?.explanation ?? JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const startLearning = (topicId: number, unitId: number) => {
    setSelectedTopicId(topicId);
    setSelectedUnitId(unitId);
    setSelectedSubTopicId(null);
  };

  const filteredParts = mainTopics?.filter(
    (p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  if (isLoading) return <Loader message="Loading curriculum..." />;

  return (
    <div className="flex h-[calc(100vh-140px)] w-screen max-w-none ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] bg-[#FAFBFC] font-['Source_Serif_4',Georgia,serif] text-[#1A1D23] overflow-hidden">
      {/* ═══ SIDEBAR (StudyAI format) ═══ */}
      <aside className="w-[290px] min-w-[290px] bg-white border-r border-[#E8ECF1] flex flex-col overflow-hidden flex-shrink-0 transition-all duration-300">
        <div className="p-5 border-b border-[#E8ECF1]">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-white text-base font-extrabold font-['DM_Sans',sans-serif] shadow-[0_2px_8px_rgba(37,99,235,0.25)]" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>S</div>
            <div>
              <div className="text-base font-bold tracking-tight font-['DM_Sans',sans-serif] text-[#1A1D23]">StudyAI</div>
              <div className="text-[10px] text-[#8B93A1] font-['DM_Sans',sans-serif] tracking-wider">INTELLIGENT LEARNING</div>
            </div>
          </div>
        </div>

        <div className="flex px-4 pt-3 gap-1">
          <button className="flex-1 py-2 rounded-lg border-none text-xs font-semibold font-['DM_Sans',sans-serif] bg-[#F0F4FF] text-[#2563EB] cursor-pointer">📚 Syllabus</button>
          <button className="flex-1 py-2 rounded-lg border-none text-xs font-semibold font-['DM_Sans',sans-serif] bg-transparent text-[#8B93A1] cursor-pointer">📊 Dashboard</button>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F7FA] rounded-lg border border-[#E8ECF1]">
            <span className="text-[13px] text-[#A0A7B5]">🔍</span>
            <input placeholder="Search 2,000+ topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-none bg-transparent outline-none flex-1 text-[12.5px] font-['DM_Sans',sans-serif] text-[#1A1D23] placeholder-[#A0A7B5]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1 px-2.5">
          {filteredParts.map((part) => {
            const isExpanded = expandedPart === part.id;
            return (
              <div key={part.id} className="mb-0.5">
                <button
                  onClick={() => {
                    const next = isExpanded ? null : part.id;
                    setExpandedPart(next);
                    setSelectedMainTopicId(next);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-none text-left cursor-pointer transition-colors ${
                    isExpanded ? 'bg-[#F0F4FF]' : 'bg-transparent hover:bg-[#F5F7FA]'
                  }`}
                >
                  <span className="text-lg">{PART_ICONS[part.id] ?? '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-[#1A1D23] font-['DM_Sans',sans-serif] leading-tight truncate">{part.name}</div>
                    <div className="text-[10px] text-[#A0A7B5] font-['DM_Sans',sans-serif] mt-0.5">{(part as { unit_count?: number }).unit_count ?? 0} modules</div>
                  </div>
                  <ChevronRight size={10} className={`text-[#A0A7B5] transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <SyllabusTree
                    partColor={PART_COLORS[part.id] ?? '#2563EB'}
                    mainTopicDetail={mainTopicDetail && mainTopicDetail.id === part.id ? mainTopicDetail : null}
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

        <div className="p-3.5 border-t border-[#E8ECF1] bg-[#FAFBFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[13px] font-bold font-['DM_Sans',sans-serif]" style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}>P</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold font-['DM_Sans',sans-serif] truncate">Pro User</div>
              <div className="text-[10px] text-[#A0A7B5] font-['DM_Sans',sans-serif]">Pro Plan • 7🔥 streak</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[54px] flex items-center justify-between px-7 bg-white border-b border-[#E8ECF1] flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <span className="text-sm font-semibold font-['DM_Sans',sans-serif]">
              {showLearnView ? 'Generate Content' : 'Curriculum Overview'}
            </span>
            {showLearnView && mainTopicDetail && selectedUnit && selectedTopic && (
              <div className="flex items-center gap-1.5 text-[11px] font-['DM_Sans',sans-serif]">
                <span className="text-[#A0A7B5]">{mainTopicDetail.name}</span>
                <span className="text-[#D0D5DD]">/</span>
                <span className="text-[#A0A7B5]">{selectedUnit.name}</span>
                <span className="text-[#D0D5DD]">/</span>
                <span className="text-[#1A1D23] font-semibold">{selectedTopic.title}</span>
              </div>
            )}
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#F0F4FF] text-[11px] font-semibold text-[#2563EB] font-['DM_Sans',sans-serif]">23/132 completed</div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#FAFBFC]">
          {/* ═══ SYLLABUS GRID (when no topic selected) ═══ */}
          {!showLearnView && (
            <div className="max-w-[960px] mx-auto py-9 px-7">
              <h2 className="text-[26px] font-extrabold font-['DM_Sans',sans-serif] tracking-tight mb-2">Complete AI & Full-Stack Curriculum</h2>
              <p className="text-sm text-[#6B7280] font-['DM_Sans',sans-serif] leading-relaxed mb-8">
                {mainTopics?.length ?? 0} parts • Expand a part in the sidebar to select Unit → Topic → Sub-Topic for content generation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {mainTopics?.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      const next = expandedPart === part.id ? null : part.id;
                      setExpandedPart(next);
                      setSelectedMainTopicId(next);
                    }}
                    className="relative p-5 bg-white rounded-[14px] border border-[#E8ECF1] cursor-pointer text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70" style={{ background: PART_COLORS[part.id] ?? '#2563EB' }} />
                    <div className="text-[28px] mb-2.5">{PART_ICONS[part.id] ?? '📚'}</div>
                    <div className="text-[13px] font-bold font-['DM_Sans',sans-serif] text-[#1A1D23] mb-1 leading-tight">Part {part.id}: {part.name}</div>
                    <div className="text-[11px] text-[#8B93A1] font-['DM_Sans',sans-serif]">{(part as { unit_count?: number }).unit_count ?? 0} modules</div>
                    <div className="mt-3 h-[3px] bg-[#F0F2F5] rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm opacity-60" style={{ width: `${Math.min(100, ((part as { unit_count?: number }).unit_count ?? 0) * 5)}%`, background: PART_COLORS[part.id] ?? '#2563EB' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ LEARN VIEW (when topic selected) ═══ */}
          {showLearnView && (
            <div className="max-w-[780px] mx-auto py-9 px-7 pb-16">
              <div className="mb-8">
                <div className="flex gap-2 mb-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold font-['DM_Sans',sans-serif] bg-[#F0F4FF] text-[#2563EB]">{mainTopicDetail!.name}</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold font-['DM_Sans',sans-serif] bg-[#FAF5FF] text-[#7C3AED]">{selectedUnit!.name}</span>
                </div>
                <h1 className="text-[30px] font-extrabold font-['DM_Sans',sans-serif] tracking-tight text-[#1A1D23] mb-2">{selectedTopic!.title}</h1>
                <div className="flex gap-4 text-xs text-[#8B93A1] font-['DM_Sans',sans-serif] mb-6">
                  <span>⏱️ ~25 min</span>
                  <span>📖 Intermediate</span>
                  <span>{subTopics.length} sub-topics</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-medium text-[#8B93A1] font-['DM_Sans',sans-serif] mb-3">Select a sub-topic to generate content:</p>
                <div className="space-y-1">
                  {loadingSubTopics ? (
                    <div className="text-sm text-[#8B93A1]">Loading...</div>
                  ) : (
                    subTopics.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedSubTopicId(st.id)}
                        className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors font-['DM_Sans',sans-serif] ${
                          selectedSubTopicId === st.id ? 'bg-[rgba(37,99,235,0.06)] border-l-[#2563EB]' : 'bg-transparent border-l-transparent hover:bg-[#F5F7FA]'
                        }`}
                      >
                        <span className="text-xs font-medium text-[#1A1D23] leading-snug">{st.content}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full py-3.5 rounded-[10px] font-['DM_Sans',sans-serif] text-sm font-bold text-white border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={canGenerate && !isGenerating ? { background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' } : { background: '#E8ECF1', color: '#8B93A1' }}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Teacher is generating your lesson...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={18} />
                    Generate Content
                  </span>
                )}
              </button>

              {isGenerating && (
                <div className="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-[10px] border border-[#E0E7FF] bg-gradient-to-br from-[#F0F4FF] to-[#FAF5FF]">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[#4B5EAA] font-['DM_Sans',sans-serif]">Generating content with examples...</span>
                </div>
              )}

              {error && (
                <div className="mt-6 p-5 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D] font-['DM_Sans',sans-serif] text-[13px]">{error}</div>
              )}

              {generatedContent && !isGenerating && (
                <div className="mt-8 p-6 rounded-[14px] bg-white border border-[#E8ECF1] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">📖</span>
                    <span className="text-[13px] font-bold font-['DM_Sans',sans-serif] text-[#2563EB]">Concept Explanation</span>
                  </div>
                  <div className="prose prose-slate max-w-none text-[#374151] font-serif text-[15px] leading-[1.75]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent}</ReactMarkdown>
                  </div>
                  {selectedSubTopic && <p className="mt-4 text-xs text-[#8B93A1] font-['DM_Sans',sans-serif]">Focus: {selectedSubTopic.content}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface SyllabusTreeProps {
  partColor: string;
  mainTopicDetail: MainTopic | null;
  selectedUnitId: number | null;
  selectedTopicId: number | null;
  onSelectTopic: (topicId: number, unitId: number) => void;
  expandedUnitId: number | null;
  onExpandUnit: (id: number) => void;
}

function SyllabusTree({ partColor, mainTopicDetail, selectedUnitId, selectedTopicId, onSelectTopic, expandedUnitId, onExpandUnit }: SyllabusTreeProps) {
  const units = mainTopicDetail?.units ?? [];
  if (!mainTopicDetail) {
    return <div className="pl-5 py-2 text-xs text-[#8B93A1] font-['DM_Sans',sans-serif]">Loading units...</div>;
  }

  return (
    <div className="pl-5 pt-1">
      {units.map((unit) => {
        const isUnitExpanded = expandedUnitId === unit.id;
        const unitTopics = unit.topics ?? [];
        return (
          <div key={unit.id} className="mb-0.5">
            <button
              onClick={() => onExpandUnit(unit.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors font-['DM_Sans',sans-serif] ${
                selectedUnitId === unit.id && !selectedTopicId ? 'bg-[#F0F4FF]' : 'bg-transparent hover:bg-[#F5F7FA]'
              }`}
              style={{ borderLeftColor: selectedUnitId === unit.id && !selectedTopicId ? partColor : 'transparent' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#1A1D23] truncate">{unit.name}</div>
                <div className="text-[10px] text-[#B0B7C3] font-['DM_Sans',sans-serif]">{unitTopics.length} topics</div>
              </div>
              <ChevronRight size={10} className={`text-[#A0A7B5] flex-shrink-0 transition-transform ${isUnitExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isUnitExpanded && unitTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTopic(t.id, unit.id)}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg border-l-[3px] border-none text-left cursor-pointer transition-colors font-['DM_Sans',sans-serif] ml-0 ${
                  selectedTopicId === t.id ? 'bg-[rgba(37,99,235,0.06)]' : 'bg-transparent hover:bg-[#F5F7FA]'
                }`}
                style={{ borderLeftColor: selectedTopicId === t.id ? '#2563EB' : 'transparent' }}
              >
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold bg-[#E8ECF1] text-[#A0A7B5] flex-shrink-0 mt-0.5">{t.number}</span>
                <span className="text-xs font-medium text-[#1A1D23] leading-snug line-clamp-2">{t.title}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
