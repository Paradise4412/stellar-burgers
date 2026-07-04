import reducer, {
  addItem,
  clearOrder,
  closeOrderModal,
  createOrder,
  moveItem,
  removeItem,
  setBun
} from '../constructorSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

const bun: TIngredient = {
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

const main: TConstructorIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  id: 'main-id-1'
};

const mainSecond: TConstructorIngredient = {
  ...main,
  _id: '643d69a5c3f7b9001cfa093f',
  name: 'Мясо бессмертных моллюсков Protostomia',
  id: 'main-id-2'
};

const initialState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null
};

describe('constructorSlice reducer', () => {
  test('неизвестный экшен с undefined', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('setBun', () => {
    const state = reducer(initialState, setBun(bun));
    expect(state.bun).toEqual({ ...bun, id: bun._id });
    expect(state.ingredients).toEqual([]);
  });

  test('addItem', () => {
    const state = reducer(initialState, addItem(main));
    expect(state.ingredients).toEqual([main]);
  });

  test('removeItem', () => {
    const state = reducer(
      { ...initialState, ingredients: [main, mainSecond] },
      removeItem('main-id-1')
    );
    expect(state.ingredients).toEqual([mainSecond]);
  });

  test('moveItem up', () => {
    const state = reducer(
      { ...initialState, ingredients: [main, mainSecond] },
      moveItem({ index: 1, direction: 'up' })
    );
    expect(state.ingredients).toEqual([mainSecond, main]);
  });

  test('moveItem down', () => {
    const state = reducer(
      { ...initialState, ingredients: [main, mainSecond] },
      moveItem({ index: 0, direction: 'down' })
    );
    expect(state.ingredients).toEqual([mainSecond, main]);
  });

  test('clearOrder', () => {
    const state = reducer(
      {
        ...initialState,
        bun: { ...bun, id: bun._id },
        ingredients: [main]
      },
      clearOrder()
    );
    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('closeOrderModal', () => {
    const state = reducer(
      {
        ...initialState,
        orderRequest: true,
        orderModalData: { number: 12345 }
      },
      closeOrderModal()
    );
    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toBeNull();
  });

  test('createOrder.pending', () => {
    const state = reducer(initialState, { type: createOrder.pending.type });
    expect(state.orderRequest).toBe(true);
  });

  test('createOrder.fulfilled', () => {
    const state = reducer(
      {
        ...initialState,
        bun: { ...bun, id: bun._id },
        ingredients: [main],
        orderRequest: true
      },
      {
        type: createOrder.fulfilled.type,
        payload: { number: 12345 }
      }
    );
    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual({ number: 12345 });
    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('createOrder.rejected', () => {
    const state = reducer(
      { ...initialState, orderRequest: true },
      { type: createOrder.rejected.type }
    );
    expect(state.orderRequest).toBe(false);
  });
});
