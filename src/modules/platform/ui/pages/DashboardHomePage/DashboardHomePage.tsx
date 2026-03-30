import { Navigate } from 'react-router';

import { getDefaultAdminPath } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

const DashboardHomePage = () => {
  const { profile } = useCurrentUser();

  if (!profile) {
    return <LoadingScreen />;
  }

  const nextPath = getDefaultAdminPath(profile);

  if (!nextPath) {
    return <LoadingScreen />;
  }

  return <Navigate replace to={nextPath} />;
};

export default DashboardHomePage;
