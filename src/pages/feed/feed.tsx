import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getFeeds, setFeed } from '../../services/slices/feedSlice';
import { selectFeedLoading, selectFeedOrders } from '@selectors';
import { getWsUrl } from '../../utils/ws';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const loading = useSelector(selectFeedLoading);

  useEffect(() => {
    dispatch(getFeeds());
    const ws = new WebSocket(getWsUrl());
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.success) {
        dispatch(setFeed(data));
      }
    };
    return () => ws.close();
  }, [dispatch]);

  if (loading) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={() => dispatch(getFeeds())} />;
};
