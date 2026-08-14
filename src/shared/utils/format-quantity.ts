import i18next from 'i18next';

export type SaleUnit = 'piece' | 'kg';

type QuantityValue = number | string | null | undefined;

function normalizeQuantity(value: QuantityValue) {
  const quantity = Number(value ?? 0);

  return Number.isFinite(quantity) ? quantity : 0;
}

export function formatQuantityNumber(value: QuantityValue, saleUnit: SaleUnit = 'piece') {
  const quantityNumberLocale = 'ru-RU';

  return new Intl.NumberFormat(quantityNumberLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: saleUnit === 'kg' ? 3 : 0,
  }).format(normalizeQuantity(value));
}

export function formatSaleQuantity(value: QuantityValue, saleUnit: SaleUnit = 'piece') {
  const unitKey = saleUnit === 'kg' ? 'common:quantityUnits.kilogram' : 'common:quantityUnits.piece';

  return `${formatQuantityNumber(value, saleUnit)} ${i18next.t(unitKey)}`;
}
