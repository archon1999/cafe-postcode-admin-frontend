import { useQuery } from '@tanstack/react-query';

import { printingRepository } from '../data-access';

import { printingKeys } from './keys';

export function usePrintTemplatesQuery() {
  return useQuery({
    queryKey: printingKeys.templates(),
    queryFn: () => printingRepository.getTemplates(),
  });
}

export function usePrintPresetCatalogQuery() {
  return useQuery({
    queryKey: printingKeys.presets(),
    queryFn: () => printingRepository.getPresetCatalog(),
    staleTime: 5 * 60 * 1000,
  });
}
