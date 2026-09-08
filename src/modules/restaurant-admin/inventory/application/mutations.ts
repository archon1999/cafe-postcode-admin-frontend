import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inventoryRepository } from '../data-access';
import type { DocumentInput, RecipeInput, ReferenceInput, ReferenceKind } from '../domain';

import { inventoryKeys } from './keys';

export function useInventoryCommands() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: inventoryKeys.all });
  const saveReference = useMutation({
    mutationFn: ({ kind, payload, id }: { kind: ReferenceKind; payload: ReferenceInput; id?: string }) =>
      inventoryRepository.saveReference(kind, payload, id),
    onSuccess: invalidate,
  });
  const saveRecipe = useMutation({
    mutationFn: (payload: RecipeInput) => inventoryRepository.saveRecipe(payload),
    onSuccess: invalidate,
  });
  const deactivateRecipe = useMutation({
    mutationFn: (id: string) => inventoryRepository.deactivateRecipe(id),
    onSuccess: invalidate,
  });
  const saveDocument = useMutation({
    mutationFn: ({ payload, id }: { payload: DocumentInput; id?: string }) =>
      inventoryRepository.saveDocument(payload, id),
    onSuccess: invalidate,
  });
  const postDocument = useMutation({
    mutationFn: (id: string) => inventoryRepository.postDocument(id),
    onSuccess: invalidate,
  });
  const reverseDocument = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => inventoryRepository.reverseDocument(id, reason),
    onSuccess: invalidate,
  });
  const analyze = useMutation({ mutationFn: (warehouse?: string) => inventoryRepository.analyze(warehouse) });
  const uploadAttachment = useMutation({ mutationFn: (file: File) => inventoryRepository.uploadAttachment(file) });
  const downloadAttachment = useMutation({ mutationFn: (id: string) => inventoryRepository.downloadAttachment(id) });
  return {
    saveReference,
    saveRecipe,
    deactivateRecipe,
    saveDocument,
    postDocument,
    reverseDocument,
    analyze,
    uploadAttachment,
    downloadAttachment,
  };
}
