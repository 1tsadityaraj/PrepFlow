import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDueReviews, submitReview } from '../store/slices/reviewSlice';
import { BrainCircuit, Clock, RotateCcw, ThumbsUp, Zap, Inbox, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDifficultyColor = (diff) => {
  switch (diff?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export default function Reviews() {
  const dispatch = useDispatch();
  const { dueItems, status, reviewedCount } = useSelector(state => state.reviews);

  useEffect(() => {
    dispatch(fetchDueReviews());
  }, [dispatch]);

  const handleReview = (id, quality) => {
    dispatch(submitReview({ id, quality }));
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">Spaced repetition — review questions due today</p>
        </div>
        <div className="flex items-center gap-4">
          {reviewedCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{reviewedCount} reviewed this session</span>
            </motion.div>
          )}
          <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-gray-200">
            <BrainCircuit className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-gray-700">{dueItems.length} remaining</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-6 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">How it works:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <strong>Again</strong> → Review tomorrow
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <strong>Good</strong> → Interval × 2
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <strong>Easy</strong> → Interval × 3
        </span>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {dueItems.map((item, i) => {
            const overdue = isOverdue(item.nextReviewDate);
            return (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-xl border p-6 transition-shadow duration-200 hover:shadow-md ${
                  overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {overdue && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{item.topic}</p>

                    <div className="flex items-center gap-6 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Last: {formatDate(item.lastReviewed)}
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Interval: {item.interval || 1}d
                      </span>
                      <span>Rep: {item.repetitions || 0}</span>
                      <span>EF: {(item.easeFactor || 2.5).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Review buttons */}
                  <div className="flex items-center gap-2 ml-6">
                    <button
                      onClick={() => handleReview(item._id, 2)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Again
                    </button>
                    <button
                      onClick={() => handleReview(item._id, 4)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Good
                    </button>
                    <button
                      onClick={() => handleReview(item._id, 5)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <Zap className="h-4 w-4" />
                      Easy
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {dueItems.length === 0 && status === 'succeeded' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-10 w-10 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">All caught up! 🎉</p>
          <p className="text-sm text-gray-500 mt-2">
            {reviewedCount > 0
              ? `Great session! You reviewed ${reviewedCount} question${reviewedCount > 1 ? 's' : ''}.`
              : 'No reviews due right now. Keep practicing!'}
          </p>
        </motion.div>
      )}
    </>
  );
}
