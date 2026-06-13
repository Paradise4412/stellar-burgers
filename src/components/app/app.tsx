import { FC, useCallback, useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { ProtectedRoute } from '../protected-route';
import { Preloader } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { getIngredients } from '../../services/slices/ingredientsSlice';
import { checkUser } from '../../services/slices/userSlice';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading
} from '@selectors';

import '../../index.css';
import styles from './app.module.css';

const OrderModal: FC = () => {
  const navigate = useNavigate();
  const { number } = useParams();
  const onClose = useCallback(() => navigate(-1), [navigate]);

  return (
    <Modal onClose={onClose} title={`#${String(number).padStart(6, '0')}`}>
      <OrderInfo />
    </Modal>
  );
};

const IngredientModal: FC = () => {
  const navigate = useNavigate();
  const onClose = useCallback(() => navigate(-1), [navigate]);

  return (
    <Modal onClose={onClose} title='Детали ингредиента'>
      <IngredientDetails />
    </Modal>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const background = location.state?.background;

  const isLoading = useSelector(selectIngredientsLoading);
  const ingredients = useSelector(selectIngredients);
  const error = useSelector(selectIngredientsError);

  useEffect(() => {
    dispatch(getIngredients());
    dispatch(checkUser());
  }, [dispatch]);

  const isHome = location.pathname === '/';

  return (
    <div className={styles.app}>
      <AppHeader />
      <div className={styles.content}>
        {isHome && isLoading ? (
          <Preloader />
        ) : isHome && error ? (
          <div className={`${styles.error} text text_type_main-medium pt-4`}>
            {error}
          </div>
        ) : isHome && !ingredients.length ? (
          <div className={`${styles.title} text text_type_main-medium pt-4`}>
            Нет ингредиентов
          </div>
        ) : (
          <Routes location={background || location}>
            <Route path='/' element={<ConstructorPage />} />
            <Route path='/feed' element={<Feed />} />

            <Route element={<ProtectedRoute onlyUnAuth />}>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route path='/reset-password' element={<ResetPassword />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/profile' element={<Profile />} />
              <Route path='/profile/orders' element={<ProfileOrders />} />
            </Route>

            {!background && (
              <>
                <Route
                  path='/ingredients/:id'
                  element={<IngredientDetails />}
                />
                <Route path='/feed/:number' element={<OrderInfo />} />
                <Route
                  path='/profile/orders/:number'
                  element={
                    <ProtectedRoute>
                      <OrderInfo />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            <Route path='*' element={<NotFound404 />} />
          </Routes>
        )}

        {background && (
          <Routes>
            <Route path='/ingredients/:id' element={<IngredientModal />} />
            <Route path='/feed/:number' element={<OrderModal />} />
            <Route
              path='/profile/orders/:number'
              element={
                <ProtectedRoute>
                  <OrderModal />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default App;
