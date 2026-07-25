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

import { getDefaultShapeVariant, getShapeVariantsForSeatCount } from '../../../domain';

import type { DraftTable } from './ConstructorTableCard';

type HallConstructorInspectorProps = {
  onDelete: () => void;
  selectedTable: DraftTable | null;
  updateSelectedTable: (updater: (table: DraftTable) => DraftTable) => void;
};

export function HallConstructorInspector({
  onDelete,
  selectedTable,
  updateSelectedTable,
}: HallConstructorInspectorProps) {
  const { t } = useTranslate('floor');

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
          <Typography variant="body2" color="text.secondary">
            {selectedTable ? t('labels.inspectorHint') : t('labels.noTableSelected')}
          </Typography>
        </Box>

        <Divider />

        {selectedTable ? (
          <Stack spacing={2}>
            <TextField
              label={t('fields.tableNumber')}
              type="number"
              value={selectedTable.tableNumber}
              onChange={(event) =>
                updateSelectedTable((table) => ({
                  ...table,
                  tableNumber: Math.max(1, Number(event.target.value) || 1),
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
              value={selectedTable.seatCount}
              onChange={(event) => {
                const seatCount = Number(event.target.value) || 4;
                updateSelectedTable((table) => ({
                  ...table,
                  seatCount,
                  shapeVariant: getDefaultShapeVariant(seatCount),
                }));
              }}>
              {[2, 3, 4, 5, 6].map((seatCount) => (
                <MenuItem key={seatCount} value={seatCount}>
                  {seatCount}
                </MenuItem>
              ))}
            </TextField>
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
                  {t(`tableShapeVariants.${variant}`)}
                </MenuItem>
              ))}
            </TextField>

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
