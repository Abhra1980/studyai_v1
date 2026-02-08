import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSyllabus, useMainTopic } from '@/hooks';
import { Card, Badge, Loader, Button } from '@/components/common';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { MainTopic, Unit } from '@/types/syllabus';

export default function SyllabusPage() {
  const navigate = useNavigate();
  const { data: syllabus, isLoading } = useSyllabus();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleTopicClick = (topicId: number, topicTitle: string) => {
    navigate(`/learn/${topicId}`, { state: { topicTitle } });
  };

  if (isLoading) {
    return <Loader message="Loading curriculum..." />;
  }

  return (
    <div className="py-12 px-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Curriculum
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Explore{' '}
          {syllabus?.reduce((acc, topic) => acc + (topic.units?.length || 0), 0) || 0}{' '}
          units across {syllabus?.length || 0} main topics
        </p>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {syllabus?.map((mainTopic) => (
          <MainTopicCard
            key={mainTopic.id}
            mainTopic={mainTopic}
            isExpanded={expandedId === mainTopic.id}
            onToggle={() =>
              setExpandedId(expandedId === mainTopic.id ? null : mainTopic.id)
            }
            onTopicSelect={handleTopicClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {!syllabus || syllabus.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-400">
            No topics available yet
          </p>
        </div>
      )}
    </div>
  );
}

interface MainTopicCardProps {
  mainTopic: MainTopic;
  isExpanded: boolean;
  onToggle: () => void;
  onTopicSelect: (topicId: number, title: string) => void;
}

function MainTopicCard({
  mainTopic,
  isExpanded,
  onToggle,
  onTopicSelect,
}: MainTopicCardProps) {
  const { data: topicDetail } = useMainTopic(isExpanded ? mainTopic.id : -1);

  return (
    <Card className="overflow-hidden">
      {/* Main Topic Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hover:no-underline"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center">
            <BookOpen className="text-primary-500" size={24} />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {mainTopic.name}
            </h2>
            <div className="flex gap-3 mt-2">
              <Badge variant="info">
                {mainTopic.sub_topic_count} Topics
              </Badge>
              <Badge variant="secondary">
                {Array.isArray(mainTopic.units) ? mainTopic.units.length : mainTopic.units} Units
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="text-primary-500" size={24} />
          ) : (
            <ChevronDown className="text-slate-400" size={24} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && topicDetail && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-6 space-y-4">
            {topicDetail.units && topicDetail.units.length > 0 ? (
              topicDetail.units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onTopicSelect={onTopicSelect}
                />
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                No units available
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

interface UnitCardProps {
  unit: Unit;
  onTopicSelect: (topicId: number, title: string) => void;
}

function UnitCard({ unit, onTopicSelect }: UnitCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white dark:hover:bg-slate-600 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {unit.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unit.topics_count} topics
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {/* Topics in Unit */}
      {expanded && (
        <div className="bg-white dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-600 p-4 space-y-2">
          {/* Note: In a real implementation, you would fetch topics for this unit */}
          <div className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
            Load topics for {unit.name}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onTopicSelect(unit.id, unit.name)}
          >
            Explore Topics
          </Button>
        </div>
      )}
    </div>
  );
}
