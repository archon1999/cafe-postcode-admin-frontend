import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { AdminZoneOrCabin } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { SortableGrid } from 'shared/ui/SortableGrid';

import { FloorZoneCard } from './FloorZoneCard';

type FloorZonesPanelProps = {
  zones: AdminZoneOrCabin[];
  hallCounts: Map<string, number>;
  selectedZoneId: string | null;
  isLoading: boolean;
  isReordering: boolean;
  onSelectZone: (zoneId: string) => void;
  onCreateZone: () => void;
  onEditZone: () => void;
  onReorder: (zones: AdminZoneOrCabin[]) => Promise<unknown>;
};

export function FloorZonesPanel({
  zones,
  hallCounts,
  selectedZoneId,
  isLoading,
  isReordering,
  onSelectZone,
  onCreateZone,
  onEditZone,
  onReorder,
}: FloorZonesPanelProps) {
  const { t } = useTranslate('floor');
  const restaurantId = useAdminRestaurantScopeId();
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorZoneCreate);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography variant="h6">{t('pages.zones.title')}</Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('actions.createZone')}>
              <span>
                <IconButton onClick={onCreateZone} disabled={isCreateDisabled}>
                  <Iconify icon="mingcute:add-line" width={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('actions.edit')}>
              <span>
                <IconButton onClick={onEditZone} disabled={!selectedZoneId || !restaurantId}>
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={152} />
            ))}
          </Box>
        ) : zones.length ? (
          <SortableGrid
            items={zones}
            gridTemplateColumns="repeat(2, minmax(0, 1fr))"
            gap={1.5}
            dragLabel={t('labels.dragToReorder')}
            disabled={isReordering || !restaurantId}
            onReorder={onReorder}
            renderItem={(zone) => (
              <FloorZoneCard
                zone={zone}
                hallCount={hallCounts.get(zone.id) ?? 0}
                isSelected={zone.id === selectedZoneId}
                onSelect={onSelectZone}
              />
            )}
          />
        ) : (
          <EmptyContent
            filled
            title={t('empty.zones.noData.title')}
            description={t('empty.zones.noData.description')}
            action={
              <Button
                variant="contained"
                color="black"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={isCreateDisabled}
                onClick={onCreateZone}
                sx={{ mt: 3 }}>
                {t('actions.createZone')}
              </Button>
            }
          />
        )}
      </Box>
    </Card>
  );
}
