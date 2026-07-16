import { Box, Button, Card, Stack, TextField, Typography, alpha } from '@mui/material';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { useSettingsContext } from 'shared/ui/Settings';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { GRID_CELL_SIZE, GRID_GAP_SIZE, GRID_PADDING_SIZE } from '../../../domain';

import { ConstructorTableCard, getConstructorPreviewPalette } from './ConstructorTableCard';
import { HallConstructorInspector } from './HallConstructorInspector';
import { useHallConstructorState } from './useHallConstructorState';

const nativeNumberInputSx = {
  width: 148,
  '& input[type=number]': { appearance: 'auto', MozAppearance: 'auto' },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    appearance: 'auto',
    WebkitAppearance: 'inner-spin-button',
    margin: 0,
  },
} as const;

export type HallConstructorPageContentProps = { id?: string };

export const HallConstructorPageContent = ({ id }: HallConstructorPageContentProps) => {
  const { t } = useTranslate('floor');
  const settings = useSettingsContext();
  const previewMode = settings.state.mode === 'dark' ? 'dark' : 'light';
  const constructor = useHallConstructorState(id);
  const {
    addTable,
    beginDrag,
    changeGridColumns,
    deleteSelectedTable,
    draft,
    gridRows,
    hallName,
    isLoading,
    isSaving,
    save,
    selectedTable,
    selectedTableId,
    setSelectedTableId,
    updateSelectedTable,
  } = constructor;

  if (isLoading || !draft) return <LoadingScreen />;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.hallConstructor.title')}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <BackToListButton href={RoutePath.floorHallList} />
            <Button variant="contained" onClick={() => void save()} disabled={isSaving}>
              {t('actions.save')}
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
        <Card sx={{ flex: 1, minWidth: 0, p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="h5">{formatHallDisplayName(hallName)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('labels.constructorHint')}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                size="small"
                label={t('fields.gridColumns')}
                type="number"
                value={draft.gridColumns}
                onChange={(event) => changeGridColumns(event.target.value)}
                slotProps={{ htmlInput: { min: 1, max: 24 } }}
                sx={{ ...nativeNumberInputSx, width: { xs: '100%', sm: 148 } }}
              />
              <Button
                sx={{ height: { xs: 44, sm: 40 }, width: { xs: '100%', sm: 'auto' } }}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={addTable}>
                {t('actions.addTable')}
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ overflowX: 'auto', overflowY: 'hidden', pb: 1 }}>
            <Box
              sx={(theme) => ({
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${draft.gridColumns}, ${GRID_CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${gridRows}, ${GRID_CELL_SIZE}px)`,
                gap: `${GRID_GAP_SIZE}px`,
                p: `${GRID_PADDING_SIZE}px`,
                borderRadius: '26px',
                backgroundImage: `
                  linear-gradient(${alpha(theme.palette.primary.main, 0.08)} 1px, transparent 1px),
                  linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_CELL_SIZE + GRID_GAP_SIZE}px ${GRID_CELL_SIZE + GRID_GAP_SIZE}px`,
                backgroundPosition: `${GRID_PADDING_SIZE / 2}px ${GRID_PADDING_SIZE / 2}px`,
                backgroundColor: getConstructorPreviewPalette(previewMode, false).canvas,
                border: `1px solid ${alpha(previewMode === 'dark' ? '#ffffff' : '#7d6548', previewMode === 'dark' ? 0.05 : 0.14)}`,
                boxShadow:
                  previewMode === 'dark'
                    ? 'inset 0 1px 0 rgba(255,255,255,0.02)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.52)',
              })}>
              {draft.tables.map((table) => (
                <Box
                  key={table.localId}
                  sx={{
                    gridColumn: `${table.positionX + 1} / span ${table.width}`,
                    gridRow: `${table.positionY + 1} / span ${table.height}`,
                  }}>
                  <ConstructorTableCard
                    table={table}
                    selected={table.localId === selectedTableId}
                    mode={previewMode}
                    onSelect={() => setSelectedTableId(table.localId)}
                    onMoveStart={(event) => {
                      if ((event.target as HTMLElement).closest('[aria-label="Resize table"]')) return;
                      event.preventDefault();
                      beginDrag('move', table, event.clientX, event.clientY);
                      setSelectedTableId(table.localId);
                    }}
                    onResizeStart={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      beginDrag('resize', table, event.clientX, event.clientY);
                      setSelectedTableId(table.localId);
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Card>

        <HallConstructorInspector
          onDelete={deleteSelectedTable}
          selectedTable={selectedTable}
          updateSelectedTable={updateSelectedTable}
        />
      </Stack>
    </Content>
  );
};
