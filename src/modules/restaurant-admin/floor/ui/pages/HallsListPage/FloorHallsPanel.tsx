import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { AdminHall, AdminZoneOrCabin } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { SortableGrid } from 'shared/ui/SortableGrid';

import { FloorHallCard } from './FloorHallCard';

type FloorHallsPanelProps = {
  selectedZone: AdminZoneOrCabin | null;
  halls: AdminHall[];
  isLoading: boolean;
  isRefreshing: boolean;
  isReordering: boolean;
  onCreateHall: () => void;
  onEditHall: (hall: AdminHall) => void;
  onReorder: (halls: AdminHall[]) => Promise<unknown>;
};

export function FloorHallsPanel({
  selectedZone,
  halls,
  isLoading,
  isRefreshing,
  isReordering,
  onCreateHall,
  onEditHall,
  onReorder,
}: FloorHallsPanelProps) {
  const { t } = useTranslate('floor');
  const restaurantId = useAdminRestaurantScopeId();
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorHallCreate);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      {isRefreshing ? <LinearProgress /> : null}
      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between">
          <Box>
            <Typography variant="h6">{t('pages.halls.title')}</Typography>
            {selectedZone ? (
              <Typography variant="body2" color="text.secondary">
                {selectedZone.name}
              </Typography>
            ) : null}
          </Box>
          <Button
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled || !selectedZone}
            onClick={onCreateHall}>
            {t('actions.createHall')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {!selectedZone ? (
          <EmptyContent filled title={t('labels.notSelected')} description={t('empty.zones.noData.description')} />
        ) : isLoading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={190} />
            ))}
          </Box>
        ) : halls.length ? (
          <SortableGrid
            items={halls}
            gridTemplateColumns={{
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            }}
            gap={2}
            dragLabel={t('labels.dragToReorder')}
            disabled={isReordering || !restaurantId}
            onReorder={onReorder}
            renderItem={(hall) => <FloorHallCard hall={hall} onEdit={onEditHall} />}
          />
        ) : (
          <EmptyContent
            filled
            title={t('empty.halls.noData.title')}
            description={t('empty.halls.noData.description')}
            action={
              <Button
                variant="contained"
                color="black"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={isCreateDisabled}
                onClick={onCreateHall}
                sx={{ mt: 3 }}>
                {t('actions.createHall')}
              </Button>
            }
          />
        )}
      </Box>
    </Card>
  );
}
