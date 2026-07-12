import { useMutation, useQueryClient } from '@tanstack/react-query';

import { printingRepository } from '../data-access';
import type { CreatePrintTemplateVersionPayload } from '../domain';

import { printingKeys } from './keys';

export function useCreatePrintTemplateVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: CreatePrintTemplateVersionPayload }) =>
      printingRepository.createVersion(templateId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: printingKeys.templates() });
    },
  });
}

export function usePublishPrintTemplateVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, versionId }: { templateId: string; versionId: string }) =>
      printingRepository.publishVersion(templateId, versionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: printingKeys.templates() });
    },
  });
}
