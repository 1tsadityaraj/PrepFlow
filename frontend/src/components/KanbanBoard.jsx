import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateQuestionStatus, fetchQuestions } from '../store/slices/boardSlice';
import { GripVertical, Clock, CheckCircle, Brain, RefreshCw, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const COLUMNS = [
  { id: 'To Learn', title: 'To Learn', icon: Clock, color: 'bg-slate-100', dot: 'bg-slate-400', border: 'border-slate-200' },
  { id: 'Practicing', title: 'Practicing', icon: Brain, color: 'bg-blue-50', dot: 'bg-blue-400', border: 'border-blue-200' },
  { id: 'Mastered', title: 'Mastered', icon: CheckCircle, color: 'bg-emerald-50', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  { id: 'Revision', title: 'Revision', icon: RefreshCw, color: 'bg-purple-50', dot: 'bg-purple-400', border: 'border-purple-200' },
];

const getDifficultyColor = (diff) => {
  switch (diff?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

function AddCardForm({ columnId, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;
    onAdd({ title, topic, difficulty, status: columnId });
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-md space-y-3"
    >
      <input
        autoFocus
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Question title..."
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Topic (e.g. Arrays)"
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex gap-2">
        {['Easy', 'Medium', 'Hard'].map(d => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
              difficulty === d ? getDifficultyColor(d) + ' ring-2 ring-offset-1 ring-indigo-300' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 text-sm px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          Add Card
        </button>
        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.form>
  );
}

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.board);
  const token = useSelector(state => state.auth.token);
  const [boardData, setBoardData] = useState({});
  const [addingTo, setAddingTo] = useState(null);

  useEffect(() => {
    const newBoard = { 'To Learn': [], 'Practicing': [], 'Mastered': [], 'Revision': [] };
    items.forEach(item => {
      if (newBoard[item.status]) {
        newBoard[item.status].push(item);
      } else {
        newBoard['To Learn'].push(item);
      }
    });
    setBoardData(newBoard);
  }, [items]);

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = [...boardData[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...boardData[destination.droppableId]];
    const [movedItem] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, movedItem);

    setBoardData({
      ...boardData,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId && { [destination.droppableId]: destCol }),
    });

    if (source.droppableId !== destination.droppableId) {
      dispatch(updateQuestionStatus({ id: movedItem._id, status: destination.droppableId }));
    }
  };

  const handleAddCard = async (cardData) => {
    try {
      await axios.post('http://localhost:8000/questions', cardData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(fetchQuestions());
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-5 h-full pb-8 overflow-x-auto">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.id} className="flex flex-col w-80 shrink-0">
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-semibold text-gray-700">{col.title}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">
                    {boardData[col.id]?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => setAddingTo(addingTo === col.id ? null : col.id)}
                  className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-3 min-h-[500px] transition-all duration-200 ${
                      snapshot.isDraggingOver
                        ? 'bg-indigo-50/60 border-2 border-indigo-300 border-dashed'
                        : `${col.color} border border-transparent`
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Add card form */}
                      <AnimatePresence>
                        {addingTo === col.id && (
                          <AddCardForm
                            columnId={col.id}
                            onClose={() => setAddingTo(null)}
                            onAdd={handleAddCard}
                          />
                        )}
                      </AnimatePresence>

                      {boardData[col.id]?.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white p-4 rounded-xl border transition-shadow ${
                                snapshot.isDragging
                                  ? 'shadow-xl border-indigo-300 ring-2 ring-indigo-100 rotate-2'
                                  : 'shadow-sm border-gray-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getDifficultyColor(item.difficulty)}`}>
                                  {item.difficulty}
                                </span>
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1">
                                  <GripVertical className="h-4 w-4" />
                                </div>
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1 leading-tight">{item.title}</h4>
                              <p className="text-xs text-gray-500 font-medium">{item.topic}</p>

                              {item.nextReviewDate && col.id === 'Revision' && new Date(item.nextReviewDate) <= new Date() && (
                                <div className="mt-3 text-xs flex items-center text-red-600 font-medium bg-red-50 w-fit px-2 py-1 rounded-md animate-pulse">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Due Now
                                </div>
                              )}

                              {item.repetitions > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                                  <span>Rep: {item.repetitions}</span>
                                  <span>·</span>
                                  <span>EF: {item.easeFactor?.toFixed(1)}</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
