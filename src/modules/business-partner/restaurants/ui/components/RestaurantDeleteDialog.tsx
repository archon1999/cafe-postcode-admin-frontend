import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurant } from 'shared/api/admin-types.ts';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

import { useDeleteRestaurantMutation } from '../../application';

type RestaurantDeleteDialogProps = {
  restaurant: AdminRestaurant | null;
  onClose: () => void;
};

export function RestaurantDeleteDialog({ restaurant, onClose }: RestaurantDeleteDialogProps) {
  const { t } = useTranslate('organizations');
  const deleteMutation = useDeleteRestaurantMutation();

  return (
    <ConfirmDialog
      open={Boolean(restaurant)}
      onClose={onClose}
      title={t('dialogs.deleteRestaurant.title')}
      content={t('dialogs.deleteRestaurant.description', { name: restaurant?.name ?? '' })}
      action={
        <Button
          color="error"
          variant="contained"
          loading={deleteMutation.isPending}
          onClick={async () => {
            if (!restaurant) return;
            await deleteMutation.mutateAsync(restaurant.id);
            onClose();
          }}>
          {t('actions.delete')}
        </Button>
      }
    />
  );
}
