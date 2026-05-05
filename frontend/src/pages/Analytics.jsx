import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../store/slices/questionSlice';
import { BarChart3, Target, Flame, TrendingUp, BookOpen, AlertTriangle, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';

const STATUS_COLORS = {
  'To Learn': '#94a3b8',
  'Practicing': '#3b82f6',
  'Mastered': '#10b981',
  'Revision': '#a855f7',
};

export default function Analytics() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const { items, status } = useSelector(state => state.questions);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchQuestions());
  }, [dispatch, status]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalyticsData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Status breakdown for pie
  const statusData = Object.entries(
    items.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name] || '#94a3b8' }));

  // Topic data for bar chart
  const topicData = Object.entries(analyticsData?.topicWise || {}).map(([name, count]) => ({ name, count }));

  // Difficulty stats
  const diffData = items.reduce((acc, q) => {
    const k = q.difficulty?.toLowerCase();
    if (k === 'easy') acc.easy++;
    else if (k === 'medium') acc.medium++;
    else if (k === 'hard') acc.hard++;
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });

  const totalMastered = items.filter(q => q.status === 'Mastered').length;
  const streak = analyticsData?.streak || 0;
  const dailyReviews = analyticsData?.dailyReviews || [];
  const weakTopics = analyticsData?.weakTopics || [];

  // Heatmap data (last 28 days, 4 rows × 7 cols)
  const heatmapDays = dailyReviews.slice(-28);

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 1) return 'bg-emerald-200';
    if (count <= 3) return 'bg-emerald-400';
    if (count <= 5) return 'bg-emerald-500';
    return 'bg-emerald-700';
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your interview preparation progress</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: items.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Mastered', value: totalMastered, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In Progress', value: items.filter(q => q.status === 'Practicing').length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Due Reviews', value: analyticsData?.dueReviews || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Day Streak', value: streak, icon: Flame, color: streak > 0 ? 'text-orange-600' : 'text-gray-400', bg: streak > 0 ? 'bg-orange-50' : 'bg-gray-50' },
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

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Review Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 28 days</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Less</span>
            {['bg-gray-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-700'].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapDays.map((day, i) => (
            <div key={i} className="group relative">
              <div className={`w-full aspect-square rounded-sm ${getHeatColor(day.count)} transition-all group-hover:ring-2 group-hover:ring-indigo-300`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                  {day.date}: {day.count} review{day.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily activity chart + Status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Reviews (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyReviews}>
              <defs>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorReviews)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                {statusData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Questions by Topic</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topicData} barRadius={[6, 6, 0, 0]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weak Topics + Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Weak Topics</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5">Topics sorted by mastery — weakest first</p>
          <div className="space-y-4">
            {weakTopics.map((tp, i) => (
              <div key={tp.topic} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-36 shrink-0 truncate">{tp.topic}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tp.percent}%` }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    className={`h-2.5 rounded-full ${tp.percent < 30 ? 'bg-red-400' : tp.percent < 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right font-medium">{tp.mastered}/{tp.total} ({tp.percent}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Difficulty Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Easy', count: diffData.easy, bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
              { label: 'Medium', count: diffData.medium, bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-200' },
              { label: 'Hard', count: diffData.hard, bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
            ].map(d => (
              <motion.div
                key={d.label}
                whileHover={{ scale: 1.03 }}
                className={`rounded-xl ${d.bg} p-5 text-center ring-1 ${d.ring}`}
              >
                <p className={`text-3xl font-bold ${d.text}`}>{d.count}</p>
                <p className={`text-sm font-medium ${d.text} mt-1`}>{d.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
