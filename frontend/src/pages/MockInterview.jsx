import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuestions } from '../store/slices/questionSlice';
import { Timer, Play, SkipForward, CheckCircle, XCircle, Trophy, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getDifficultyColor = (diff) => {
  switch (diff?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function MockInterview() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.questions);

  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchQuestions());
  }, [dispatch, status]);

  const startInterview = () => {
    let pool = [...items];
    if (config.difficulty !== 'All') {
      pool = pool.filter(q => q.difficulty === config.difficulty);
    }
    // Shuffle and pick
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, config.count);
    if (shuffled.length === 0) return;

    setQuestions(shuffled);
    setCurrent(0);
    setResults([]);
    setTimeLeft(config.time);
    setPhase('active');
    setUserAnswer('');
  };

  // Timer
  useEffect(() => {
    if (phase !== 'active' || isEvaluating) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          markQuestion('timeout');
          return config.time;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, current, isEvaluating]);

  const markQuestion = useCallback(async (result, answer = '', evaluation = null) => {
    const newResults = [...results, { question: questions[current], result, answer, evaluation }];
    setResults(newResults);

    if (current + 1 >= questions.length) {
      clearInterval(timerRef.current);
      setPhase('result');
      setResults(newResults);
    } else {
      setCurrent(prev => prev + 1);
      setTimeLeft(config.time);
      setUserAnswer('');
    }
  }, [current, questions, results, config.time]);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      alert("Please enter an answer to evaluate.");
      return;
    }
    
    setIsEvaluating(true);
    try {
      const response = await axios.post('http://localhost:8000/ai/evaluate', {
        question_title: questions[current].title,
        question_topic: questions[current].topic,
        user_answer: userAnswer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const evaluation = response.data;
      const result = evaluation.score >= 70 ? 'solved' : 'failed';
      markQuestion(result, userAnswer, evaluation);
    } catch (error) {
      console.error("Evaluation failed", error);
      alert("Failed to evaluate answer. Please try again or mark manually.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const getTimerColor = () => {
    const pct = timeLeft / config.time;
    if (pct > 0.5) return 'text-emerald-600';
    if (pct > 0.2) return 'text-amber-600';
    return 'text-red-600 animate-pulse';
  };

  const solvedCount = results.filter(r => r.result === 'solved').length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
        <p className="text-gray-500 mt-1">Timed practice — simulate a real coding interview with AI Evaluation</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── SETUP PHASE ── */}
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-7 w-7 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Configure Your Session</h2>
              <p className="text-sm text-gray-500 text-center mb-8">Random questions, timed, with AI evaluation.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <div className="flex gap-2">
                    {[3, 5, 8, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => setConfig({ ...config, count: n })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          config.count === n
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Per Question</label>
                  <div className="flex gap-2">
                    {[{ label: '3 min', value: 180 }, { label: '5 min', value: 300 }, { label: '10 min', value: 600 }, { label: '15 min', value: 900 }].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setConfig({ ...config, time: t.value })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          config.time === t.value
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                      <button
                        key={d}
                        onClick={() => setConfig({ ...config, difficulty: d })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          config.difficulty === d
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startInterview}
                  disabled={items.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-5 w-5" />
                  Start Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE PHASE ── */}
        {phase === 'active' && questions[current] && (
          <motion.div
            key={`active-${current}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col h-[calc(100vh-200px)]"
          >
            {/* Progress bar */}
            <div className="mb-6 shrink-0">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Question {current + 1} of {questions.length}</span>
                <span className={`font-mono text-2xl font-bold ${getTimerColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((current) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
              {/* Question Side */}
              <div className="w-1/2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${getDifficultyColor(questions[current].difficulty)}`}>
                    {questions[current].difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{questions[current].topic}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{questions[current].title}</h2>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{questions[current].description}</p>
              </div>
              
              {/* Answer Side */}
              <div className="w-1/2 flex flex-col gap-4">
                <textarea
                  className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                  placeholder="Type your approach, pseudo-code, or code here..."
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={isEvaluating}
                />
                
                {/* Action buttons */}
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating || !userAnswer.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isEvaluating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        AI Evaluate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => markQuestion('solved')}
                    disabled={isEvaluating}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-all border border-emerald-200 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Manual Pass
                  </button>
                  <button
                    onClick={() => markQuestion('failed')}
                    disabled={isEvaluating}
                    className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all border border-red-200 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Fail
                  </button>
                  <button
                    onClick={() => markQuestion('skipped')}
                    disabled={isEvaluating}
                    className="flex items-center justify-center w-12 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 disabled:opacity-50"
                    title="Skip Question"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center mb-8">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className={`h-8 w-8 ${solvedCount >= questions.length / 2 ? 'text-amber-500' : 'text-gray-400'}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Interview Complete!</h2>
              <p className="text-gray-500">
                You solved <span className="font-bold text-emerald-600">{solvedCount}</span> out of{' '}
                <span className="font-bold">{questions.length}</span> questions
              </p>
              <div className="mt-4 text-5xl font-bold text-indigo-600">
                {Math.round((solvedCount / questions.length) * 100)}%
              </div>
            </div>

            {/* Results list */}
            <div className="space-y-4 mb-8">
              {results.map((r, i) => (
                <div key={i} className={`bg-white rounded-xl border p-5 ${
                  r.result === 'solved' ? 'border-emerald-200' : r.result === 'failed' ? 'border-red-200' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {r.result === 'solved' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : r.result === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <SkipForward className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900">{r.question.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md border ${getDifficultyColor(r.question.difficulty)}`}>
                        {r.question.difficulty}
                      </span>
                    </div>
                    {r.evaluation && (
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        AI Score: {r.evaluation.score}/100
                      </span>
                    )}
                  </div>
                  
                  {r.evaluation && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <h4 className="font-semibold text-emerald-800 mb-2">Strengths</h4>
                        <ul className="list-disc pl-4 text-emerald-700 space-y-1">
                          {r.evaluation.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <h4 className="font-semibold text-amber-800 mb-2">To Improve</h4>
                        <ul className="list-disc pl-4 text-amber-700 space-y-1">
                          {r.evaluation.improvement_suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setPhase('setup'); setResults([]); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
