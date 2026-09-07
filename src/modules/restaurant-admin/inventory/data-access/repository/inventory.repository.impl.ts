import { instance } from 'shared/api/http/axiosInstance';

import type { InventoryRepository } from '../../domain';
import { mapDocumentInput, mapInventoryFilters, mapRecipeInput } from '../mappers';

const base = '/api/v1/admin/inventory/';
const get = <T>(path: string, params?: Record<string, unknown>): Promise<T> =>
  instance.get<T>(`${base}${path}/`, { params }).then((response) => response.data);
const post = <T>(path: string, payload: unknown): Promise<T> =>
  instance.post<T>(`${base}${path}/`, payload).then((response) => response.data);

export const inventoryRepository: InventoryRepository = {
  warehouses: () => get('warehouses'),
  items: () => get('items'),
  suppliers: () => get('suppliers'),
  saveReference: (kind, payload, id) =>
    id ? instance.patch(`${base}${kind}/${id}/`, payload).then((response) => response.data) : post(kind, payload),
  recipes: () => get('recipes'),
  catalogOptions: () => get('catalog-options'),
  saveRecipe: (payload) => post('recipes', mapRecipeInput(payload)),
  deactivateRecipe: (id) =>
    instance.patch(`${base}recipes/${id}/`, { isActive: false }).then((response) => response.data),
  documents: (filters) => get('documents', mapInventoryFilters(filters)),
  document: (id) => get(`documents/${id}`),
  saveDocument: (payload, id) =>
    id
      ? instance.patch(`${base}documents/${id}/`, mapDocumentInput(payload)).then((response) => response.data)
      : post('documents', mapDocumentInput(payload)),
  postDocument: (id) => post(`documents/${id}/post`, {}),
  reverseDocument: (id, reason) => post(`documents/${id}/reverse`, { reason }),
  balances: (filters) => get('balances', mapInventoryFilters(filters)),
  movements: (filters) => get('movements', mapInventoryFilters(filters)),
  overview: (filters) => get('overview', mapInventoryFilters(filters)),
  variance: (filters) => get('variance', mapInventoryFilters(filters)),
  insights: (filters) => get('insights', mapInventoryFilters(filters)),
  analyze: (warehouse) => post('insights/analyze', warehouse ? { warehouse } : {}),
  uploadAttachment: (file) => {
    const data = new FormData();
    data.append('file', file);
    return post('attachments', data);
  },
  downloadAttachment: (id) =>
    instance.get(`${base}attachments/${id}/download/`, { responseType: 'blob' }).then((response) => response.data),
  exportReport: (report, filters) =>
    instance
      .get(`${base}export/`, { params: { report, ...mapInventoryFilters(filters) }, responseType: 'blob' })
      .then((response) => response.data),
  exportDocument: (id) =>
    instance.get(`${base}documents/${id}/export/`, { responseType: 'blob' }).then((response) => response.data),
};
