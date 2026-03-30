export const formatValue = (field: string, value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'object' && value !== null) {
    if (value.label !== undefined) {
      return String(value.label);
    }
    if (value.name !== undefined) {
      return String(value.name);
    }
    if (value.unit_number !== undefined) {
      return String(value.unit_number);
    }
    if (value.first_name !== undefined && value.last_name !== undefined) {
      return `${value.first_name} ${value.last_name}`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '-';

      if (field === 'inventories') {
        return value
          .map((item) => {
            if (item.type?.label && item.provider_company?.name) {
              return `${item.type.label} (${item.provider_company.name})`;
            }
            return item.type?.label || item.provider_company?.name || '-';
          })
          .join(', ');
      }

      if (field === 'shareholder_contracts') {
        return value
          .map((contract) => {
            if (contract.net_pay_share !== undefined) {
              return `${contract.net_pay_share}%`;
            }
            return '-';
          })
          .join(', ');
      }

      return value
        .map((item) => {
          if (typeof item === 'object') {
            return item.label || item.name || item.unit_number || JSON.stringify(item);
          }
          return String(item);
        })
        .join(', ');
    }
    return '-';
  }

  if (field.includes('_date') || field === 'birth_date' || field === 'hired_date') {
    try {
      return new Date(value).toLocaleDateString('en-GB');
    } catch {
      return String(value);
    }
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

export const getNonNullFields = (obj: any, excludeFalse: boolean = false): Array<[string, any]> => {
  if (!obj || typeof obj !== 'object') return [];

  return Object.entries(obj).filter(([key, value]) => {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (excludeFalse && value === false) return false;

    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  });
};
