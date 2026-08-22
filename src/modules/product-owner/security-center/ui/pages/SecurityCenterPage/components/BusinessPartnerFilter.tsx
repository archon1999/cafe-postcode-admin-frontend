import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'app/providers/locales';
import { useGetBusinessPartnersListQuery } from 'modules/product-owner/business-partners/application';
import type { AdminBusinessPartner } from 'shared/api/admin-types';

export type BusinessPartnerFilterProps = {
  value: AdminBusinessPartner | null;
  onChange: (value: AdminBusinessPartner | null) => void;
};

export function BusinessPartnerFilter({ value, onChange }: BusinessPartnerFilterProps) {
  const { t } = useTranslate('security-center');
  const query = useGetBusinessPartnersListQuery({
    page: 1,
    pageSize: 100,
    ordering: 'companyName',
  });
  const partners = query.data?.data ?? [];

  return (
    <TextField
      select
      size="small"
      label={t('controlCenter.businessPartnerFilter')}
      value={value?.id ?? ''}
      disabled={query.isLoading && !query.data}
      slotProps={{
        inputLabel: { shrink: true },
        select: {
          displayEmpty: true,
          renderValue: (selected) =>
            partners.find((partner) => partner.id === selected)?.companyName ?? t('controlCenter.allBusinessPartners'),
        },
      }}
      onChange={(event) => {
        const selectedId = event.target.value;
        onChange(partners.find((partner) => partner.id === selectedId) ?? null);
      }}
      sx={{ width: { xs: 1, sm: 260 }, minWidth: { sm: 220 } }}>
      <MenuItem value="">{t('controlCenter.allBusinessPartners')}</MenuItem>
      {partners.map((partner) => (
        <MenuItem key={partner.id} value={partner.id}>
          {partner.companyName}
        </MenuItem>
      ))}
    </TextField>
  );
}
