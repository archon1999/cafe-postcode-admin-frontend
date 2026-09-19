import { instance } from 'shared/api/http/axiosInstance';

import type { CatalogDraft, CatalogDraftRow, DraftInput } from '../../domain';

const root = '/api/v1/admin/catalog-assistant';
export const assistantRepository = {
  create(input: DraftInput) {
    const data = new FormData();
    data.append('text', input.text);
    data.append('restaurant_id', input.restaurantId);
    if (input.categoryId) data.append('category_id', input.categoryId);
    input.files.forEach((file) => data.append('files', file));
    return instance
      .post<CatalogDraft>(`${root}/drafts/`, data, {
        timeout: 90000,
        headers: { 'Content-Type': undefined },
      })
      .then((response) => response.data);
  },
  commit(draft: CatalogDraft, rows: CatalogDraftRow[]) {
    return instance
      .post<CatalogDraft>(`${root}/drafts/${draft.id}/commit/`, {
        revision: draft.revision,
        rows,
      })
      .then((response) => response.data);
  },
  linkBot() {
    return instance.post<{ url: string; expiresAt: string }>(`${root}/bot-link/`).then((response) => response.data);
  },
};
