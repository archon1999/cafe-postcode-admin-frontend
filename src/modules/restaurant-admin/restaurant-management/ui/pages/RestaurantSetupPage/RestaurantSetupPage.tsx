import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
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

import { downloadLocalAgentInstaller } from './installer-download';
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
  const [martaAddress, setMartaAddress] = useState('');
  const [checkingIntegration, setCheckingIntegration] = useState<string | null>(null);
  const hydratedRestaurantId = useRef<string | null>(null);

  useEffect(() => {
    const readiness = readinessQuery.data;
    if (!readiness || hydratedRestaurantId.current === readiness.installerManifest.restaurantId) return;
    hydratedRestaurantId.current = readiness.installerManifest.restaurantId;
    const quickSetup = readiness.quickSetup;
    setFiscalTaxNumber(quickSetup.taxNumber);
    setMartaAddress(quickSetup.martaAddress);
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
            settings: { endpointUrl: martaAddress.trim() },
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
    [cashDesks, fiscalTaxNumber, martaAddress, prepStations, t],
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

  const checkMarta = () =>
    runIntegrationCheck('marta', 'MARTA', () => apiClient.checkAdminMartaConnection(martaAddress.trim()));

  const checkFiscal = () =>
    runIntegrationCheck('fiscal', 'Fiscal Drive', async () => {
      const devices = await apiClient.getAdminFiscalDevices();
      if (!devices.length) throw new Error('Fiscal Drive device was not found.');
      return devices;
    });

  const downloadInstaller = async () => {
    try {
      await downloadLocalAgentInstaller(readiness.installerManifest.restaurantCode);
      toast.success(t('setup.messages.installerDownloaded'));
    } catch {
      toast.error(t('setup.messages.installerDownloadFailed'));
    }
  };
  const issueLabel = (code: string) => t(`setup.issues.${code}`, { defaultValue: t('setup.issues.generic') });

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.setup.title')}
      action={
        <Button startIcon={<Iconify icon="solar:refresh-linear" />} onClick={() => void readinessQuery.refetch()}>
          {t('setup.actions.check')}
        </Button>
      }>
      <MyRestaurantSettingsTabs />
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
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
          </Stack>
        </Card>

        <RestaurantQuickSetupCard
          cashDesks={cashDesks}
          prepStations={prepStations}
          fiscalTaxNumber={fiscalTaxNumber}
          martaAddress={martaAddress}
          checkingIntegration={checkingIntegration}
          saving={applyMutation.isPending}
          setCashDesks={setCashDesks}
          setPrepStations={setPrepStations}
          onFiscalTaxNumberChange={setFiscalTaxNumber}
          onMartaAddressChange={setMartaAddress}
          onCheckFiscal={() => void checkFiscal()}
          onCheckMarta={() => void checkMarta()}
          onCheckPrinter={(key, target) => void checkPrinter(key, target)}
          onApply={() => void applySetup()}
        />

        <Card sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t('setup.steps.title')}
          </Typography>
          <Stepper orientation="vertical" nonLinear>
            {readiness.steps.map((step) => (
              <Step key={step.id} active completed={step.status === 'ready'}>
                <StepLabel
                  error={step.status === 'blocked'}
                  optional={
                    <Chip
                      size="small"
                      color={step.status === 'ready' ? 'success' : step.status === 'blocked' ? 'error' : 'warning'}
                      label={t(`setup.status.${step.status}`)}
                    />
                  }>
                  <Stack component="span" direction="row" alignItems="center" spacing={0.5}>
                    <span>{t(`setup.steps.${step.id}`)}</span>
                    {step.id === 'coordinator' ? <LocalAgentDiagnostics /> : null}
                  </Stack>
                </StepLabel>
                <StepContent>
                  <Stack spacing={1.25} sx={{ pb: 2 }}>
                    {step.issues.length ? (
                      step.issues.map((issue) => (
                        <Alert key={`${step.id}-${issue.code}`} severity={issue.blocking ? 'error' : 'warning'}>
                          {issueLabel(issue.code)}
                        </Alert>
                      ))
                    ) : (
                      <Alert severity="success">{t('setup.status.ready')}</Alert>
                    )}
                    {stepRoutes[step.id] ? (
                      <Button size="small" variant="outlined" onClick={() => push(stepRoutes[step.id] as string)}>
                        {t('setup.actions.openSection')}
                      </Button>
                    ) : null}
                  </Stack>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5">{t('setup.installer.title')}</Typography>
            <Typography color="text.secondary">{t('setup.installer.description')}</Typography>
            <Alert severity="info">{t('setup.installer.hint')}</Alert>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:download-minimalistic-linear" />}
              onClick={() => void downloadInstaller()}>
              {t('setup.actions.downloadInstaller')}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </MyRestaurantSectionLayout>
  );
};

export default RestaurantSetupPage;
