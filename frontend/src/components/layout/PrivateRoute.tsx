import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../ui/Loader';
interface PrivateRouteProps {
  children: ReactElement;
}
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Loader />;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}