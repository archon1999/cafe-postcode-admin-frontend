import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormContext } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { AdminMxikDetails, CatalogCategory, CatalogModifierGroup } from 'shared/api/admin-types';
import { RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { LabelRow } from 'shared/ui/LabelRow/LabelRow';

import type { CatalogItemFormInput } from '../../data-access/catalogItemForm.schema';

import { CatalogImageEditor } from './CatalogImageEditor';
import {
  formatCashSaleRestriction,
  formatMxikFlag,
  formatMxikPackage,
  getMxikCashSaleStatus,
  getMxikLabelStatus,
} from './catalogItemMxik';
import { CatalogModifierGroupsField } from './CatalogModifierGroupsField';
import { MxikAutocompleteField } from './MxikAutocompleteField';

type Props = {
  categories: CatalogCategory[];
  categoriesLoading: boolean;
  modifierGroups: CatalogModifierGroup[];
  modifierGroupsLoading: boolean;
  disabled: boolean;
  isDialog: boolean;
  mxikDetails?: AdminMxikDetails | null;
  mxikDetailsLoading: boolean;
  mxikImageUrl: string | null;
  selectedMxik: CatalogItemFormInput['mxik'];
  onClearImage: () => void;
  onRestoreMxikImage: () => void;
  onMxikNamePicked: (name: string) => void;
};

export function CatalogItemFormFields({
  categories,
  categoriesLoading,
  modifierGroups,
  modifierGroupsLoading,
  disabled,
  isDialog,
  mxikDetails,
  mxikDetailsLoading,
  mxikImageUrl,
  selectedMxik,
  onClearImage,
  onRestoreMxikImage,
  onMxikNamePicked,
}: Props) {
  const { t } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const mxikName = mxikDetails?.name || selectedMxik?.name || '';
  const primaryPackage = mxikDetails?.primaryPackage ?? null;
  const cashSaleStatus = getMxikCashSaleStatus(mxikDetails, selectedMxik?.raw);
  const labelStatus = getMxikLabelStatus(mxikDetails, selectedMxik?.raw);
  const { watch } = useFormContext<CatalogItemFormInput>();
  const saleUnit = watch('saleUnit');

  return (
    <Stack spacing={3} sx={isDialog ? { pt: 1 } : undefined}>
      <CatalogImageEditor<CatalogItemFormInput>
        imageName="imageFile"
        imageSourceName="imageSource"
        mxikImageUrl={mxikImageUrl}
        disabled={disabled}
        onClearImage={onClearImage}
        onRestoreMxikImage={onRestoreMxikImage}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}>
        <RHFTextField<CatalogItemFormInput> name="name" label={t('fields.name')} />
        <RHFSelect<CatalogItemFormInput>
          name="category"
          label={t('fields.category')}
          helperText={categoriesLoading ? tCommon('labels.loading') : undefined}>
          <MenuItem value="">{t('filters.all')}</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </RHFSelect>
        <MxikAutocompleteField<CatalogItemFormInput>
          name="mxik"
          label={t('fields.mxikCode')}
          helperText={t('labels.mxikOptional')}
          placeholder={t('actions.searchMxik')}
          onPicked={(picked) => {
            if (picked?.name) onMxikNamePicked(picked.name);
          }}
        />
        {selectedMxik?.code ? (
          <Box
            sx={{
              gridColumn: { xs: 'auto', md: '1 / -1' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.neutral',
              p: 2,
            }}>
            <Stack spacing={1.25} divider={<Divider flexItem />}>
              <Typography variant="subtitle2">{t('labels.mxikDetails')}</Typography>
              <LabelRow
                label={t('fields.mxikProductName')}
                value={mxikDetailsLoading && !mxikName ? tCommon('labels.loading') : mxikName}
              />
              <LabelRow
                label={t('fields.packageCodeWithField')}
                value={
                  mxikDetailsLoading && !primaryPackage ? tCommon('labels.loading') : formatMxikPackage(primaryPackage)
                }
              />
              <LabelRow
                label={t('fields.cashSaleRestriction')}
                value={
                  mxikDetailsLoading && cashSaleStatus === null
                    ? tCommon('labels.loading')
                    : formatCashSaleRestriction(cashSaleStatus, {
                        forbidden: t('labels.cashSaleForbidden'),
                        limited: t('labels.cashSaleLimited'),
                        unlimited: t('labels.cashSaleUnlimited'),
                      })
                }
              />
              <LabelRow
                label={t('fields.labelStatusWithField')}
                value={
                  mxikDetailsLoading && labelStatus === null
                    ? tCommon('labels.loading')
                    : formatMxikFlag(labelStatus, tCommon('labels.yes'), tCommon('labels.no'))
                }
              />
            </Stack>
          </Box>
        ) : null}
        <RHFSelect<CatalogItemFormInput> name="saleUnit" label={t('fields.saleUnit')}>
          <MenuItem value="piece">{t('fields.saleUnitPiece')}</MenuItem>
          <MenuItem value="kg">{t('fields.saleUnitKilogram')}</MenuItem>
        </RHFSelect>
        <RHFSumCurrencyField<CatalogItemFormInput>
          name="price"
          label={saleUnit === 'kg' ? t('fields.pricePerKilogram') : t('fields.pricePerPiece')}
        />
        <CatalogModifierGroupsField groups={modifierGroups} loading={modifierGroupsLoading} disabled={disabled} />
        <RHFTextField<CatalogItemFormInput>
          name="description"
          label={t('fields.description')}
          multiline
          rows={4}
          sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}
        />
      </Box>

      <Stack spacing={2}>
        <RHFSwitch<CatalogItemFormInput> name="isActive" label={t('fields.status')} />
        <RHFSwitch<CatalogItemFormInput> name="isStoplisted" label={t('fields.stoplist')} />
      </Stack>
    </Stack>
  );
}
