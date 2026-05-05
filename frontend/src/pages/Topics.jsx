import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../store/slices/questionSlice';
import { BookOpen, ChevronRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const TOPIC_COLORS = {
  'Arrays': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', bar: 'bg-blue-500' },
  'Linked Lists': { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
  'Trees': { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', bar: 'bg-amber-500' },
  'Graphs': { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', bar: 'bg-purple-500' },
  'Dynamic Programming': { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600', bar: 'bg-rose-500' },
  'Design': { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', bar: 'bg-indigo-500' },
  'Strings': { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', bar: 'bg-teal-500' },
  'Math': { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', bar: 'bg-cyan-500' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600', bar: 'bg-gray-500' };

export default function Topics() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector(state => state.questions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuestions());
    }
  }, [dispatch, status]);

  // Group questions by topic
  const topicMap = items.reduce((acc, q) => {
    if (!acc[q.topic]) {
      acc[q.topic] = { total: 0, mastered: 0, practicing: 0, toLearn: 0 };
    }
    acc[q.topic].total++;
    if (q.status === 'Mastered') acc[q.topic].mastered++;
    if (q.status === 'Practicing') acc[q.topic].practicing++;
    if (q.status === 'To Learn') acc[q.topic].toLearn++;
    return acc;
  }, {});

  const topics = Object.entries(topicMap).map(([name, data]) => ({
    name,
    ...data,
    progress: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-500 mt-1">Track your progress across all interview topics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <TrendingUp className="h-4 w-4" />
          <span>{topics.length} topics · {items.length} questions</span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((topic, i) => {
          const colors = TOPIC_COLORS[topic.name] || DEFAULT_COLOR;
          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/topics/${encodeURIComponent(topic.name)}`)}
              className={`bg-white rounded-xl border ${colors.border} p-5 cursor-pointer hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <BookOpen className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-1">{topic.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{topic.total} questions</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${colors.bar} transition-all duration-500`}
                  style={{ width: `${topic.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{topic.progress}% mastered</span>
                <div className="flex gap-3">
                  <span className="text-emerald-600">{topic.mastered} done</span>
                  <span className="text-blue-600">{topic.practicing} active</span>
                  <span className="text-gray-400">{topic.toLearn} new</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {topics.length === 0 && status === 'succeeded' && (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No topics yet</p>
          <p className="text-sm">Add questions to your board to see topics here.</p>
        </div>
      )}
    </>
  );
}
