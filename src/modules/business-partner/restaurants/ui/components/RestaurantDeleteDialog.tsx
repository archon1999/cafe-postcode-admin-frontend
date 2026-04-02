import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurant } from 'shared/api/admin-types.ts';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

import { useDeleteRestaurantMutation } from '../../application';

type RestaurantDeleteDialogProps = {
  open: AdminRestaurant | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RestaurantDeleteDialog({ open, onClose, onSuccess }: RestaurantDeleteDialogProps) {
  const { t } = useTranslate('organizations');
  const deleteMutation = useDeleteRestaurantMutation();

  return (
    <ConfirmDialog
      open={Boolean(open)}
      onClose={onClose}
      title={t('dialogs.deleteRestaurant.title')}
      content={t('dialogs.deleteRestaurant.description', { name: open?.name ?? '' })}
      action={
        <Button
          color="error"
          variant="contained"
          loading={deleteMutation.isPending}
          onClick={async () => {
            if (!open) return;
            await deleteMutation.mutateAsync(open.id);
            onSuccess?.();
          }}>
          {t('actions.delete')}
        </Button>
      }
    />
  );
}
