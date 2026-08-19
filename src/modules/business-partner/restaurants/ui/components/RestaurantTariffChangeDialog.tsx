import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import {
  useChangeRestaurantTariffMutation,
  useGetRestaurantTariffChangePreviewQuery,
} from 'modules/business-partner/restaurants/application';
import { useGetRestaurantActivationOptionsQuery } from 'modules/product-owner/business-partners/application';
import type { AdminRestaurant } from 'shared/api/admin-types';

const NULL_ROLE_KEY = '__without_role__';

type RestaurantTariffChangeDialogProps = {
  open: AdminRestaurant | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function RestaurantTariffChangeDialog({ open, onClose, onSuccess }: RestaurantTariffChangeDialogProps) {
  const { t } = useTranslate('platform');
  const [tariffId, setTariffId] = useState('');
  const [roleMappings, setRoleMappings] = useState<Record<string, string>>({});
  const optionsQuery = useGetRestaurantActivationOptionsQuery({ enabled: Boolean(open) });
  const previewQuery = useGetRestaurantTariffChangePreviewQuery(open?.id ?? '', tariffId, {
    enabled: Boolean(open && tariffId),
  });
  const changeMutation = useChangeRestaurantTariffMutation(open?.id ?? '');

  const tariffOptions = useMemo(
    () => (optionsQuery.data?.tariffs ?? []).filter((tariff) => tariff.id !== open?.tariff?.id),
    [open?.tariff?.id, optionsQuery.data?.tariffs],
  );

  useEffect(() => {
    if (!open) {
      setTariffId('');
      setRoleMappings({});
    }
  }, [open]);

  useEffect(() => {
    const preview = previewQuery.data;
    if (!preview) return;

    setRoleMappings(
      Object.fromEntries(
        preview.roleGroups.map((group) => [group.sourceRole?.id ?? NULL_ROLE_KEY, group.suggestedTargetRole?.id ?? '']),
      ),
    );
  }, [previewQuery.data]);

  const preview = previewQuery.data;
  const allMappingsSelected = Boolean(
    tariffId && preview && preview.roleGroups.every((group) => roleMappings[group.sourceRole?.id ?? NULL_ROLE_KEY]),
  );

  const handleSubmit = async () => {
    if (!open || !preview || !allMappingsSelected) return;

    await changeMutation.mutateAsync({
      tariffId,
      roleMappings: preview.roleGroups.map((group) => ({
        sourceRoleId: group.sourceRole?.id ?? null,
        targetRoleId: roleMappings[group.sourceRole?.id ?? NULL_ROLE_KEY],
      })),
    });
    onSuccess();
  };

  return (
    <Dialog open={Boolean(open)} onClose={changeMutation.isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('dialogs.changeTariff.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="info">{t('dialogs.changeTariff.credentialsHint')}</Alert>
          <TextField
            select
            fullWidth
            label={t('fields.tariff')}
            value={tariffId}
            onChange={(event) => {
              setTariffId(event.target.value);
              setRoleMappings({});
            }}>
            <MenuItem value="">{t('labels.notSelected')}</MenuItem>
            {tariffOptions.map((tariff) => (
              <MenuItem key={tariff.id} value={tariff.id}>
                {tariff.name}
              </MenuItem>
            ))}
          </TextField>

          {previewQuery.isLoading ? <Typography>{t('dialogs.changeTariff.loading')}</Typography> : null}

          {preview ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1">
                {t('dialogs.changeTariff.mappingTitle', { tariff: preview.targetTariff.name })}
              </Typography>
              {preview.roleGroups.length ? (
                preview.roleGroups.map((group) => {
                  const sourceKey = group.sourceRole?.id ?? NULL_ROLE_KEY;
                  return (
                    <Box
                      key={sourceKey}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(240px, 0.8fr)' },
                        gap: 2,
                        p: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1.5,
                      }}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">
                          {group.sourceRole?.name ?? t('labels.withoutRole')} ({group.employeeCount})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.employees.map((employee) => employee.fullName || employee.username).join(', ')}
                        </Typography>
                      </Stack>
                      <TextField
                        select
                        fullWidth
                        required
                        label={t('dialogs.changeTariff.newRole')}
                        value={roleMappings[sourceKey] ?? ''}
                        onChange={(event) =>
                          setRoleMappings((current) => ({ ...current, [sourceKey]: event.target.value }))
                        }>
                        <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                        {preview.targetTariff.allowedRoles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  );
                })
              ) : (
                <Alert severity="success">{t('dialogs.changeTariff.noEmployees')}</Alert>
              )}
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={changeMutation.isPending} color="inherit">
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color="black"
          loading={changeMutation.isPending}
          disabled={!allMappingsSelected}
          onClick={() => void handleSubmit()}>
          {t('actions.changeTariff')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
