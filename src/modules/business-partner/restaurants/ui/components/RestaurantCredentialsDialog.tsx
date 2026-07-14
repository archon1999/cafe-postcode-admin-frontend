import { useTranslate } from 'app/providers/locales';
import { CredentialsRevealDialog } from 'modules/product-owner/business-partners/ui/components/CredentialsRevealDialog.tsx';
import type { AdminGeneratedCredentials } from 'shared/api/admin-types.ts';

export type RestaurantCredentialsDialogMode = 'activation' | 'reset' | 'auth_code';

export type RestaurantCredentialsDialogState = {
  credentials?: AdminGeneratedCredentials | null;
  authCode?: string | null;
  mode: RestaurantCredentialsDialogMode;
} | null;

type RestaurantCredentialsDialogProps = {
  open: RestaurantCredentialsDialogState;
  onClose: () => void;
};

export function RestaurantCredentialsDialog({ open, onClose }: RestaurantCredentialsDialogProps) {
  const { t } = useTranslate('platform');
  const fields = [
    ...(open?.credentials
      ? [
          { label: t('fields.username'), value: open.credentials.username },
          { label: t('fields.password'), value: open.credentials.password },
        ]
      : []),
    ...(open?.authCode ? [{ label: t('fields.authCode'), value: open.authCode }] : []),
  ];
  const title =
    open?.mode === 'auth_code' ? t('dialogs.restaurantAuthCode.title') : t('dialogs.restaurantCredentials.title');
  const description =
    open?.mode === 'reset'
      ? t('dialogs.restaurantCredentials.resetDescription')
      : open?.mode === 'auth_code'
        ? t('dialogs.restaurantAuthCode.description')
        : t('dialogs.restaurantCredentials.description');

  return (
    <CredentialsRevealDialog
      open={Boolean(open)}
      title={title}
      description={description}
      fields={fields}
      onClose={onClose}
    />
  );
}
