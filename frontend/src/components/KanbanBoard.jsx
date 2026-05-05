import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateQuestionStatus } from '../store/slices/boardSlice';
import { GripVertical, Clock, CheckCircle, Brain, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const COLUMNS = [
  { id: 'To Learn', title: 'To Learn', icon: Clock, color: 'bg-slate-100', dot: 'bg-slate-400' },
  { id: 'Practicing', title: 'Practicing', icon: Brain, color: 'bg-blue-50', dot: 'bg-blue-400' },
  { id: 'Mastered', title: 'Mastered', icon: CheckCircle, color: 'bg-emerald-50', dot: 'bg-emerald-400' },
  { id: 'Revision', title: 'Revision', icon: RefreshCw, color: 'bg-purple-50', dot: 'bg-purple-400' },
];

const getDifficultyColor = (diff) => {
  switch (diff?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function KanbanBoard() {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.board);
  const [boardData, setBoardData] = useState({});

  useEffect(() => {
    const newBoard = {
      'To Learn': [],
      'Practicing': [],
      'Mastered': [],
      'Revision': [],
    };
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
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = [...boardData[source.droppableId]];
    const destCol = [...boardData[destination.droppableId]];
    const [movedItem] = sourceCol.splice(source.index, 1);

    destCol.splice(destination.index, 0, movedItem);

    setBoardData({
      ...boardData,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    });

    dispatch(updateQuestionStatus({ id: movedItem._id, status: destination.droppableId }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-6 h-full pb-8">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">
                  {boardData[col.id]?.length || 0}
                </span>
              </div>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-xl p-3 min-h-[500px] transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-indigo-50/50 border-2 border-indigo-200 border-dashed' : col.color
                  }`}
                >
                  <div className="space-y-3">
                    {boardData[col.id]?.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white p-4 rounded-xl border ${
                              snapshot.isDragging ? 'shadow-xl border-indigo-300 ring-2 ring-indigo-100' : 'shadow-sm border-gray-200'
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
                            
                            {item.nextReviewDate && col.id === 'Revision' && (
                              <div className="mt-3 text-xs flex items-center text-orange-600 font-medium bg-orange-50 w-fit px-2 py-1 rounded">
                                <Clock className="h-3 w-3 mr-1" />
                                Due
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
        ))}
      </div>
    </DragDropContext>
  );
}
