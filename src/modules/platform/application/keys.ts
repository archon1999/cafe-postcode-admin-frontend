export const platformKeys = {
  all: ['platform'] as const,
  businessPartners: () => [...platformKeys.all, 'businessPartners'] as const,
  businessPartnersList: (params: Record<string, unknown>) =>
    [...platformKeys.businessPartners(), 'list', params] as const,
  businessPartnerDetail: (id: string) => [...platformKeys.businessPartners(), 'detail', id] as const,
  tariffs: () => [...platformKeys.all, 'tariffs'] as const,
  tariffsList: (params: Record<string, unknown>) => [...platformKeys.tariffs(), 'list', params] as const,
  tariffDetail: (id: string) => [...platformKeys.tariffs(), 'detail', id] as const,
} as const;
