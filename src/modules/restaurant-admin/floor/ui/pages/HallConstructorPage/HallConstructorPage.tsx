import { useParams } from 'shared/hooks/router';

import { HallConstructorPageContent } from './HallConstructorPageContent';

const HallConstructorPage = () => {
  const { id } = useParams<{ id: string }>();

  return <HallConstructorPageContent id={id} />;
};

export default HallConstructorPage;
