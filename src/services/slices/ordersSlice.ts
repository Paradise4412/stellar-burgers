import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';

type TState = {
  orders: TOrder[];
  loading: boolean;
};

const initialState: TState = {
  orders: [],
  loading: false
};

export const getOrders = createAsyncThunk('orders/get', getOrdersApi);

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<TOrder[]>) => {
      state.orders = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setOrders } = slice.actions;

export default slice.reducer;
