import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/questions';

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
});

export const addQuestion = createAsyncThunk('questions/add', async (questionData, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.post(API_URL, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default questionSlice.reducer;
