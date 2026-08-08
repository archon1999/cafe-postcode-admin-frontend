import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { CatalogItem, CatalogItemGroup, CatalogItemGroupPayload } from 'shared/api/admin-types';

import {
  useCreateCatalogItemGroupMutation,
  useDeleteCatalogItemGroupMutation,
  useUpdateCatalogItemGroupMutation,
} from '../../application';

type Props = {
  categoryId: string;
  group?: CatalogItemGroup | null;
  products: CatalogItem[];
  onCancel: () => void;
  onSuccess: () => void;
};

export function CatalogItemGroupDialog({ categoryId, group, products, onCancel, onSuccess }: Props) {
  const { t } = useTranslate('catalog');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const createMutation = useCreateCatalogItemGroupMutation();
  const updateMutation = useUpdateCatalogItemGroupMutation(group?.id ?? '');
  const deleteMutation = useDeleteCatalogItemGroupMutation();
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const memberCount = group?.members.length ?? products.length;

  useEffect(() => {
    setName(group?.name ?? inferGroupName(products));
    setError('');
  }, [group, products]);

  const save = async () => {
    if (!name.trim()) {
      setError(t('itemGroups.nameRequired'));
      return;
    }

    const members = group
      ? group.members.map((member, sortOrder) => ({
          catalogItem: member.catalogItem,
          variantName: member.variantName,
          sortOrder,
        }))
      : products.map((product, sortOrder) => ({
          catalogItem: product.id,
          variantName: inferVariantName(product.name),
          sortOrder,
        }));

    if (members.length < 2) {
      setError(t('itemGroups.minimumMembers'));
      return;
    }

    const payload: CatalogItemGroupPayload = {
      category: categoryId,
      name: name.trim(),
      description: group?.description ?? '',
      isActive: group?.isActive ?? true,
      sortOrder: group?.sortOrder,
      members,
    };

    try {
      if (group) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
      onSuccess();
    } catch {
      setError(t('itemGroups.saveFailed'));
    }
  };

  return (
    <>
      <DialogTitle>{group ? t('itemGroups.editTitle') : t('itemGroups.createTitle')}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label={t('itemGroups.nameLabel')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <Typography variant="body2" color="text.secondary">
            {t('itemGroups.memberCount', { count: memberCount })}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {group ? (
          <Button
            color="error"
            sx={{ mr: 'auto' }}
            disabled={isPending}
            onClick={async () => {
              await deleteMutation.mutateAsync(group.id);
              onSuccess();
            }}>
            {t('itemGroups.delete')}
          </Button>
        ) : null}
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isPending}>
          {t('itemGroups.cancel')}
        </Button>
        <Button variant="contained" color="black" onClick={save} loading={isPending}>
          {group ? t('itemGroups.save') : t('itemGroups.groupAction')}
        </Button>
      </DialogActions>
    </>
  );
}

function inferGroupName(products: CatalogItem[]) {
  return products.length ? products[0].name.replace(/\s+(S|M|L|XL|\d+\s*cm)$/i, '').trim() : '';
}

function inferVariantName(name: string) {
  return name.match(/(?:^|\s)(S|M|L|XL|\d+\s*cm)\s*$/i)?.[1]?.toUpperCase() ?? '';
}
