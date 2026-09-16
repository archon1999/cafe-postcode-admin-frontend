import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useTranslate } from 'app/providers/locales';
import type { AdminTableShapeVariant } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

import {
  MAX_PRESET_TABLE_SEAT_COUNT,
  MAX_TABLE_SEAT_COUNT,
  MIN_TABLE_SEAT_COUNT,
  getDefaultShapeVariant,
  getShapeVariantsForSeatCount,
} from '../../../domain';

import type { DraftTable } from './ConstructorTableCard';
import { normalizeServiceFeeHourlyRate, normalizeServiceFeePercent } from './hallConstructorDraft';

type HallConstructorInspectorProps = {
  onDelete: () => void;
  selectedTable: DraftTable | null;
  updateSelectedTable: (updater: (table: DraftTable) => DraftTable) => void;
};

const CUSTOM_SEAT_COUNT = 'custom';
const PRESET_SEAT_COUNTS = Array.from(
  { length: MAX_PRESET_TABLE_SEAT_COUNT - MIN_TABLE_SEAT_COUNT + 1 },
  (_, index) => MIN_TABLE_SEAT_COUNT + index,
);

export function HallConstructorInspector({
  onDelete,
  selectedTable,
  updateSelectedTable,
}: HallConstructorInspectorProps) {
  const { t } = useTranslate('floor');
  const usesCustomSeatCount = Boolean(selectedTable && selectedTable.seatCount > MAX_PRESET_TABLE_SEAT_COUNT);

  return (
    <Card
      sx={{
        width: { xs: '100%', lg: 320, xl: 340 },
        p: 3,
        alignSelf: { lg: 'flex-start' },
        position: { lg: 'sticky' },
        top: { lg: 24 },
        maxHeight: { lg: 'calc(100dvh - 120px)' },
        overflowY: { lg: 'auto' },
      }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6">{t('labels.inspector')}</Typography>
          {!selectedTable ? (
            <Typography variant="body2" color="text.secondary">
              {t('labels.noTableSelected')}
            </Typography>
          ) : null}
        </Box>

        <Divider />

        {selectedTable ? (
          <Stack spacing={2}>
            <TextField
              label={t('fields.tableNumber')}
              slotProps={{ htmlInput: { maxLength: 255 } }}
              value={selectedTable.tableNumber}
              onChange={(event) =>
                updateSelectedTable((table) => ({
                  ...table,
                  tableNumber: event.target.value,
                }))
              }
            />
            <TextField
              label={t('fields.name')}
              value={selectedTable.name}
              onChange={(event) => updateSelectedTable((table) => ({ ...table, name: event.target.value }))}
            />
            <TextField
              select
              label={t('fields.seatCount')}
              value={usesCustomSeatCount ? CUSTOM_SEAT_COUNT : selectedTable.seatCount}
              onChange={(event) => {
                const seatCount =
                  event.target.value === CUSTOM_SEAT_COUNT
                    ? MAX_PRESET_TABLE_SEAT_COUNT + 1
                    : Number(event.target.value) || 4;
                updateSelectedTable((table) => ({
                  ...table,
                  seatCount,
                  shapeVariant: getDefaultShapeVariant(seatCount),
                }));
              }}>
              {PRESET_SEAT_COUNTS.map((seatCount) => (
                <MenuItem key={seatCount} value={seatCount}>
                  {seatCount}
                </MenuItem>
              ))}
              <MenuItem value={CUSTOM_SEAT_COUNT}>{t('labels.seatCountCustom')}</MenuItem>
            </TextField>
            {usesCustomSeatCount ? (
              <TextField
                label={t('fields.customSeatCount')}
                type="number"
                value={selectedTable.seatCount}
                helperText={t('labels.customSeatCountHint', { max: MAX_TABLE_SEAT_COUNT })}
                onChange={(event) => {
                  if (event.target.value === '') return;

                  const seatCount = Math.min(
                    MAX_TABLE_SEAT_COUNT,
                    Math.max(MAX_PRESET_TABLE_SEAT_COUNT + 1, Math.trunc(Number(event.target.value) || 0)),
                  );
                  updateSelectedTable((table) => ({
                    ...table,
                    seatCount,
                    shapeVariant: getDefaultShapeVariant(seatCount),
                  }));
                }}
                slotProps={{
                  htmlInput: {
                    min: MAX_PRESET_TABLE_SEAT_COUNT + 1,
                    max: MAX_TABLE_SEAT_COUNT,
                    step: 1,
                  },
                }}
              />
            ) : null}
            <TextField
              select
              label={t('fields.shapeVariant')}
              value={selectedTable.shapeVariant}
              onChange={(event) =>
                updateSelectedTable((table) => ({
                  ...table,
                  shapeVariant: event.target.value as AdminTableShapeVariant,
                }))
              }>
              {getShapeVariantsForSeatCount(selectedTable.seatCount).map((variant) => (
                <MenuItem key={variant} value={variant}>
                  {t(
                    selectedTable.seatCount > 6
                      ? `tableShapeVariants.large_${variant.endsWith('_vertical') ? 'vertical' : 'horizontal'}`
                      : `tableShapeVariants.${variant}`,
                  )}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t('fields.tableServiceFeeEnabled', { defaultValue: 'Stol xizmat haqi' })}
              value={selectedTable.serviceFeeEnabled ? selectedTable.serviceFeeMode : 'disabled'}
              onChange={(event) => {
                const selection = event.target.value as 'disabled' | 'percentage' | 'hourly';

                updateSelectedTable((table) => ({
                  ...table,
                  serviceFeeEnabled: selection !== 'disabled',
                  ...(selection !== 'disabled' ? { serviceFeeMode: selection } : {}),
                }));
              }}>
              <MenuItem value="disabled">
                {t('fields.serviceFeeModeDisabled', { defaultValue: "O'chirilgan" })}
              </MenuItem>
              <MenuItem value="percentage">{t('fields.serviceFeeModePercentage', { defaultValue: 'Foizli' })}</MenuItem>
              <MenuItem value="hourly">{t('fields.serviceFeeModeHourly', { defaultValue: 'Soatlik' })}</MenuItem>
            </TextField>
            {selectedTable.serviceFeeEnabled ? (
              <TextField
                label={
                  selectedTable.serviceFeeMode === 'hourly'
                    ? t('fields.serviceFeeHourlyRate', { defaultValue: 'Xizmat haqi (UZS/soat)' })
                    : t('fields.serviceFeePercent', { defaultValue: 'Xizmat haqi, %' })
                }
                type="number"
                value={
                  selectedTable.serviceFeeMode === 'hourly'
                    ? selectedTable.serviceFeeHourlyRate
                    : selectedTable.serviceFeePercent
                }
                onChange={(event) =>
                  updateSelectedTable((table) => ({
                    ...table,
                    ...(table.serviceFeeMode === 'hourly'
                      ? { serviceFeeHourlyRate: normalizeServiceFeeHourlyRate(event.target.value) }
                      : { serviceFeePercent: normalizeServiceFeePercent(event.target.value) }),
                  }))
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    ...(selectedTable.serviceFeeMode === 'percentage' ? { max: 99 } : {}),
                    step: 1,
                  },
                }}
              />
            ) : null}

            <Accordion
              disableGutters
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                <Typography variant="subtitle2">
                  {t('labels.advancedSettings', { defaultValue: 'Kengaytirilgan sozlamalar' })}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label={t('fields.positionX')}
                      type="number"
                      value={selectedTable.positionX}
                      onChange={(event) =>
                        updateSelectedTable((table) => ({
                          ...table,
                          positionX: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label={t('fields.positionY')}
                      type="number"
                      value={selectedTable.positionY}
                      onChange={(event) =>
                        updateSelectedTable((table) => ({
                          ...table,
                          positionY: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                      fullWidth
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label={t('fields.width')}
                      type="number"
                      value={selectedTable.width}
                      onChange={(event) =>
                        updateSelectedTable((table) => ({
                          ...table,
                          width: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label={t('fields.height')}
                      type="number"
                      value={selectedTable.height}
                      onChange={(event) =>
                        updateSelectedTable((table) => ({
                          ...table,
                          height: Math.max(1, Number(event.target.value) || 1),
                        }))
                      }
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Button
              color="error"
              variant="outlined"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onDelete}>
              {t('actions.delete')}
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
