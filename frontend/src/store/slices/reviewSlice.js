import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const fetchDueReviews = createAsyncThunk('reviews/fetchDue', async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get(`${API_URL}/reviews/due`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
});

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, performance }, { getState }) => {
    // performance can be 'again', 'good', 'easy'
    // Calculate new dates based on performance
    const now = new Date();
    let nextReviewDate = new Date();
    let status = 'Revision';
    
    if (performance === 'again') {
      nextReviewDate.setDate(now.getDate() + 1);
      status = 'Practicing';
    } else if (performance === 'good') {
      nextReviewDate.setDate(now.getDate() + 3);
    } else if (performance === 'easy') {
      nextReviewDate.setDate(now.getDate() + 7);
      status = 'Mastered';
    }

    const token = getState().auth.token;
    const response = await axios.put(`${API_URL}/questions/${id}`, {
      status,
      lastReviewed: now.toISOString(),
      nextReviewDate: nextReviewDate.toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    dueItems: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDueReviews.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDueReviews.fulfilled, (state, action) => {
        state.dueItems = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchDueReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.dueItems = state.dueItems.filter(item => item._id !== action.payload._id);
      });
  },
});

export default reviewSlice.reducer;
