import Box from '@mui/material/Box';
import { useEffect, useMemo, useState } from 'react';
import { useMatch } from 'react-router';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { AdminHall } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';

import {
  useGetFloorHallsQuery,
  useGetZonesQuery,
  useReorderHallsMutation,
  useReorderZonesMutation,
} from '../../../application';
import { HallDialog } from '../../components/HallDialog/HallDialog';
import { ZoneDialog } from '../../components/ZoneDialog/ZoneDialog';

import { FloorHallsPanel } from './FloorHallsPanel';
import { FloorZonesPanel } from './FloorZonesPanel';

const HallsListPage = () => {
  const { push, replace } = useRouter();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const hallCreateMatch = useMatch(RoutePath.floorHallCreate);
  const hallEditMatch = useMatch(RoutePath.floorHallEdit);
  const zoneCreateMatch = useMatch(RoutePath.floorZoneCreate);
  const zoneEditMatch = useMatch(RoutePath.floorZoneEdit);

  const zonesQuery = useGetZonesQuery();
  const hallsQuery = useGetFloorHallsQuery();
  const reorderZonesMutation = useReorderZonesMutation();
  const reorderHallsMutation = useReorderHallsMutation();

  const zones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);
  const allHalls = useMemo(() => hallsQuery.data ?? [], [hallsQuery.data]);

  useEffect(() => {
    if (!zones.length) {
      setSelectedZoneId(null);
      return;
    }
    if (selectedZoneId && zones.some((zone) => zone.id === selectedZoneId)) return;
    setSelectedZoneId((zones.find((zone) => zone.isActive) ?? zones[0]).id);
  }, [selectedZoneId, zones]);

  const selectedZone = useMemo(() => zones.find((zone) => zone.id === selectedZoneId) ?? null, [selectedZoneId, zones]);
  const halls = useMemo(
    () => allHalls.filter((hall) => hall.zoneOrCabinId === selectedZoneId),
    [allHalls, selectedZoneId],
  );
  const hallCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allHalls.forEach((hall) => counts.set(hall.zoneOrCabinId, (counts.get(hall.zoneOrCabinId) ?? 0) + 1));
    return counts;
  }, [allHalls]);

  const closeDialog = () => replace(RoutePath.floorHallList);
  const activeHallId = hallEditMatch?.params.id ?? null;
  const activeZoneId = zoneEditMatch?.params.id ?? null;

  return (
    <ListPageContent>
      <ListPageBody>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(320px, 5fr) minmax(0, 8fr)' },
            gap: 3,
            flex: 1,
            minHeight: 0,
          }}>
          <FloorZonesPanel
            zones={zones}
            hallCounts={hallCounts}
            selectedZoneId={selectedZoneId}
            isLoading={zonesQuery.isLoading && !zones.length}
            isReordering={reorderZonesMutation.isPending}
            onSelectZone={setSelectedZoneId}
            onCreateZone={() => push(RoutePath.floorZoneCreate)}
            onEditZone={() => {
              if (selectedZoneId) push(RouterPathHelper.floorZoneEdit(selectedZoneId));
            }}
            onReorder={(nextZones) =>
              reorderZonesMutation.mutateAsync(nextZones.map((zone, sortOrder) => ({ id: zone.id, sortOrder })))
            }
          />

          <FloorHallsPanel
            selectedZone={selectedZone}
            halls={halls}
            isLoading={hallsQuery.isLoading && !allHalls.length}
            isRefreshing={hallsQuery.isFetching && !hallsQuery.isLoading}
            isReordering={reorderHallsMutation.isPending}
            onCreateHall={() => push(RoutePath.floorHallCreate)}
            onEditHall={(hall: AdminHall) => push(RouterPathHelper.floorHallEdit(hall.id))}
            onReorder={(nextHalls) =>
              reorderHallsMutation.mutateAsync(nextHalls.map((hall, sortOrder) => ({ id: hall.id, sortOrder })))
            }
          />
        </Box>
      </ListPageBody>

      <HallDialog
        open={Boolean(hallCreateMatch || hallEditMatch)}
        hallId={activeHallId}
        defaultZoneId={selectedZoneId}
        onClose={closeDialog}
        onSaved={(hall) => setSelectedZoneId(hall.zoneOrCabinId)}
        onDeleted={closeDialog}
      />
      <ZoneDialog
        open={Boolean(zoneCreateMatch || zoneEditMatch)}
        zoneId={activeZoneId}
        onClose={closeDialog}
        onSaved={(zone) => setSelectedZoneId(zone.id)}
        onDeleted={() => {
          setSelectedZoneId(null);
          closeDialog();
        }}
      />
    </ListPageContent>
  );
};

export default HallsListPage;
