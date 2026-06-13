import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';

type TState = {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
};

const initialState: TState = {
  items: [],
  loading: false,
  error: null
};

export const getIngredients = createAsyncThunk(
  'ingredients/get',
  getIngredientsApi
);

const slice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка';
      });
  }
});

export default slice.reducer;
