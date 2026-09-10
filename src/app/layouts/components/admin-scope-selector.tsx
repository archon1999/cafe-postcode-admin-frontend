import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useAdminScopeStore, useCurrentUser } from 'modules/auth';
import { useGetRestaurantsQuery } from 'modules/business-partner/restaurants/application';
import { queryClient } from 'shared/api';

type RestaurantOption = { id: string; name: string };

const filterRestaurants = createFilterOptions<RestaurantOption>({ ignoreCase: true, trim: true });

export function AdminScopeSelector() {
  const { t } = useTranslate('common');
  const { profile } = useCurrentUser();
  const isSuperuser = Boolean(profile?.isSuperuser);

  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const setSelectedRestaurantId = useAdminScopeStore((state) => state.setSelectedRestaurantId);

  const restaurantsQuery = useGetRestaurantsQuery({ enabled: isSuperuser });
  const isLoading = restaurantsQuery.isLoading;
  const options = useMemo(
    () => [{ id: '', name: t('scope.allRestaurants') }, ...(restaurantsQuery.data ?? [])],
    [restaurantsQuery.data, t],
  );

  if (!isSuperuser) {
    return null;
  }

  return (
    <Autocomplete
      size="small"
      options={options}
      value={options.find((option) => option.id === (selectedRestaurantId ?? '')) ?? null}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={filterRestaurants}
      loading={isLoading}
      autoHighlight
      onChange={(_event, option) => {
        const nextRestaurantId = option?.id || null;
        if (nextRestaurantId === selectedRestaurantId) return;
        setSelectedRestaurantId(nextRestaurantId);
        void queryClient.invalidateQueries();
      }}
      sx={{
        display: { xs: 'none', sm: 'flex' },
        width: { sm: 240, lg: 320 },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('scope.restaurant')}
          slotProps={{
            htmlInput: params.inputProps,
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
