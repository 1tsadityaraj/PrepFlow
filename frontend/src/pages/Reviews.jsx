import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDueReviews, updateReview } from '../store/slices/reviewSlice';
import { BrainCircuit, Clock, RotateCcw, ThumbsUp, Zap, Inbox } from 'lucide-react';
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Reviews() {
  const dispatch = useDispatch();
  const { dueItems, status } = useSelector(state => state.reviews);

  useEffect(() => {
    dispatch(fetchDueReviews());
  }, [dispatch]);

  const handleReview = (id, performance) => {
    dispatch(updateReview({ id, performance }));
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-500 mt-1">Spaced repetition — review questions due today</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-lg border border-gray-200">
          <BrainCircuit className="h-4 w-4 text-indigo-500" />
          <span className="font-medium text-gray-700">{dueItems.length} due</span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {dueItems.map((item, i) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                      Next: {formatDate(item.nextReviewDate)}
                    </span>
                  </div>
                </div>

                {/* Review buttons */}
                <div className="flex items-center gap-2 ml-6">
                  <button
                    onClick={() => handleReview(item._id, 'again')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Again
                  </button>
                  <button
                    onClick={() => handleReview(item._id, 'good')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Good
                  </button>
                  <button
                    onClick={() => handleReview(item._id, 'easy')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <Zap className="h-4 w-4" />
                    Easy
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {dueItems.length === 0 && status === 'succeeded' && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">No reviews due right now. Keep practicing!</p>
        </div>
      )}
    </>
  );
}
