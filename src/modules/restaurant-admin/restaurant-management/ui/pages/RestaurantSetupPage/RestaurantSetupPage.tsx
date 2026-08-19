import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { apiClient } from 'shared/api/http/apiClient';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useApplyRestaurantSetupMutation, useRestaurantSetupReadinessQuery } from '../../../application';
import type { RestaurantSetupApplyPayload, RestaurantSetupStep } from '../../../domain';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { MyRestaurantSettingsTabs } from '../../components/MyRestaurantSettingsTabs';

import { downloadFiscalDriveService, downloadLocalAgentInstaller } from './installer-download';
import { LocalAgentDiagnostics } from './LocalAgentDiagnostics';
import {
  newCashDesk,
  newPrepStation,
  RestaurantQuickSetupCard,
  type CashDeskDraft,
  type PrepStationDraft,
} from './RestaurantQuickSetupCard';
import { getSetupPrinterSettings } from './setup-printer';

const stepRoutes: Partial<Record<RestaurantSetupStep['id'], string>> = {
  profile: RoutePath.organizationMyRestaurantGeneral,
  staff: RoutePath.employeeList,
  menu: RoutePath.catalogBrowser,
  integrations: RoutePath.organizationMyRestaurantIntegrationConfigList,
  printing: RoutePath.organizationMyRestaurantPrintTemplateList,
};

