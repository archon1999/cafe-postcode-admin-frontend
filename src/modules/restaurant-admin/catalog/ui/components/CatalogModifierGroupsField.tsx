import { Icon } from '@iconify/react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { CatalogModifierGroup } from 'shared/api/admin-types';
import { formatMoney } from 'shared/utils/format-money';

import type { CatalogItemFormInput } from '../../data-access/catalogItemForm.schema';

import { CatalogModifierGroupForm } from './CatalogModifierGroupForm';

type Props = {
  groups: CatalogModifierGroup[];
  loading: boolean;
  disabled: boolean;
};

export function CatalogModifierGroupsField({ groups, loading, disabled }: Props) {
  const { t } = useTranslate('catalog');
  const { control, getValues, setValue } = useFormContext<CatalogItemFormInput>();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
      <Stack spacing={0.75}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">{t('modifiers.productFieldTitle')}</Typography>
          <Button
            variant="text"
            color="inherit"
            size="small"
            startIcon={<Icon icon="mingcute:add-line" width={17} />}
            onClick={() => setQuickAddOpen(true)}>
            {t('modifiers.quickAddGroup')}
          </Button>
        </Stack>

        <Controller
          name="modifierGroups"
          control={control}
          render={({ field, fieldState }) => {
            const selectedGroups = groups.filter((group) => (field.value ?? []).includes(group.id));
            return (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={groups.filter((group) => group.isActive)}
                value={selectedGroups}
                loading={loading}
                disabled={disabled}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                onChange={(_event, next) => field.onChange(next.map((group) => group.id))}
                renderTags={(values, getTagProps) =>
                  values.map((group, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={group.id}
                      label={`${group.name} · ${group.options.filter((option) => option.isActive).length}`}
                      size="small"
                      sx={(theme) => ({
                        border: 0,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.07),
                        '& .MuiChip-deleteIcon': {
                          color: alpha(theme.palette.text.primary, 0.42),
                          '&:hover': { color: theme.palette.text.secondary },
                        },
                      })}
                    />
                  ))
                }
                renderOption={(props, group, state) => {
                  const activeOptions = group.options.filter((option) => option.isActive);
                  const rule =
                    group.minSelections === 1 && group.maxSelections === 1
                      ? t('modifiers.requiredSingle')
                      : group.maxSelections === 1
                        ? t('modifiers.optionalSingle')
                        : `${group.minSelections}–${group.maxSelections} ${t('modifiers.variant')}`;
                  return (
                    <Box
                      component="li"
                      {...props}
                      key={group.id}
                      sx={(theme) => ({
                        gap: 1.25,
                        alignItems: 'flex-start !important',
                        px: '14px !important',
                        py: '12px !important',
                        minHeight: 'unset !important',
                        border: '1px solid',
                        borderColor: state.selected ? 'transparent' : alpha(theme.palette.text.primary, 0.1),
                        borderRadius: '12px',
                        background: state.selected
                          ? alpha(theme.palette.text.primary, 0.045)
                          : theme.palette.background.paper,
                        transition: 'background-color 160ms ease, border-color 160ms ease',
                        '&[aria-selected="true"]': {
                          background: `${alpha(theme.palette.text.primary, 0.045)} !important`,
                        },
                        '&.Mui-focused, &.Mui-focusVisible': {
                          background: `${alpha(theme.palette.text.primary, 0.065)} !important`,
                          borderColor: state.selected ? 'transparent' : alpha(theme.palette.primary.main, 0.28),
                        },
                      })}>
                      <Box
                        sx={{
                          width: 20,
                          flex: '0 0 20px',
                          mt: 0.15,
                          color: state.selected ? 'primary.main' : 'text.disabled',
                        }}>
                        <Icon icon={state.selected ? 'solar:check-circle-bold' : 'solar:circle-outline'} width={20} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'flex-start', sm: 'baseline' }}
                          justifyContent="space-between"
                          spacing={{ xs: 0.25, sm: 1 }}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1.35 }}>
                            {group.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            {rule}
                          </Typography>
                        </Stack>
                        {activeOptions.length ? (
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            {activeOptions.map((option) => (
                              <Stack
                                key={option.id}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1.5}
                                sx={(theme) => ({
                                  minHeight: 34,
                                  px: 1.2,
                                  py: 0.65,
                                  borderRadius: 1,
                                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                                })}>
                                <Typography variant="body2" sx={{ minWidth: 0, fontWeight: 500 }}>
                                  {option.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color={option.priceDelta ? 'primary.main' : 'text.secondary'}
                                  sx={{ flexShrink: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                  {option.priceDelta ? `+${formatMoney(option.priceDelta)}` : t('modifiers.free')}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.75 }}>
                            {t('modifiers.noVariants')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={field.ref}
                    placeholder={selectedGroups.length ? '' : t('modifiers.selectGroup')}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 0.75,
                      borderRadius: 2,
                      backgroundImage: 'none',
                      bgcolor: 'background.paper',
                      boxShadow: '0 12px 32px rgba(31, 36, 48, 0.14)',
                    },
                  },
                  listbox: {
                    sx: {
                      maxHeight: 360,
                      p: 1,
                      display: 'grid',
                      gap: 0.75,
                      bgcolor: 'background.paper',
                    },
                  },
                }}
              />
            );
          }}
        />
      </Stack>

      <Dialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} maxWidth="md" fullWidth>
        <CatalogModifierGroupForm
          onCancel={() => setQuickAddOpen(false)}
          onSuccess={(created) => {
            setValue('modifierGroups', [...new Set([...(getValues('modifierGroups') ?? []), created.id])], {
              shouldDirty: true,
              shouldValidate: true,
            });
            setQuickAddOpen(false);
          }}
        />
      </Dialog>
    </Box>
  );
}
