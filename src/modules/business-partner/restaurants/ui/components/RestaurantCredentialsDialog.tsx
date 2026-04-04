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
          { label: t('fields.username', { defaultValue: 'Username' }), value: open.credentials.username },
          { label: t('fields.password', { defaultValue: 'Password' }), value: open.credentials.password },
        ]
      : []),
    ...(open?.authCode
      ? [{ label: t('fields.authCode', { defaultValue: 'Activation code' }), value: open.authCode }]
      : []),
  ];
  const title =
    open?.mode === 'auth_code'
      ? t('dialogs.restaurantAuthCode.title', { defaultValue: 'Restaurant activation code' })
      : t('dialogs.restaurantCredentials.title');
  const description =
    open?.mode === 'reset'
      ? t('dialogs.restaurantCredentials.resetDescription')
      : open?.mode === 'auth_code'
        ? t('dialogs.restaurantAuthCode.description', {
            defaultValue: 'Aktivatsiya kodi faqat ishonchli xodimlar bilan ulashilishi kerak.',
          })
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
