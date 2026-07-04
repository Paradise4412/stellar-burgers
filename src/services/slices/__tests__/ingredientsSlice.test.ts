import reducer, { getIngredients, initialState } from '../ingredientsSlice';
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

describe('редьюсер ingredientsSlice', () => {
  test('должен вернуть начальное состояние при неизвестном экшене', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('должен установить loading в true при getIngredients.pending', () => {
    const state = reducer(initialState, { type: getIngredients.pending.type });
    expect(state).toEqual({
      items: [],
      loading: true,
      error: null
    });
  });

  test('должен сохранить ингредиенты при getIngredients.fulfilled', () => {
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

  test('должен сохранить ошибку при getIngredients.rejected', () => {
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
