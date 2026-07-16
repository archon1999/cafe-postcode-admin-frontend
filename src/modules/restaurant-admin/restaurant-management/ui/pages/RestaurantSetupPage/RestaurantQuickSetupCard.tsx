import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Dispatch, SetStateAction } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

export type CashDeskDraft = {
  id?: string;
  name: string;
  printerTarget: string;
  printerIntegrationId?: string;
  paymentIntegrationId?: string;
  fiscalIntegrationId?: string;
};

export type PrepStationDraft = {
  id?: string;
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  printerTarget: string;
  printerIntegrationId?: string;
};

export const newCashDesk = (name: string): CashDeskDraft => ({ name, printerTarget: '' });

export const newPrepStation = (name: string, index: number): PrepStationDraft => ({
  name,
  kind: index === 0 ? 'kitchen' : 'other',
  printerTarget: '',
});

type Props = {
  cashDesks: CashDeskDraft[];
  prepStations: PrepStationDraft[];
  fiscalTaxNumber: string;
  martaAddress: string;
  checkingIntegration: string | null;
  saving: boolean;
  setCashDesks: Dispatch<SetStateAction<CashDeskDraft[]>>;
  setPrepStations: Dispatch<SetStateAction<PrepStationDraft[]>>;
  onFiscalTaxNumberChange: (value: string) => void;
  onMartaAddressChange: (value: string) => void;
  onCheckFiscal: () => void;
  onCheckMarta: () => void;
  onCheckPrinter: (key: string, target: string) => void;
  onApply: () => void;
};

function IntegrationCheckButton({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton aria-label={label} color="primary" disabled={loading} onClick={onClick} sx={{ mt: 0.5 }}>
          {loading ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-linear" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export function RestaurantQuickSetupCard({
  cashDesks,
  prepStations,
  fiscalTaxNumber,
  martaAddress,
  checkingIntegration,
  saving,
  setCashDesks,
  setPrepStations,
  onFiscalTaxNumberChange,
  onMartaAddressChange,
  onCheckFiscal,
  onCheckMarta,
  onCheckPrinter,
  onApply,
}: Props) {
  const { t } = useTranslate('organizations');

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h5">{t('setup.quick.title')}</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label={t('fields.taxNumber')}
              value={fiscalTaxNumber}
              onChange={(event) => onFiscalTaxNumberChange(event.target.value)}
            />
            <IntegrationCheckButton
              label={t('setup.actions.testIntegration', { name: 'Fiscal Drive' })}
              loading={checkingIntegration === 'fiscal'}
              onClick={onCheckFiscal}
            />
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label={t('setup.fields.martaAddress')}
              helperText={t('setup.fields.martaAddressHint')}
              value={martaAddress}
              onChange={(event) => onMartaAddressChange(event.target.value)}
            />
            <IntegrationCheckButton
              label={t('setup.actions.testIntegration', { name: 'MARTA' })}
              loading={checkingIntegration === 'marta'}
              onClick={onCheckMarta}
            />
          </Stack>
        </Stack>

        <Divider>{t('setup.sections.cashDesks')}</Divider>
        {cashDesks.map((desk, index) => (
          <Card key={index} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                  {desk.name.trim() || t('setup.cashDesk.title', { number: index + 1 })}
                </Typography>
                {cashDesks.length > 1 ? (
                  <IconButton
                    aria-label={t('actions.delete')}
                    color="error"
                    onClick={() => setCashDesks((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                    <Iconify icon="solar:trash-bin-trash-linear" />
                  </IconButton>
                ) : null}
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  label={t('fields.name')}
                  value={desk.name}
                  onChange={(event) =>
                    setCashDesks((items) =>
                      items.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                />
                <TextField
                  fullWidth
                  label={t('setup.fields.printerNameOrIp')}
                  value={desk.printerTarget}
                  onChange={(event) =>
                    setCashDesks((items) =>
                      items.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, printerTarget: event.target.value } : item,
                      ),
                    )
                  }
                />
                <IntegrationCheckButton
                  label={t('setup.actions.testIntegration', { name: t('setup.integrations.printer') })}
                  loading={checkingIntegration === `cash-printer-${index}`}
                  onClick={() => onCheckPrinter(`cash-printer-${index}`, desk.printerTarget)}
                />
              </Stack>
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:add-circle-linear" />}
          onClick={() =>
            setCashDesks((items) => [...items, newCashDesk(t('setup.defaults.cashDesk', { number: items.length + 1 }))])
          }>
          {t('setup.actions.addCashDesk')}
        </Button>

        <Divider>{t('setup.sections.prepStations')}</Divider>
        {prepStations.map((station, index) => (
          <Card key={index} variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
              <TextField
                fullWidth
                label={t('fields.name')}
                value={station.name}
                onChange={(event) =>
                  setPrepStations((items) =>
                    items.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, name: event.target.value } : item,
                    ),
                  )
                }
              />
              <TextField
                fullWidth
                label={t('setup.fields.printerNameOrIp')}
                value={station.printerTarget}
                onChange={(event) =>
                  setPrepStations((items) =>
                    items.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, printerTarget: event.target.value } : item,
                    ),
                  )
                }
              />
              <IntegrationCheckButton
                label={t('setup.actions.testIntegration', { name: t('setup.integrations.printer') })}
                loading={checkingIntegration === `prep-printer-${index}`}
                onClick={() => onCheckPrinter(`prep-printer-${index}`, station.printerTarget)}
              />
              {prepStations.length > 1 ? (
                <IconButton
                  aria-label={t('actions.delete')}
                  color="error"
                  onClick={() => setPrepStations((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                  <Iconify icon="solar:trash-bin-trash-linear" />
                </IconButton>
              ) : null}
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:add-circle-linear" />}
          onClick={() =>
            setPrepStations((items) => [
              ...items,
              newPrepStation(t('setup.defaults.prepStation', { number: items.length + 1 }), items.length),
            ])
          }>
          {t('setup.actions.addPrepStation')}
        </Button>
        <Button variant="contained" size="large" disabled={saving} onClick={onApply}>
          {t('setup.actions.apply')}
        </Button>
      </Stack>
    </Card>
  );
}
