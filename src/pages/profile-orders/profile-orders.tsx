import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getOrders, setOrders } from '../../services/slices/ordersSlice';
import { selectProfileOrders } from '@selectors';
import { getCookie } from '../../utils/cookie';
import { getWsUrl } from '../../utils/ws';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectProfileOrders);

  useEffect(() => {
    dispatch(getOrders());
    const ws = new WebSocket(getWsUrl(getCookie('accessToken')));
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.success) {
        dispatch(setOrders(data.orders));
      }
    };
    return () => ws.close();
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
