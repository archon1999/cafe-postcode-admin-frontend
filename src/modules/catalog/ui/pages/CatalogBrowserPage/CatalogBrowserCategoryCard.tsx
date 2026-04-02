import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { CatalogCategory } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

type CatalogBrowserCategoryCardProps = {
  category: CatalogCategory;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
};

export function CatalogBrowserCategoryCard({
  category,
  isSelected,
  onSelect,
}: CatalogBrowserCategoryCardProps) {
  const [isImageBroken, setIsImageBroken] = useState(false);
  const hasImage = Boolean(category.imageUrl) && !isImageBroken;

  return (
    <ButtonBase
      onClick={() => onSelect(category.id)}
      sx={{
        position: 'relative',
        width: 1,
        minHeight: 208,
        px: 2,
        py: 2.5,
        borderRadius: 0,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        boxShadow: isSelected ? (theme) => `0 0 0 1px ${theme.vars.palette.primary.main}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        opacity: category.isActive ? 1 : 0.72,
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color', 'transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}>
      {isSelected ? (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}>
          <Iconify icon="solar:check-circle-bold" width={16} />
        </Box>
      ) : null}

      <Box
        sx={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          bgcolor: hasImage ? 'grey.100' : 'background.neutral',
        }}>
        {hasImage ? (
          <Box
            component="img"
            src={category.imageUrl ?? undefined}
            alt={category.name}
            onError={() => setIsImageBroken(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover' }}
          />
        ) : (
          <Iconify icon="solar:gallery-wide-bold-duotone" width={34} sx={{ color: 'text.secondary' }} />
        )}
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        }}>
        {category.name}
      </Typography>
    </ButtonBase>
  );
}
