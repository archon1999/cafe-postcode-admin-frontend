import { Box, Button, Card, Divider, MenuItem, Stack, TextField, Typography, alpha } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import type {
  AdminHallConstructorPayload,
  AdminHallConstructorTable,
  AdminTableShapeVariant,
} from 'shared/api/admin-types';
import { useRedirectOnNotFound } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { useSettingsContext } from 'shared/ui/Settings';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { useGetHallConstructorQuery, useUpdateHallConstructorMutation } from '../../../application';
import {
  GRID_CELL_SIZE,
  GRID_GAP_SIZE,
  GRID_PADDING_SIZE,
  canPlaceTable,
  clampTableToGrid,
  findFirstAvailablePlacement,
  getDefaultShapeVariant,
  getNextTableNumber,
  getRequiredGridRows,
  getShapeVariantsForSeatCount,
  getVariantMarkers,
} from '../../../domain';

type DraftTable = AdminHallConstructorTable & {
  localId: string;
};

type DraftState = {
  gridColumns: number;
  tables: DraftTable[];
  deletedTableIds: string[];
};

type DragState = {
  mode: 'move' | 'resize';
  localId: string;
  startX: number;
  startY: number;
  origin: Pick<DraftTable, 'positionX' | 'positionY' | 'width' | 'height'>;
} | null;

const nativeNumberInputSx = {
  width: 148,
  '& input[type=number]': {
    appearance: 'auto',
    MozAppearance: 'auto',
  },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    appearance: 'auto',
    WebkitAppearance: 'inner-spin-button',
    margin: 0,
  },
} as const;

function toDraftTable(table: AdminHallConstructorTable): DraftTable {
  return {
    ...table,
    localId: table.id,
  };
}

function serializeDraft(draft: DraftState | null): string {
  if (!draft) {
    return '';
  }

  return JSON.stringify({
    gridColumns: draft.gridColumns,
    deletedTableIds: [...draft.deletedTableIds].sort(),
    tables: [...draft.tables]
      .map((table) => ({
        id: table.id,
        name: table.name,
        tableNumber: table.tableNumber,
        seatCount: table.seatCount,
        shapeVariant: table.shapeVariant,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        isActive: table.isActive,
      }))
      .sort((left, right) => left.tableNumber - right.tableNumber),
  });
}

function getConstructorPreviewPalette(mode: 'light' | 'dark', selected: boolean) {
  if (mode === 'dark') {
    return {
      outer: selected ? '#203745' : '#23272c',
      shell: selected ? '#2c566e' : '#2d3137',
      plate: selected ? '#1f7ae0' : '#9ca3ab',
      rail: selected ? '#39a8bd' : '#41464e',
      text: '#f4f7fb',
      border: selected ? 'rgba(31, 122, 224, 0.44)' : 'rgba(255, 255, 255, 0.06)',
      shadow: selected
        ? '0 0 0 1px rgba(31,122,224,0.18), 0 18px 30px rgba(7, 19, 31, 0.28)'
        : 'inset 0 1px 0 rgba(255,255,255,0.025)',
      canvas: '#1a1d21',
    };
  }

  return {
    outer: selected ? 'rgba(25, 118, 210, 0.12)' : '#ffffff',
    shell: selected ? 'rgba(25, 118, 210, 0.18)' : 'rgba(23, 33, 43, 0.05)',
    plate: selected ? '#1976d2' : 'rgba(23, 33, 43, 0.18)',
    rail: 'rgba(105, 115, 128, 0.34)',
    text: '#223041',
    border: selected ? 'rgba(25, 118, 210, 0.42)' : 'rgba(109, 122, 138, 0.16)',
    shadow: selected ? '0 0 0 1px rgba(25,118,210,0.18)' : 'none',
    canvas: 'rgba(244, 246, 248, 0.72)',
  };
}

