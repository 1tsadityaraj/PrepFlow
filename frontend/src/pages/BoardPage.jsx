import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchQuestions } from '../store/slices/boardSlice';
import KanbanBoard from '../components/KanbanBoard';

export default function BoardPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchQuestions());
  }, [dispatch]);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Board</h1>
      <KanbanBoard />
    </>
  );
}
