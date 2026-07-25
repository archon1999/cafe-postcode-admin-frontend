import { formatDate } from './format-time';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null;

export const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '-';

    if (field === 'inventories') {
      return value
        .map((item) => {
          if (!isRecord(item)) return String(item);

          const type = isRecord(item.type) ? item.type : undefined;
          const provider = isRecord(item.provider_company) ? item.provider_company : undefined;
          const typeLabel = type?.label;
          const providerName = provider?.name;

          if (typeLabel && providerName) return `${String(typeLabel)} (${String(providerName)})`;
          if (typeLabel || providerName) return String(typeLabel ?? providerName);
          return '-';
        })
        .join(', ');
    }

    if (field === 'shareholder_contracts') {
      return value
        .map((contract) => {
          if (isRecord(contract) && contract.net_pay_share !== undefined) {
            return `${String(contract.net_pay_share)}%`;
          }
          return '-';
        })
        .join(', ');
    }

    return value
      .map((item) => {
        if (isRecord(item)) {
          const displayValue = item.label ?? item.name ?? item.unit_number;
          return displayValue === undefined ? JSON.stringify(item) : String(displayValue);
        }
        return String(item);
      })
      .join(', ');
  }

  if (isRecord(value)) {
    if (value.label !== undefined) return String(value.label);
    if (value.name !== undefined) return String(value.name);
    if (value.unit_number !== undefined) return String(value.unit_number);
    if (value.first_name !== undefined && value.last_name !== undefined) {
      return `${String(value.first_name)} ${String(value.last_name)}`;
    }
    return '-';
  }

  if (field.includes('_date') || field === 'birth_date' || field === 'hired_date') {
    if (typeof value !== 'string' && typeof value !== 'number') return String(value);
    return formatDate(value, { invalidResult: String(value) });
  }

  if (
    field.includes('_fee') ||
    field.includes('_amount') ||
    field.includes('_charged') ||
    field === 'fuel_discount_value' ||
    field === 'truck_fee' ||
    field === 'trailer_fee' ||
    field === 'physical_damage' ||
    field === 'administration_fee' ||
    field === 'cargo_liability_fee' ||
    field === 'eld_device_fee' ||
    field === 'ifta_fee' ||
    field === 'occ_acc_fee' ||
    field === 'pre_pass_fee' ||
    field === 'truck_fee_per_mile'
  ) {
    if (typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
  }

  if (
    field.includes('percentage') ||
    field.includes('share') ||
    field === 'gross_share' ||
    field === 'net_pay_share' ||
    field === 'gross_percentage'
  ) {
    if (typeof value === 'number') {
      return `${value}%`;
    }
  }

  return String(value);
};

export const getNonNullFields = (obj: unknown, excludeFalse: boolean = false): Array<[string, unknown]> => {
  if (!isRecord(obj)) return [];

  return Object.entries(obj).filter(([_key, value]) => {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (excludeFalse && value === false) return false;

    if (isRecord(value) && !Array.isArray(value)) {
      return Object.keys(value).length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  });
};
