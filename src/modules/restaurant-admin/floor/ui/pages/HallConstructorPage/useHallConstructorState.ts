import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import type { AdminHallConstructorPayload } from 'shared/api/admin-types';
import { useRedirectOnNotFound } from 'shared/hooks/router';

import { useGetHallConstructorQuery, useUpdateHallConstructorMutation } from '../../../application';
import {
  canPlaceTable,
  clampTableToGrid,
  findFirstAvailablePlacement,
  getDefaultShapeVariant,
  getNextTableNumber,
  getRequiredGridRows,
} from '../../../domain';

import type { DraftTable } from './ConstructorTableCard';
import { serializeHallConstructorDraft, toDraftTable, type HallConstructorDraft } from './hallConstructorDraft';
import { useHallConstructorDrag } from './useHallConstructorDrag';

export function useHallConstructorState(id?: string) {
  const { t } = useTranslate('floor');
  const query = useGetHallConstructorQuery(id ?? '', { enabled: Boolean(id) });
  const updateMutation = useUpdateHallConstructorMutation(id ?? '');
  useRedirectOnNotFound(query.error, Boolean(id));

  const [draft, setDraft] = useState<HallConstructorDraft | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const beginDrag = useHallConstructorDrag(setDraft);

  useEffect(() => {
    if (!query.data) return;
    const nextDraft: HallConstructorDraft = {
      gridColumns: query.data.gridColumns,
      tables: query.data.tables.map(toDraftTable),
      deletedTableIds: [],
    };
    setDraft(nextDraft);
    setInitialSnapshot(serializeHallConstructorDraft(nextDraft));
    setSelectedTableId(nextDraft.tables[0]?.localId ?? null);
  }, [query.data]);

  const isDirty = useMemo(() => serializeHallConstructorDraft(draft) !== initialSnapshot, [draft, initialSnapshot]);
  const selectedTable = useMemo(
    () => draft?.tables.find((table) => table.localId === selectedTableId) ?? null,
    [draft, selectedTableId],
  );
  const gridRows = useMemo(() => getRequiredGridRows(draft?.tables ?? []), [draft?.tables]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const changeGridColumns = (rawValue: string) => {
    const nextValue = Number(rawValue);
    setDraft((currentDraft) => {
      if (!currentDraft || !Number.isFinite(nextValue)) return currentDraft;
      const normalized = Math.max(1, Math.trunc(nextValue));
      if (currentDraft.tables.some((table) => table.positionX + table.width > normalized)) {
        toast.error(t('messages.gridColumnsTooSmall'));
        return currentDraft;
      }
      return { ...currentDraft, gridColumns: normalized };
    });
  };

  const updateSelectedTable = (updater: (table: DraftTable) => DraftTable) => {
    setDraft((currentDraft) => {
      if (!currentDraft || !selectedTableId) return currentDraft;
      const currentTable = currentDraft.tables.find((table) => table.localId === selectedTableId);
      if (!currentTable) return currentDraft;
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

  const addTable = () => {
    setDraft((currentDraft) => {
      if (!currentDraft) return currentDraft;
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
      return { ...currentDraft, tables: [...currentDraft.tables, nextTable] };
    });
  };

  const deleteSelectedTable = () => {
    if (!selectedTableId) return;
    setDraft((currentDraft) => {
      if (!currentDraft) return currentDraft;
      const table = currentDraft.tables.find((item) => item.localId === selectedTableId);
      if (!table) return currentDraft;
      const deletedTableIds = table.id ? [...currentDraft.deletedTableIds, table.id] : currentDraft.deletedTableIds;
      const nextTables = currentDraft.tables.filter((item) => item.localId !== selectedTableId);
      setSelectedTableId(nextTables[0]?.localId ?? null);
      return { ...currentDraft, tables: nextTables, deletedTableIds };
    });
  };

  const save = async () => {
    if (!draft || !id) return;
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
    const nextDraft: HallConstructorDraft = {
      gridColumns: response.gridColumns,
      tables: response.tables.map(toDraftTable),
      deletedTableIds: [],
    };
    setDraft(nextDraft);
    setInitialSnapshot(serializeHallConstructorDraft(nextDraft));
    setSelectedTableId(nextDraft.tables[0]?.localId ?? null);
    toast.success(t('messages.constructorSaved'));
  };

  return {
    addTable,
    beginDrag,
    changeGridColumns,
    deleteSelectedTable,
    draft,
    gridRows,
    isLoading: query.isLoading,
    isSaving: updateMutation.isPending,
    hallName: query.data?.hallName,
    save,
    selectedTable,
    selectedTableId,
    setSelectedTableId,
    updateSelectedTable,
  };
}
