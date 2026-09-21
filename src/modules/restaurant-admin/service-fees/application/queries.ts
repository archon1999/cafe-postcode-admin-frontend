import { useQuery } from '@tanstack/react-query';

import { useAdminRestaurantScopeId } from 'modules/auth';

import { serviceFeesRepository } from '../data-access';

import { feeKeys } from './keys';

export function useServiceFees() {
  const scope = useAdminRestaurantScopeId();
  const catalog = useQuery({
    queryKey: feeKeys.catalog(scope),
    queryFn: serviceFeesRepository.catalog,
    enabled: !!scope,
  });
  const policies = useQuery({
    queryKey: feeKeys.policies(scope),
    queryFn: serviceFeesRepository.policies,
    enabled: !!scope,
  });
  const assignments = useQuery({
    queryKey: feeKeys.assignments(scope),
    queryFn: serviceFeesRepository.assignments,
    enabled: !!scope,
  });
  return { scope, catalog, policies, assignments };
}
