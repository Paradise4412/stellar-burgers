import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TConstructorIngredient, TIngredient } from '@utils-types';

type TState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: { number: number } | null;
};

const initialState: TState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null
};

export const createOrder = createAsyncThunk(
  'constructor/createOrder',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { burgerConstructor: TState };
    const { bun, ingredients } = state.burgerConstructor;
    const ids = [bun?._id, ...ingredients.map((i) => i._id), bun?._id].filter(
      Boolean
    ) as string[];

    try {
      const data = await orderBurgerApi(ids);
      return data.order;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

const slice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: (state, action: PayloadAction<TIngredient>) => {
      state.bun = { ...action.payload, id: action.payload._id };
    },
    addItem: (state, action: PayloadAction<TConstructorIngredient>) => {
      state.ingredients.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (i) => i.id !== action.payload
      );
    },
    moveItem: (
      state,
      action: PayloadAction<{ index: number; direction: 'up' | 'down' }>
    ) => {
      const { index, direction } = action.payload;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= state.ingredients.length) return;
      const temp = state.ingredients[index];
      state.ingredients[index] = state.ingredients[newIndex];
      state.ingredients[newIndex] = temp;
    },
    clearOrder: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
    closeOrderModal: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = { number: action.payload.number };
        state.bun = null;
        state.ingredients = [];
      })
      .addCase(createOrder.rejected, (state) => {
        state.orderRequest = false;
      });
  }
});

export const {
  setBun,
  addItem,
  removeItem,
  moveItem,
  clearOrder,
  closeOrderModal
} = slice.actions;

export default slice.reducer;
