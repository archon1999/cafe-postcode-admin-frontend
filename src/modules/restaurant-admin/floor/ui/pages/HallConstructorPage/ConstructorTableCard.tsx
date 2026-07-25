import { Box, Stack, alpha } from '@mui/material';

import type { AdminHallConstructorTable } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

import { getVariantMarkers } from '../../../domain';

export type DraftTable = AdminHallConstructorTable & {
  localId: string;
};

export function getConstructorPreviewPalette(mode: 'light' | 'dark', selected: boolean) {
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

export function ConstructorTableCard({
  table,
  selected,
  onSelect,
  onMoveStart,
  onResizeStart,
  onNudge,
  mode,
}: {
  table: DraftTable;
  selected: boolean;
  onSelect: () => void;
  onMoveStart: (event: React.PointerEvent<HTMLElement>) => void;
  onResizeStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onNudge: (deltaX: number, deltaY: number) => void;
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
      component="div"
      role="button"
      tabIndex={0}
      aria-label={table.name}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
        const directions: Partial<Record<string, [number, number]>> = {
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
        };
        const direction = directions[event.key];
        if (direction) {
          event.preventDefault();
          onSelect();
          onNudge(...direction);
        }
      }}
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
