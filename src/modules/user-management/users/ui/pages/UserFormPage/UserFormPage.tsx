import { useParams } from 'shared/hooks/router';

import type { UserManagementSurface } from '../../../domain';

import { UserFormPageContent } from './UserFormPageContent';

type UserFormPageProps = {
  surface?: UserManagementSurface;
};

const UserFormPage = ({ surface = 'user' }: UserFormPageProps) => {
  const { id } = useParams<{ id: string }>();

  return <UserFormPageContent id={id} surface={surface} />;
};

export default UserFormPage;
