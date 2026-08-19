import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { useAdminScopeStore } from 'modules/auth';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import {
  useIssueTelegramLinkMutation,
  useRevokeTelegramSubscriptionMutation,
  useTelegramSubscriptionsQuery,
} from '../../../../application';
import type { TelegramLink, TelegramSubscription } from '../../../../domain';

export function TelegramPanel() {
  const { t } = useTranslate('security-center');
  const restaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<TelegramSubscription | null>(null);
  const subscriptionsQuery = useTelegramSubscriptionsQuery(restaurantId);
  const issueMutation = useIssueTelegramLinkMutation();
  const revokeMutation = useRevokeTelegramSubscriptionMutation(restaurantId);

  const issue = async () => {
    try {
      setLink(await issueMutation.mutateAsync());
    } catch {
      toast.error(t('telegram.messages.issueFailed'));
    }
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.startUrl);
    toast.success(t('telegram.messages.copied'));
  };

  const revoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeMutation.mutateAsync(revokeTarget.id);
      toast.success(t('telegram.messages.revoked'));
      setRevokeTarget(null);
    } catch {
      toast.error(t('telegram.messages.revokeFailed'));
    }
  };

  if (!restaurantId) {
    return <Alert severity="info">{t('telegram.selectRestaurant')}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <div>
            <Typography variant="h6">{t('telegram.linkTitle')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('telegram.linkDescription')}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:link-2-fill" />}
            loading={issueMutation.isPending}
            onClick={() => void issue()}>
            {t('telegram.createLink')}
          </Button>
        </Stack>
      </Card>

      <Typography variant="h6">{t('telegram.connectedUsers')}</Typography>
      <Stack spacing={1}>
        {(subscriptionsQuery.data ?? []).map((subscription) => (
          <Card key={subscription.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <div>
                <Typography variant="subtitle2">
                  {subscription.username
                    ? `@${subscription.username}`
                    : subscription.firstName || subscription.telegramUserId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('telegram.linkedAt')}: {formatDateTime(subscription.linkedAt)}
                </Typography>
              </div>
              <Button color="error" size="small" onClick={() => setRevokeTarget(subscription)}>
                {t('telegram.revoke')}
              </Button>
            </Stack>
          </Card>
        ))}
        {!subscriptionsQuery.isLoading && !subscriptionsQuery.data?.length && (
          <Card variant="outlined" sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
            {t('telegram.empty')}
          </Card>
        )}
      </Stack>

      <Dialog open={Boolean(link)} onClose={() => setLink(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('telegram.linkReady')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('telegram.oneTimeWarning')}
          </Alert>
          <Typography sx={{ overflowWrap: 'anywhere', p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            {link?.startUrl}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('telegram.expiresAt')}: {formatDateTime(link?.expiresAt)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLink(null)}>{t('common.close')}</Button>
          <Button variant="contained" startIcon={<Iconify icon="solar:copy-bold" />} onClick={() => void copy()}>
            {t('telegram.copy')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(revokeTarget)} onClose={() => setRevokeTarget(null)}>
        <DialogTitle>{t('telegram.revokeTitle')}</DialogTitle>
        <DialogContent>{t('telegram.revokeDescription')}</DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeTarget(null)}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" loading={revokeMutation.isPending} onClick={() => void revoke()}>
            {t('telegram.revoke')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
