import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder, TOrdersData } from '@utils-types';

type TState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
};

const initialState: TState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false
};

export const getFeeds = createAsyncThunk('feed/get', getFeedsApi);

const slice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<TOrdersData>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setFeed } = slice.actions;

export default slice.reducer;
