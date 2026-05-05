import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../store/slices/questionSlice';
import { BarChart3, Target, Flame, TrendingUp, BookOpen } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  'To Learn': '#94a3b8',
  'Practicing': '#3b82f6',
  'Mastered': '#10b981',
  'Revision': '#a855f7',
};

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Analytics() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.questions);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuestions());
    }
  }, [dispatch, status]);

  // Status breakdown
  const statusData = Object.entries(
    items.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || '#94a3b8' }));

  // Topic breakdown
  const topicData = Object.entries(
    items.reduce((acc, q) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // Difficulty breakdown
  const diffData = items.reduce(
    (acc, q) => {
      const key = q.difficulty?.toLowerCase();
      if (key === 'easy') acc.easy++;
      else if (key === 'medium') acc.medium++;
      else if (key === 'hard') acc.hard++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  // Mastered by topic (for weak topics)
  const topicProgress = Object.entries(
    items.reduce((acc, q) => {
      if (!acc[q.topic]) acc[q.topic] = { total: 0, mastered: 0 };
      acc[q.topic].total++;
      if (q.status === 'Mastered') acc[q.topic].mastered++;
      return acc;
    }, {})
  )
    .map(([name, d]) => ({ name, progress: Math.round((d.mastered / d.total) * 100), ...d }))
    .sort((a, b) => a.progress - b.progress);

  const totalMastered = items.filter(q => q.status === 'Mastered').length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your interview preparation progress</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Questions', value: items.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Mastered', value: totalMastered, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In Progress', value: items.filter(q => q.status === 'Practicing').length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Topics', value: [...new Set(items.map(q => q.topic))].length, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Topic distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Questions by Topic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData} barRadius={[6, 6, 0, 0]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak topics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Topic Progress</h3>
        <p className="text-sm text-gray-500 mb-5">Topics sorted by mastery — weakest first</p>
        <div className="space-y-4">
          {topicProgress.map((tp, i) => (
            <div key={tp.name} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-40 shrink-0 truncate">{tp.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tp.progress}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`h-2.5 rounded-full ${tp.progress < 30 ? 'bg-red-400' : tp.progress < 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                />
              </div>
              <span className="text-sm text-gray-500 w-20 text-right">{tp.mastered}/{tp.total} ({tp.progress}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5">Difficulty Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Easy', count: diffData.easy, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
            { label: 'Medium', count: diffData.medium, color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
            { label: 'Hard', count: diffData.hard, color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
          ].map(d => (
            <div key={d.label} className={`rounded-xl ${d.bg} p-5 text-center`}>
              <p className={`text-3xl font-bold ${d.text}`}>{d.count}</p>
              <p className={`text-sm font-medium ${d.text} mt-1`}>{d.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
