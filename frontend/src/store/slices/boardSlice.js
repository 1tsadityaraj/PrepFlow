import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/questions';

export const fetchQuestions = createAsyncThunk('board/fetchQuestions', async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
});

export const updateQuestionStatus = createAsyncThunk(
  'board/updateStatus',
  async ({ id, status }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.put(`${API_URL}/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateQuestionStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default boardSlice.reducer;
