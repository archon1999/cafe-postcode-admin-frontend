import { createKeyFactory } from 'shared/api';

const platformBaseKeys = createKeyFactory('platform');
const businessPartnersKeys = createKeyFactory('platform', 'businessPartners');
const tariffsKeys = createKeyFactory('platform', 'tariffs');

export const platformKeys = {
  all: platformBaseKeys.all,
  businessPartners: () => businessPartnersKeys.all,
  businessPartnersList: businessPartnersKeys.list,
  businessPartnerDetail: businessPartnersKeys.detail,
  tariffs: () => tariffsKeys.all,
  tariffsList: tariffsKeys.list,
  tariffDetail: tariffsKeys.detail,
} as const;
