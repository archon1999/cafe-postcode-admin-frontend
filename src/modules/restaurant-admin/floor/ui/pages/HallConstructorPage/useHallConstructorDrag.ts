import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

import { GRID_CELL_SIZE, canPlaceTable, clampTableToGrid } from '../../../domain';

import type { DraftTable } from './ConstructorTableCard';
import type { HallConstructorDraft, HallConstructorDragState } from './hallConstructorDraft';

export function useHallConstructorDrag(setDraft: Dispatch<SetStateAction<HallConstructorDraft | null>>) {
  const dragStateRef = useRef<HallConstructorDragState | null>(null);

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
              { ...candidateBase, width: Math.max(1, candidateBase.width), height: Math.max(1, candidateBase.height) },
              currentDraft.gridColumns,
            );
            if (!canPlaceTable(currentDraft.tables, { ...candidate, id: table.id }, currentDraft.gridColumns)) {
              return table;
            }
            return { ...table, ...candidate };
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
  }, [setDraft]);

  return (mode: HallConstructorDragState['mode'], table: DraftTable, clientX: number, clientY: number) => {
    dragStateRef.current = {
      mode,
      localId: table.localId,
      startX: clientX,
      startY: clientY,
      origin: {
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
      },
    };
  };
}
