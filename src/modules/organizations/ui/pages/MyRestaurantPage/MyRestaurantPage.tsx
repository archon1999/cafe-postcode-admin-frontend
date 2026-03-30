import { Navigate } from 'react-router';

import { RoutePath, getDefaultMyRestaurantPath } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

const MyRestaurantPage = () => {
  const { profile } = useCurrentUser();

  if (!profile) {
    return <LoadingScreen />;
  }

  return <Navigate replace to={getDefaultMyRestaurantPath(profile) ?? RoutePath.main} />;
};

export default MyRestaurantPage;
