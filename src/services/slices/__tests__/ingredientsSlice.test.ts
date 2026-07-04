import reducer, { getIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const ingredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
};

const initialState = {
  items: [],
  loading: false,
  error: null
};

describe('ingredientsSlice reducer', () => {
  test('неизвестный экшен с undefined', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('getIngredients.pending', () => {
    const state = reducer(initialState, { type: getIngredients.pending.type });
    expect(state).toEqual({
      items: [],
      loading: true,
      error: null
    });
  });

  test('getIngredients.fulfilled', () => {
    const state = reducer(
      { ...initialState, loading: true },
      { type: getIngredients.fulfilled.type, payload: [ingredient] }
    );
    expect(state).toEqual({
      items: [ingredient],
      loading: false,
      error: null
    });
  });

  test('getIngredients.rejected', () => {
    const state = reducer(
      { ...initialState, loading: true },
      {
        type: getIngredients.rejected.type,
        error: { message: 'Ошибка загрузки' }
      }
    );
    expect(state).toEqual({
      items: [],
      loading: false,
      error: 'Ошибка загрузки'
    });
  });
});
