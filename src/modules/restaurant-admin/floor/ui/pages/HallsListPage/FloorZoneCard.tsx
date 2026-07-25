import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { useShowAllBranches } from 'app/layouts/components/branch-scope-columns';
import type { AdminZoneOrCabin } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

type FloorZoneCardProps = {
  zone: AdminZoneOrCabin;
  hallCount: number;
  isSelected: boolean;
  onSelect: (zoneId: string) => void;
};

export function FloorZoneCard({ zone, hallCount, isSelected, onSelect }: FloorZoneCardProps) {
  const showBranchName = useShowAllBranches();

  return (
    <ButtonBase
      onClick={() => onSelect(zone.id)}
      sx={{
        position: 'relative',
        width: 1,
        minHeight: 152,
        px: 2,
        pt: 5,
        pb: 2.5,
        borderRadius: 0,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        boxShadow: isSelected ? (theme) => `0 0 0 1px ${theme.vars.palette.primary.main}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1.5,
        textAlign: 'center',
        opacity: zone.isActive ? 1 : 0.65,
        transition: (theme) => theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        '&:hover': { borderColor: 'text.primary' },
      }}>
      {isSelected ? (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 24,
            height: 24,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}>
          <Iconify icon="solar:check-circle-bold" width={16} />
        </Box>
      ) : null}

      <Iconify icon="solar:buildings-2-bold-duotone" width={38} sx={{ color: 'text.secondary' }} />
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
        {zone.name}
      </Typography>
      {showBranchName ? (
        <Typography variant="caption" color="text.secondary">
          {zone.restaurantName || '-'}
        </Typography>
      ) : null}
      <Typography variant="caption" color="text.secondary">
        {hallCount}
      </Typography>
    </ButtonBase>
  );
}
