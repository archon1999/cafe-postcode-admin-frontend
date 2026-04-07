import Button from '@mui/material/Button';

import { useTranslate } from 'app/providers/locales';
import { useExtendRestaurantMutation } from 'modules/product-owner/business-partners/application';
import type { AdminRestaurant } from 'shared/api/admin-types.ts';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

type RestaurantExtendDialogProps = {
  open: AdminRestaurant | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RestaurantExtendDialog({ open, onClose, onSuccess }: RestaurantExtendDialogProps) {
  const { t } = useTranslate('platform');
  const extendMutation = useExtendRestaurantMutation();

  return (
    <ConfirmDialog
      open={Boolean(open)}
      onClose={onClose}
      title={t('dialogs.extendRestaurant.title', { defaultValue: 'Tarif muddatini uzaytirish' })}
      content={t('dialogs.extendRestaurant.description', {
        defaultValue: '"{{name}}" restoranining amal qilish muddatini uzaytirmoqchimisiz?',
        name: open?.name ?? '',
      })}
      action={
        <Button
          color="primary"
          variant="contained"
          loading={extendMutation.isPending}
          onClick={async () => {
            if (!open) return;
            await extendMutation.mutateAsync(open.id);
            onSuccess?.();
          }}>
          {t('actions.extend', { defaultValue: 'Muddatini uzaytirish' })}
        </Button>
      }
    />
  );
}
