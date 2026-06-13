import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

type TState = {
  order: TOrder | null;
  loading: boolean;
};

const initialState: TState = {
  order: null,
  loading: false
};

export const getOrder = createAsyncThunk(
  'order/get',
  async (number: number, { rejectWithValue }) => {
    try {
      const data = await getOrderByNumberApi(number);
      if (data.success) return data.orders[0];
      return rejectWithValue(data);
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const slice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrder.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { clearOrder } = slice.actions;

export default slice.reducer;
