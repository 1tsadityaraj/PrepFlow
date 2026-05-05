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

export const submitReview = createAsyncThunk(
  'reviews/submit',
  async ({ id, quality }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post(`${API_URL}/reviews/${id}/review`, { quality }, {
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
    reviewedCount: 0,
  },
  reducers: {
    resetReviewedCount: (state) => { state.reviewedCount = 0; },
  },
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
      .addCase(submitReview.fulfilled, (state, action) => {
        state.dueItems = state.dueItems.filter(item => item._id !== action.payload._id);
        state.reviewedCount += 1;
      });
  },
});

export const { resetReviewedCount } = reviewSlice.actions;
export default reviewSlice.reducer;