const RestaurantSetupPage = () => {
  const { t } = useTranslate('organizations');
  const { push } = useRouter();
  const readinessQuery = useRestaurantSetupReadinessQuery();
  const applyMutation = useApplyRestaurantSetupMutation();
  const [cashDesks, setCashDesks] = useState<CashDeskDraft[]>(() => [
    newCashDesk(t('setup.defaults.cashDesk', { number: 1 })),
  ]);
  const [prepStations, setPrepStations] = useState<PrepStationDraft[]>(() => [
    newPrepStation(t('setup.defaults.kitchen'), 0),
  ]);
  const [fiscalTaxNumber, setFiscalTaxNumber] = useState('');
  const [martaTaxNumber, setMartaTaxNumber] = useState('');
  const [checkingIntegration, setCheckingIntegration] = useState<string | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<RestaurantSetupStep['id'] | null>(null);
  const hydratedRestaurantId = useRef<string | null>(null);

  useEffect(() => {
    const readiness = readinessQuery.data;
    if (!readiness || hydratedRestaurantId.current === readiness.installerManifest.restaurantId) return;
    hydratedRestaurantId.current = readiness.installerManifest.restaurantId;
    const quickSetup = readiness.quickSetup;
    setFiscalTaxNumber(quickSetup.fiscalTaxNumber);
    setMartaTaxNumber(quickSetup.martaTaxNumber);
    setCashDesks(
      quickSetup.cashDesks.length
        ? quickSetup.cashDesks.map((desk) => ({
            id: desk.id,
            name: desk.name,
            printerTarget: desk.printerTarget,
            printerIntegrationId: desk.printerIntegrationId || undefined,
            paymentIntegrationId: desk.paymentIntegrationId || undefined,
            fiscalIntegrationId: desk.fiscalIntegrationId || undefined,
          }))
        : [newCashDesk(t('setup.defaults.cashDesk', { number: 1 }))],
    );
    setPrepStations(
      quickSetup.prepStations.length
        ? quickSetup.prepStations.map((station) => ({
            id: station.id,
            name: station.name,
            kind: station.kind,
            printerTarget: station.printerTarget,
            printerIntegrationId: station.printerIntegrationId || undefined,
          }))
        : [newPrepStation(t('setup.defaults.kitchen'), 0)],
    );
  }, [readinessQuery.data, t]);

  useEffect(() => {
    if (expandedStepId || !readinessQuery.data) return;
    setExpandedStepId(readinessQuery.data.steps.find((step) => step.status !== 'ready')?.id ?? null);
  }, [expandedStepId, readinessQuery.data]);

  const payload = useMemo<RestaurantSetupApplyPayload>(
    () => ({
      preset: cashDesks.length > 1 ? 'multi_terminal' : 'single_terminal',
      cashDesks: cashDesks.map((desk, index) => {
        const name = desk.name.trim() || t('setup.defaults.cashDesk', { number: index + 1 });
        return {
          id: desk.id,
          name,
          enabledPaymentMethods: ['cash', 'card', 'mixed'],
          receiptPrinterEnabled: true,
          printer: {
            id: desk.printerIntegrationId,
            name: `${name} printer`,
            provider: 'windows-raw',
            settings: getSetupPrinterSettings(desk.printerTarget),
          },
          payment: {
            id: desk.paymentIntegrationId,
            name: `${name} MARTA`,
            provider: 'marta-softpos',
            settings: { taxNumber: martaTaxNumber.trim() },
          },
          fiscal: {
            id: desk.fiscalIntegrationId,
            name: `${name} Fiscal Drive`,
            provider: 'fiscal-drive-service',
            settings: { taxNumber: fiscalTaxNumber.trim() },
          },
        };
      }),
      prepStations: prepStations.map((station, index) => {
        const name = station.name.trim() || t('setup.defaults.prepStation', { number: index + 1 });
        return {
          id: station.id,
          name,
          kind: station.kind,
          printer: {
            id: station.printerIntegrationId,
            name: `${name} printer`,
            provider: 'windows-raw',
            settings: getSetupPrinterSettings(station.printerTarget),
          },
        };
      }),
      createTakeaway: true,
    }),
    [cashDesks, fiscalTaxNumber, martaTaxNumber, prepStations, t],
  );

  if (readinessQuery.isLoading || !readinessQuery.data) return <LoadingScreen />;
  const readiness = readinessQuery.data;

  const applySetup = async () => {
    try {
      await applyMutation.mutateAsync(payload);
      toast.success(t('setup.messages.saved'));
    } catch {
      toast.error(t('setup.messages.saveFailed'));
    }
  };

  const runIntegrationCheck = async (key: string, name: string, check: () => Promise<unknown>) => {
    setCheckingIntegration(key);
    try {
      await check();
      toast.success(t('setup.messages.integrationCheckSucceeded', { name }));
    } catch {
      toast.error(t('setup.messages.integrationCheckFailed', { name }));
    } finally {
      setCheckingIntegration(null);
    }
  };

  const checkPrinter = (key: string, target: string) => {
    const settings = getSetupPrinterSettings(target);
    return runIntegrationCheck(key, t('setup.integrations.printer'), () => apiClient.checkLocalAgentPrinter(settings));
  };

  const checkMarta = () => runIntegrationCheck('marta', 'MARTA', () => apiClient.checkAdminMartaConnection());

  const checkFiscal = () =>
    runIntegrationCheck('fiscal', 'Fiscal Drive', async () => {
      const devices = await apiClient.getAdminFiscalDevices();
      if (!devices.length) throw new Error('Fiscal Drive device was not found.');
      return devices;
    });

  const downloadInstaller = async () => {
    try {
      await downloadLocalAgentInstaller();
      toast.success(t('setup.messages.installerDownloaded'));
    } catch {
      toast.error(t('setup.messages.installerDownloadFailed'));
    }
  };

  const downloadFiscalService = async () => {
    try {
      await downloadFiscalDriveService();
      toast.success(t('setup.messages.fiscalDriveServiceDownloaded'));
    } catch {
      toast.error(t('setup.messages.fiscalDriveServiceDownloadFailed'));
    }
  };

  const issueLabel = (code: string) => t(`setup.issues.${code}`, { defaultValue: t('setup.issues.generic') });

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.setup.title')}
      action={
        <Button startIcon={<Iconify icon="solar:refresh-linear" />} onClick={() => void readinessQuery.refetch()}>
          {t('setup.actions.checkReadiness', { defaultValue: 'Tayyorlikni tekshirish' })}
        </Button>
      }>
      <MyRestaurantSettingsTabs />
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Typography variant="h5">
                {t('setup.readiness.progress', { value: readiness.progressPercent })}
              </Typography>
              <Chip
                color={readiness.ready ? 'success' : 'warning'}
                icon={readiness.ready ? <Iconify icon="solar:check-circle-bold" /> : undefined}
                label={
                  readiness.ready
                    ? t('setup.status.ready')
                    : t('setup.readiness.remaining', { count: readiness.blockingIssueCount })
                }
              />
            </Stack>
            <LinearProgress variant="determinate" value={readiness.progressPercent} />
            <Typography variant="body2" color="text.secondary">
              {readiness.ready
                ? t('setup.readiness.readyHint', { defaultValue: 'Restoran ishga tushirishga tayyor.' })
                : t('setup.readiness.priorityHint', {
                    defaultValue: "Avval quyidagi muhim vazifalarni yakunlang. Tayyor bo'limlar yopiq holda turadi.",
                  })}
            </Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t('setup.steps.title')}
          </Typography>
          <Stack spacing={0}>
            {readiness.steps.map((step) => (
              <Accordion
                key={step.id}
                disableGutters
                elevation={0}
                expanded={expandedStepId === step.id}
                onChange={(_, expanded) => setExpandedStepId(expanded ? step.id : null)}
                sx={{
                  bgcolor: 'transparent',
                  borderRadius: '0 !important',
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { m: 0 },
                  '&:last-of-type': { borderBottom: 0 },
                }}>
                <AccordionSummary
                  expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}
                  sx={{
                    px: 0,
                    minHeight: 64,
                    '&.Mui-expanded': { minHeight: 64 },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: 1, pr: 1 }}>
                    <Iconify
                      icon={step.status === 'ready' ? 'solar:check-circle-bold' : 'solar:danger-triangle-bold'}
                      sx={{ color: step.status === 'ready' ? 'success.main' : 'warning.main' }}
                    />
                    <Typography variant="subtitle1" sx={{ flex: 1 }}>
                      {t(`setup.steps.${step.id}`)}
                    </Typography>
                    <Chip
                      size="small"
                      color={step.status === 'ready' ? 'success' : step.status === 'blocked' ? 'error' : 'warning'}
                      label={t(`setup.status.${step.status}`)}
                    />
                    {step.id === 'coordinator' ? <LocalAgentDiagnostics /> : null}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pl: { xs: 4.5, sm: 5 }, pr: 0, pt: 0, pb: 2.5 }}>
                  <Stack spacing={1.25}>
                    {step.issues.map((issue) => (
                      <Alert key={`${step.id}-${issue.code}`} severity={issue.blocking ? 'error' : 'warning'}>
                        {issueLabel(issue.code)}
                      </Alert>
                    ))}
                    {stepRoutes[step.id] ? (
                      <Button
                        size="small"
                        variant="text"
                        endIcon={<Iconify icon="solar:arrow-right-linear" />}
                        onClick={() => push(stepRoutes[step.id] as string)}
                        sx={{ alignSelf: 'flex-start', px: 0.25 }}>
                        {t('setup.actions.openSection')}
                      </Button>
                    ) : null}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Card>

        <RestaurantQuickSetupCard
          cashDesks={cashDesks}
          prepStations={prepStations}
          fiscalTaxNumber={fiscalTaxNumber}
          martaTaxNumber={martaTaxNumber}
          checkingIntegration={checkingIntegration}
          saving={applyMutation.isPending}
          setCashDesks={setCashDesks}
          setPrepStations={setPrepStations}
          onFiscalTaxNumberChange={setFiscalTaxNumber}
          onMartaTaxNumberChange={setMartaTaxNumber}
          onCheckFiscal={() => void checkFiscal()}
          onCheckMarta={() => void checkMarta()}
          onCheckPrinter={(key, target) => void checkPrinter(key, target)}
          onApply={() => void applySetup()}
        />

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5">{t('setup.installer.title')}</Typography>
            <Typography color="text.secondary">{t('setup.installer.description')}</Typography>
            <Alert severity="info">{t('setup.installer.hint')}</Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:download-minimalistic-linear" />}
                onClick={() => void downloadInstaller()}>
                {t('setup.actions.downloadInstaller')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:download-minimalistic-linear" />}
                onClick={() => void downloadFiscalService()}>
                {t('setup.actions.downloadFiscalDriveService')}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </MyRestaurantSectionLayout>
  );
};

export default RestaurantSetupPage;
