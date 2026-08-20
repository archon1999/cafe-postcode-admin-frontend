import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import { useDeactivateRestaurantMutation } from 'modules/product-owner/business-partners/application';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

import type { RestaurantActionTarget } from '../shared/restaurant-helpers';

type RestaurantDeactivateDialogProps = {
  open: RestaurantActionTarget | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RestaurantDeactivateDialog({ open, onClose, onSuccess }: RestaurantDeactivateDialogProps) {
  const { t } = useTranslate('platform');
  const deactivateMutation = useDeactivateRestaurantMutation();

  return (
    <ConfirmDialog
      open={Boolean(open)}
      onClose={onClose}
      title={t('dialogs.deactivateRestaurant.title')}
      content={t('dialogs.deactivateRestaurant.description', { name: open?.name ?? '' })}
      action={
        <Button
          color="error"
          variant="contained"
          loading={deactivateMutation.isPending}
          onClick={async () => {
            if (!open) return;
            await deactivateMutation.mutateAsync(open.id);
            onSuccess?.();
          }}>
          {t('actions.deactivate')}
        </Button>
      }
    />
  );
}
