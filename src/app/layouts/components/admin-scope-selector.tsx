import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'app/providers/locales';
import { useAdminScopeStore, useCurrentUser } from 'modules/auth';
import { useGetRestaurantsQuery } from 'modules/business-partner/restaurants/application';
import { queryClient } from 'shared/api';

export function AdminScopeSelector() {
  const { t } = useTranslate('common');
  const { profile } = useCurrentUser();
  const isSuperuser = Boolean(profile?.isSuperuser);

  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useAdminScopeStore((state) => state.setSelectedRestaurantId);

  const restaurantsQuery = useGetRestaurantsQuery({ enabled: isSuperuser });
  const isLoading = restaurantsQuery.isLoading;

  if (!isSuperuser) {
    return null;
  }

  return (
    <TextField
      select
      size="small"
      label={t('scope.restaurant', { defaultValue: 'Restoran' })}
      value={selectedRestaurantId ?? ''}
      onChange={(event) => {
        const nextRestaurantId = event.target.value || null;
        setSelectedRestaurantId(nextRestaurantId);
        void queryClient.invalidateQueries();
      }}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        minWidth: { sm: 240, lg: 320 },
      }}
      slotProps={{
        input: {
          endAdornment: isLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null,
        },
      }}>
      <MenuItem value="">{t('scope.allRestaurants', { defaultValue: 'Barcha restoranlar' })}</MenuItem>
      {(restaurantsQuery.data ?? []).map((restaurant) => (
        <MenuItem key={restaurant.id} value={restaurant.id}>
          {restaurant.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
