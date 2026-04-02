import { useParams } from 'shared/hooks/router';

import type { UserManagementSurface } from '../../../domain';

import { UserDetailPageContent } from './UserDetailPageContent';

type UserDetailPageProps = {
  surface?: UserManagementSurface;
};

const UserDetailPage = ({ surface = 'user' }: UserDetailPageProps) => {
  const { id } = useParams<{ id: string }>();

  return <UserDetailPageContent id={id} surface={surface} />;
};

export default UserDetailPage;