function ConstructorTableCard({
  table,
  selected,
  onSelect,
  onMoveStart,
  onResizeStart,
  mode,
}: {
  table: DraftTable;
  selected: boolean;
  onSelect: () => void;
  onMoveStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onResizeStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  mode: 'light' | 'dark';
}) {
  const markers = getVariantMarkers(table.shapeVariant);
  const isTall = table.height > table.width || table.shapeVariant.endsWith('_vertical');
  const palette = getConstructorPreviewPalette(mode, selected);
  const plateSx = table.shapeVariant.endsWith('_vertical')
    ? { width: 58, height: 72, borderRadius: '18px' }
    : table.shapeVariant.endsWith('_horizontal')
      ? { width: 82, height: 50, borderRadius: '16px' }
      : { width: 62, height: 62, borderRadius: '18px' };

  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      onPointerDown={onMoveStart}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        borderRadius: '22px',
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.outer,
        boxShadow: palette.shadow,
        cursor: 'grab',
        overflow: 'hidden',
        p: 0,
        boxSizing: 'border-box',
        '&:active': {
          cursor: 'grabbing',
        },
      }}>
      {markers.map((marker) => (
        <Box
          key={marker.key}
          sx={{
            position: 'absolute',
            borderRadius: 999,
            backgroundColor: palette.rail,
            boxShadow: `0 0 14px ${alpha(palette.rail, mode === 'dark' ? 0.14 : 0.08)}`,
            ...marker,
          }}
        />
      ))}

      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={0.75}
        sx={{
          position: 'absolute',
          inset: isTall ? '10px 16px' : '14px 14px',
          borderRadius: '18px',
          backgroundColor: palette.shell,
          color: palette.text,
          overflow: 'hidden',
          px: 0.75,
          py: 0.75,
          boxSizing: 'border-box',
        }}>
        <Box
          sx={{
            ...plateSx,
            minWidth: 0,
            maxWidth: '100%',
            px: 1.2,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: palette.plate,
            color: selected ? '#ffffff' : palette.text,
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: `0 12px 20px ${alpha(selected ? palette.plate : '#596270', mode === 'dark' ? 0.18 : 0.1)}`,
          }}>
          {table.tableNumber}
        </Box>
      </Stack>

      <Box
        component="button"
        type="button"
        onPointerDown={onResizeStart}
        aria-label="Resize table"
        sx={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          width: 20,
          height: 20,
          border: 0,
          p: 0,
          borderRadius: '8px',
          cursor: 'nwse-resize',
          backgroundColor: selected ? palette.plate : alpha(palette.plate, 0.76),
          color: selected ? '#ffffff' : palette.text,
          display: 'grid',
          placeItems: 'center',
        }}>
        <Iconify icon="solar:scale-line-duotone" width={13} />
      </Box>
    </Box>
  );
}

export type HallConstructorPageContentProps = {
  id?: string;
};

