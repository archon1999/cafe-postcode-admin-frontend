import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type MouseEvent } from 'react';

import type { AdminBusinessPartner } from 'shared/api/admin-types';

type BusinessPartnerClientsCellProps = {
  restaurants?: AdminBusinessPartner['restaurants'];
  restaurantsCount?: number;
};

const VISIBLE_CLIENTS_COUNT = 2;

export function BusinessPartnerClientsCell({ restaurants = [], restaurantsCount }: BusinessPartnerClientsCellProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const visibleRestaurants = restaurants.slice(0, VISIBLE_CLIENTS_COUNT);
  const hiddenRestaurants = restaurants.slice(VISIBLE_CLIENTS_COUNT);
  const hiddenCount =
    Math.max(restaurantsCount ?? restaurants.length, visibleRestaurants.length) - visibleRestaurants.length;

  if (!restaurants.length) {
    return <Typography variant="body2">-</Typography>;
  }

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
        {visibleRestaurants.map((restaurant) => (
          <Typography key={restaurant.id} variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {restaurant.name}
          </Typography>
        ))}
        {hiddenCount > 0 ? (
          <Chip size="small" label={`+${hiddenCount}`} onClick={handleOpenMenu} variant="soft" />
        ) : null}
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {hiddenRestaurants.map((restaurant) => (
          <MenuItem
            key={restaurant.id}
            onClick={(event) => {
              event.stopPropagation();
              handleCloseMenu();
            }}>
            {restaurant.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
