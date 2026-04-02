import { useTranslate } from 'app/providers/locales';
import { CredentialsRevealDialog } from 'modules/product-owner/business-partners/ui/components/CredentialsRevealDialog.tsx';
import type { AdminGeneratedCredentials } from 'shared/api/admin-types.ts';

export type RestaurantCredentialsDialogMode = 'activation' | 'reset';

export type RestaurantCredentialsDialogState = {
  credentials: AdminGeneratedCredentials;
  mode: RestaurantCredentialsDialogMode;
} | null;

type RestaurantCredentialsDialogProps = {
  open: RestaurantCredentialsDialogState;
  onClose: () => void;
};

export function RestaurantCredentialsDialog({ open, onClose }: RestaurantCredentialsDialogProps) {
  const { t } = useTranslate('platform');

  return (
    <CredentialsRevealDialog
      open={Boolean(open)}
      title={t('dialogs.restaurantCredentials.title')}
      description={
        open?.mode === 'reset'
          ? t('dialogs.restaurantCredentials.resetDescription')
          : t('dialogs.restaurantCredentials.description')
      }
      credentials={open?.credentials ?? null}
      onClose={onClose}
    />
  );
}