export const HallConstructorPageContent = ({ id }: HallConstructorPageContentProps) => {
  const { t } = useTranslate('floor');
  const settings = useSettingsContext();
  const query = useGetHallConstructorQuery(id ?? '', { enabled: Boolean(id) });
  const updateMutation = useUpdateHallConstructorMutation(id ?? '');
  const mode = settings.state.mode;

  useRedirectOnNotFound(query.error, Boolean(id));

  const [draft, setDraft] = useState<DraftState | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const dragStateRef = useRef<DragState>(null);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const nextDraft: DraftState = {
      gridColumns: query.data.gridColumns,
      tables: query.data.tables.map(toDraftTable),
      deletedTableIds: [],
    };
    setDraft(nextDraft);
    setInitialSnapshot(serializeDraft(nextDraft));
    setSelectedTableId(nextDraft.tables[0]?.localId ?? null);
  }, [query.data]);

  const isDirty = useMemo(() => serializeDraft(draft) !== initialSnapshot, [draft, initialSnapshot]);
  const selectedTable = useMemo(
    () => draft?.tables.find((table) => table.localId === selectedTableId) ?? null,
    [draft, selectedTableId],
  );
  const gridRows = useMemo(() => getRequiredGridRows(draft?.tables ?? []), [draft?.tables]);

  useEffect(() => {
    if (!isDirty) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) {
        return;
      }

      setDraft((currentDraft) => {
        if (!currentDraft) {
          return currentDraft;
        }

        const deltaColumns = Math.round((event.clientX - dragState.startX) / GRID_CELL_SIZE);
        const deltaRows = Math.round((event.clientY - dragState.startY) / GRID_CELL_SIZE);

        return {
          ...currentDraft,
          tables: currentDraft.tables.map((table) => {
            if (table.localId !== dragState.localId) {
              return table;
            }

            const candidateBase =
              dragState.mode === 'move'
                ? {
                    ...table,
                    positionX: dragState.origin.positionX + deltaColumns,
                    positionY: dragState.origin.positionY + deltaRows,
                    width: dragState.origin.width,
                    height: dragState.origin.height,
                  }
                : {
                    ...table,
                    positionX: dragState.origin.positionX,
                    positionY: dragState.origin.positionY,
                    width: dragState.origin.width + deltaColumns,
                    height: dragState.origin.height + deltaRows,
                  };

            const candidate = clampTableToGrid(
              {
                ...candidateBase,
                width: Math.max(1, candidateBase.width),
                height: Math.max(1, candidateBase.height),
              },
              currentDraft.gridColumns,
            );

            if (!canPlaceTable(currentDraft.tables, { ...candidate, id: table.id }, currentDraft.gridColumns)) {
              return table;
            }

            return {
              ...table,
              positionX: candidate.positionX,
              positionY: candidate.positionY,
              width: candidate.width,
              height: candidate.height,
            };
          }),
        };
      });
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleGridColumnsChange = (rawValue: string) => {
    const nextValue = Number(rawValue);

    setDraft((currentDraft) => {
      if (!currentDraft || !Number.isFinite(nextValue)) {
        return currentDraft;
      }

      const normalized = Math.max(1, Math.trunc(nextValue));
      const exceedsGrid = currentDraft.tables.some((table) => table.positionX + table.width > normalized);
      if (exceedsGrid) {
        toast.error(t('messages.gridColumnsTooSmall'));
        return currentDraft;
      }

      return { ...currentDraft, gridColumns: normalized };
    });
  };

  const updateSelectedTable = (updater: (table: DraftTable) => DraftTable) => {
    setDraft((currentDraft) => {
      if (!currentDraft || !selectedTableId) {
        return currentDraft;
      }

      const currentTable = currentDraft.tables.find((table) => table.localId === selectedTableId);
      if (!currentTable) {
        return currentDraft;
      }

      const candidate = clampTableToGrid(updater(currentTable), currentDraft.gridColumns);
      if (!canPlaceTable(currentDraft.tables, { ...candidate, id: currentTable.id }, currentDraft.gridColumns)) {
        toast.error(t('messages.tableOverlap'));
        return currentDraft;
      }

      return {
        ...currentDraft,
        tables: currentDraft.tables.map((table) =>
          table.localId === selectedTableId ? { ...table, ...candidate } : table,
        ),
      };
    });
  };

  const handleAddTable = () => {
    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const tableNumber = getNextTableNumber(currentDraft.tables);
      const placement = findFirstAvailablePlacement(currentDraft.tables, currentDraft.gridColumns);
      const nextTable: DraftTable = {
        id: '',
        localId: `draft-${tableNumber}-${currentDraft.tables.length + 1}`,
        name: `${tableNumber}-stol`,
        tableNumber,
        seatCount: 4,
        shapeVariant: getDefaultShapeVariant(4),
        positionX: placement.positionX,
        positionY: placement.positionY,
        width: 1,
        height: 1,
        isActive: true,
      };

      setSelectedTableId(nextTable.localId);
      return {
        ...currentDraft,
        tables: [...currentDraft.tables, nextTable],
      };
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedTableId) {
      return;
    }

    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const table = currentDraft.tables.find((item) => item.localId === selectedTableId);
      if (!table) {
        return currentDraft;
      }

      const deletedTableIds = table.id ? [...currentDraft.deletedTableIds, table.id] : currentDraft.deletedTableIds;
      const nextTables = currentDraft.tables.filter((item) => item.localId !== selectedTableId);
      setSelectedTableId(nextTables[0]?.localId ?? null);
      return {
        ...currentDraft,
        tables: nextTables,
        deletedTableIds,
      };
    });
  };

  const handleSave = async () => {
    if (!draft || !id) {
      return;
    }

    const payload: AdminHallConstructorPayload = {
      gridColumns: draft.gridColumns,
      tables: draft.tables.map((table) => ({
        ...(table.id ? { id: table.id } : {}),
        name: table.name.trim(),
        tableNumber: table.tableNumber,
        seatCount: table.seatCount,
        shapeVariant: table.shapeVariant,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        isActive: table.isActive,
      })),
      deletedTableIds: draft.deletedTableIds,
    };

    const response = await updateMutation.mutateAsync(payload);
    const nextDraft: DraftState = {
      gridColumns: response.gridColumns,
      tables: response.tables.map(toDraftTable),
      deletedTableIds: [],
    };
    setDraft(nextDraft);
    setInitialSnapshot(serializeDraft(nextDraft));
    setSelectedTableId(nextDraft.tables[0]?.localId ?? null);
    toast.success(t('messages.constructorSaved'));
  };

  if (query.isLoading || !draft) {
    return <LoadingScreen />;
  }

  const hallDisplayName = formatHallDisplayName(query.data?.hallName);

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.hallConstructor.title')}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <BackToListButton href={RoutePath.floorHallList} />
            <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
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
              <Typography variant="h5">{hallDisplayName}</Typography>
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
                onChange={(event) => handleGridColumnsChange(event.target.value)}
                slotProps={{ htmlInput: { min: 1, max: 24 } }}
                sx={{ ...nativeNumberInputSx, width: { xs: '100%', sm: 148 } }}
              />
              <Button
                sx={{ height: { xs: 44, sm: 40 }, width: { xs: '100%', sm: 'auto' } }}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddTable}>
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
                backgroundColor: getConstructorPreviewPalette(mode, false).canvas,
                border: `1px solid ${alpha(mode === 'dark' ? '#ffffff' : '#7d6548', mode === 'dark' ? 0.05 : 0.14)}`,
                boxShadow:
                  mode === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : 'inset 0 1px 0 rgba(255,255,255,0.52)',
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
                    mode={mode}
                    onSelect={() => setSelectedTableId(table.localId)}
                    onMoveStart={(event) => {
                      if ((event.target as HTMLElement).closest('[aria-label="Resize table"]')) {
                        return;
                      }
                      event.preventDefault();
                      dragStateRef.current = {
                        mode: 'move',
                        localId: table.localId,
                        startX: event.clientX,
                        startY: event.clientY,
                        origin: {
                          positionX: table.positionX,
                          positionY: table.positionY,
                          width: table.width,
                          height: table.height,
                        },
                      };
                      setSelectedTableId(table.localId);
                    }}
                    onResizeStart={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      dragStateRef.current = {
                        mode: 'resize',
                        localId: table.localId,
                        startX: event.clientX,
                        startY: event.clientY,
                        origin: {
                          positionX: table.positionX,
                          positionY: table.positionY,
                          width: table.width,
                          height: table.height,
                        },
                      };
                      setSelectedTableId(table.localId);
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Card>

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

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={handleDeleteSelected}>
                  {t('actions.delete')}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Card>
      </Stack>
    </Content>
  );
};
