import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { SystemCssProperties } from '@mui/system';
import { useEffect, useState, type DragEvent, type ReactNode } from 'react';

type SortableEntry = {
  id: string;
};

type SortableGridProps<T extends SortableEntry> = {
  items: T[];
  gridTemplateColumns: SystemCssProperties<Theme>['gridTemplateColumns'];
  gap: number;
  dragLabel: string;
  disabled?: boolean;
  renderItem: (item: T) => ReactNode;
  onReorder: (items: T[]) => Promise<unknown>;
};

export function SortableGrid<T extends SortableEntry>({
  items,
  gridTemplateColumns,
  gap,
  dragLabel,
  disabled = false,
  renderItem,
  onReorder,
}: SortableGridProps<T>) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const handleDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = draggedId ?? event.dataTransfer.getData('text/plain');
    setDraggedId(null);

    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = orderedItems.findIndex((item) => item.id === sourceId);
    const targetIndex = orderedItems.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const previousItems = orderedItems;
    const nextItems = [...orderedItems];
    const [movedItem] = nextItems.splice(sourceIndex, 1);
    if (!movedItem) return;

    nextItems.splice(targetIndex, 0, movedItem);
    setOrderedItems(nextItems);

    void onReorder(nextItems).catch(() => setOrderedItems(previousItems));
  };

  return (
    <Box role="list" sx={{ display: 'grid', gridTemplateColumns, gap }}>
      {orderedItems.map((item) => (
        <Box
          key={item.id}
          role="listitem"
          draggable={!disabled}
          title={dragLabel}
          onDragStart={(event) => {
            setDraggedId(item.id);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.id);
          }}
          onDragOver={(event) => {
            if (!disabled) {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={(event) => handleDrop(event, item.id)}
          onDragEnd={() => setDraggedId(null)}
          sx={{
            position: 'relative',
            minWidth: 0,
            cursor: disabled ? 'default' : 'grab',
            opacity: draggedId === item.id ? 0.5 : 1,
            outline: draggedId === item.id ? '2px dashed' : 'none',
            outlineColor: 'primary.main',
            transition: (theme) => theme.transitions.create(['opacity', 'outline-color']),
            '&:active': { cursor: disabled ? 'default' : 'grabbing' },
          }}>
          {renderItem(item)}
        </Box>
      ))}
    </Box>
  );
}
