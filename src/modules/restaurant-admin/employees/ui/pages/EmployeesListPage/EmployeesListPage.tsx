import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { EmployeesGrid } from './EmployeesGrid';

const EmployeesListPage = () => {
  const { t } = useTranslate('users');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.employeeList.title')} />
      <ListPageBody>
        <EmployeesGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default EmployeesListPage;
