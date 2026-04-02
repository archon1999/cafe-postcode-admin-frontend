import { useTranslate } from 'app/providers/locales';
import { CredentialsRevealDialog } from 'modules/product-owner/business-partners/ui/components/CredentialsRevealDialog.tsx';
import type { AdminGeneratedCredentials } from 'shared/api/admin-types.ts';

export type RestaurantCredentialsDialogMode = 'activation' | 'reset';

export type RestaurantCredentialsDialogState = {
  credentials: AdminGeneratedCredentials;
  mode: RestaurantCredentialsDialogMode;
} | null;

type RestaurantCredentialsDialogProps = {
  value: RestaurantCredentialsDialogState;
  onClose: () => void;
};

export function RestaurantCredentialsDialog({ value, onClose }: RestaurantCredentialsDialogProps) {
  const { t } = useTranslate('platform');

  return (
    <CredentialsRevealDialog
      open={Boolean(value)}
      title={t('dialogs.restaurantCredentials.title')}
      description={
        value?.mode === 'reset'
          ? t('dialogs.restaurantCredentials.resetDescription')
          : t('dialogs.restaurantCredentials.description')
      }
      credentials={value?.credentials ?? null}
      onClose={onClose}
    />
  );
}
