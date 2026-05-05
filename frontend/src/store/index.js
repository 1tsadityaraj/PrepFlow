import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import questionReducer from './slices/questionSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    questions: questionReducer,
    reviews: reviewReducer,
  },
});

