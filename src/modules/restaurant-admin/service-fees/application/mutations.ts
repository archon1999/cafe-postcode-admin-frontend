import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAdminRestaurantScopeId } from 'modules/auth';
import { organizationsKeys } from 'modules/business-partner/restaurants/application';
import { floorKeys } from 'modules/restaurant-admin/floor/application';

import { serviceFeesRepository } from '../data-access';
import type { FeeContext, FormulaDefinition } from '../domain';

import { feeKeys } from './keys';

export function useFeeMutations() {
  const scope = useAdminRestaurantScopeId();
  const cache = useQueryClient();
  const refresh = () => cache.invalidateQueries({ queryKey: feeKeys.all(scope) });
  const save = useMutation({ mutationFn: serviceFeesRepository.save, onSuccess: refresh });
  const assign = useMutation({
    mutationFn: serviceFeesRepository.assign,
    onSuccess: () =>
      Promise.all([
        refresh(),
        cache.invalidateQueries({ queryKey: organizationsKeys.all }),
        cache.invalidateQueries({ queryKey: floorKeys.all }),
      ]),
  });
  const preview = useMutation({
    mutationFn: ({ definition, context }: { definition: FormulaDefinition; context: FeeContext }) =>
      serviceFeesRepository.preview(definition, context),
  });
  const draft = useMutation({
    mutationFn: ({ text, timezone }: { text: string; timezone: string }) => serviceFeesRepository.draft(text, timezone),
  });
  return { save, assign, preview, draft };
}
