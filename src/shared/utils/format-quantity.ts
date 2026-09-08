import i18next from 'i18next';

import { getSaleUnit } from 'shared/domain/sale-units';
import type { SaleUnit } from 'shared/domain/sale-units';

export type { SaleUnit } from 'shared/domain/sale-units';

type QuantityValue = number | string | null | undefined;

function normalizeQuantity(value: QuantityValue) {
  const quantity = Number(value ?? 0);

  return Number.isFinite(quantity) ? quantity : 0;
}

export function formatQuantityNumber(value: QuantityValue, saleUnit: SaleUnit = 'piece') {
  const quantityNumberLocale = 'ru-RU';

  return new Intl.NumberFormat(quantityNumberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: getSaleUnit(saleUnit).precision,
  }).format(normalizeQuantity(value));
}

export function formatSaleQuantity(value: QuantityValue, saleUnit: SaleUnit = 'piece') {
  const unitKey = getSaleUnit(saleUnit).quantityKey;

  return `${formatQuantityNumber(value, saleUnit)} ${i18next.t(unitKey)}`;
}
