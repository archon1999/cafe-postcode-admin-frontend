import { createKeyFactory } from 'shared/api';

const platformBaseKeys = createKeyFactory('platform');
const businessPartnersKeys = createKeyFactory('platform', 'businessPartners');
const tariffsKeys = createKeyFactory('platform', 'tariffs');
const restaurantActivationOptionsKeys = createKeyFactory('platform', 'restaurantActivationOptions');

export const platformKeys = {
  all: platformBaseKeys.all,
  businessPartners: () => businessPartnersKeys.all,
  businessPartnersList: businessPartnersKeys.list,
  businessPartnerDetail: businessPartnersKeys.detail,
  tariffs: () => tariffsKeys.all,
  tariffsList: tariffsKeys.list,
  tariffDetail: tariffsKeys.detail,
  restaurantActivationOptions: () => restaurantActivationOptionsKeys.all,
} as const;
