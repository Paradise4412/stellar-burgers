import { combineReducers } from '@reduxjs/toolkit';

import ingredientsReducer from './ingredientsSlice';
import constructorReducer from './constructorSlice';
import feedReducer from './feedSlice';
import ordersReducer from './ordersSlice';
import orderReducer from './orderSlice';
import userReducer from './userSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  orders: ordersReducer,
  order: orderReducer,
  user: userReducer
});

export type RootState = ReturnType<typeof rootReducer>;
