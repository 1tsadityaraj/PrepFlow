import { useEffect, useState, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../store/slices/questionSlice';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const getDifficultyColor = (diff) => {
  switch (diff?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'To Learn': return 'bg-slate-100 text-slate-700';
    case 'Practicing': return 'bg-blue-100 text-blue-700';
    case 'Mastered': return 'bg-emerald-100 text-emerald-700';
    case 'Revision': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// Memoized Question Card for Performance
const QuestionCard = memo(({ q, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900">{q.title}</h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getDifficultyColor(q.difficulty)}`}>
            {q.difficulty}
          </span>
        </div>
        {q.description && (
          <p className="text-sm text-gray-500 line-clamp-1">{q.description}</p>
        )}
      </div>
      <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusColor(q.status)}`}>
        {q.status}
      </span>
    </div>
  </motion.div>
));

export default function TopicDetail() {
  const { id } = useParams();
  const topicName = decodeURIComponent(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status } = useSelector(state => state.questions);
  
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchQuestions());
    }
  }, [dispatch, status]);

  // Memoize filtering logic
  const { filtered, counts } = useMemo(() => {
    const topicQuestions = items.filter(q => q.topic === topicName);
    
    let result = topicQuestions;
    if (filter !== 'All') {
      result = result.filter(q => q.difficulty === filter);
    }
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(lower) || (q.description && q.description.toLowerCase().includes(lower)));
    }
    
    const countsObj = {
      All: topicQuestions.length,
      Easy: topicQuestions.filter(q => q.difficulty === 'Easy').length,
      Medium: topicQuestions.filter(q => q.difficulty === 'Medium').length,
      Hard: topicQuestions.filter(q => q.difficulty === 'Hard').length,
    };
    
    return { filtered: result, counts: countsObj };
  }, [items, topicName, filter, debouncedSearch]);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/topics')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Topics
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{topicName}</h1>
            <p className="text-gray-500 mt-1">{counts.All} questions in this topic</p>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-4 w-4 text-gray-400" />
        {['All', 'Easy', 'Medium', 'Hard'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === level
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {level} ({counts[level]})
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {status === 'loading' && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question list */}
      {status === 'succeeded' && (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <QuestionCard key={q._id} q={q} index={i} />
          ))}
        </div>
      )}

      {status === 'succeeded' && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No questions found</p>
          <p className="text-sm mt-1">Try changing the difficulty filter or search term.</p>
        </div>
      )}
    </>
  );
}
