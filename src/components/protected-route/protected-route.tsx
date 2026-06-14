import { FC, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';
import { selectIsAuth, selectIsAuthChecked } from '@selectors';
import { Preloader } from '@ui';

type TProps = {
  onlyUnAuth?: boolean;
  children?: ReactNode;
};

export const ProtectedRoute: FC<TProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const isAuth = useSelector(selectIsAuth);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth && isAuth) {
    const from = (location.state as { from?: { pathname: string } })?.from
      ?.pathname;
    return <Navigate to={from || '/'} replace />;
  }

  if (!onlyUnAuth && !isAuth) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
