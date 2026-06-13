import { RootState } from '../slices';

export const selectIngredients = (state: RootState) => state.ingredients.items;
export const selectIngredientsLoading = (state: RootState) =>
  state.ingredients.loading;
export const selectIngredientsError = (state: RootState) =>
  state.ingredients.error;

export const selectConstructor = (state: RootState) => state.burgerConstructor;
export const selectConstructorItems = (state: RootState) => ({
  bun: state.burgerConstructor.bun,
  ingredients: state.burgerConstructor.ingredients
});
export const selectOrderRequest = (state: RootState) =>
  state.burgerConstructor.orderRequest;
export const selectOrderModalData = (state: RootState) =>
  state.burgerConstructor.orderModalData;

export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedData = (state: RootState) => ({
  total: state.feed.total,
  totalToday: state.feed.totalToday
});
export const selectFeedLoading = (state: RootState) => state.feed.loading;

export const selectProfileOrders = (state: RootState) => state.orders.orders;
export const selectProfileOrdersLoading = (state: RootState) =>
  state.orders.loading;

export const selectOrderData = (state: RootState) => state.order.order;
export const selectOrderLoading = (state: RootState) => state.order.loading;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuth = (state: RootState) => state.user.isAuth;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectUserError = (state: RootState) => state.user.error;
