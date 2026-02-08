import { useParams, useNavigate } from 'react-router-dom';
import { useGenerateLesson } from '@/hooks';
import { Card, Button, Loader } from '@/components/common';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const topicId = id ? parseInt(id) : 0;

  const { mutate, isPending, error, streamedContent } = useGenerateLesson(topicId);

  // Auto-generate lesson when component mounts
  useEffect(() => {
    if (topicId) {
      mutate({ user_level: 'intermediate' });
    }
  }, [topicId, mutate]);

  if (!topicId) {
    return (
      <div className="py-12 px-6">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Invalid Topic
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No topic ID provided
          </p>
          <Button onClick={() => navigate('/syllabus')}>
            Back to Curriculum
          </Button>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return <Loader message="Generating lesson..." fullScreen />;
  }

  if (error) {
    return (
      <div className="py-12 px-6">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Failed to load lesson: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => mutate({ user_level: 'intermediate' })}>
              <RefreshCw size={20} />
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => navigate('/syllabus')}>
              Back to Curriculum
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/syllabus')}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Lesson: Topic #{topicId}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-Generated Interactive Learning Content
          </p>
        </div>
      </div>

      {/* Lesson Content Card */}
      <Card className="p-8">
        {streamedContent ? (
          <div className="text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
            {streamedContent}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No lesson content generated yet
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => mutate({ user_level: 'intermediate' })}
              disabled={isPending}
            >
              <RefreshCw size={20} />
              Generate Lesson
            </Button>
          </div>
        )}
      </Card>

      {/* Footer Actions */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/syllabus')}
        >
          Back to Curriculum
        </Button>
        <Button
          size="lg"
          onClick={() => mutate({ user_level: 'intermediate' })}
          disabled={isPending}
        >
          <RefreshCw size={20} />
          Regenerate Lesson
        </Button>
      </div>
    </div>
  );
}
