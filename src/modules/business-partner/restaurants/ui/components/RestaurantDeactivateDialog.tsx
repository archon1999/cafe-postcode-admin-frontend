import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import { useDeactivateRestaurantMutation } from 'modules/product-owner/business-partners/application';
import type { AdminRestaurant } from 'shared/api/admin-types.ts';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

type RestaurantDeactivateDialogProps = {
  restaurant: AdminRestaurant | null;
  onClose: () => void;
};

export function RestaurantDeactivateDialog({ restaurant, onClose }: RestaurantDeactivateDialogProps) {
  const { t } = useTranslate('platform');
  const deactivateMutation = useDeactivateRestaurantMutation();

  return (
    <ConfirmDialog
      open={Boolean(restaurant)}
      onClose={onClose}
      title={t('dialogs.deactivateRestaurant.title')}
      content={t('dialogs.deactivateRestaurant.description', { name: restaurant?.name ?? '' })}
      action={
        <Button
          color="error"
          variant="contained"
          loading={deactivateMutation.isPending}
          onClick={async () => {
            if (!restaurant) return;
            await deactivateMutation.mutateAsync(restaurant.id);
            onClose();
          }}>
          {t('actions.deactivate')}
        </Button>
      }
    />
  );
}
