import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { Theme, SxProps } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import { Trans } from 'react-i18next';

import { useTranslate } from 'app/providers/locales';

type SearchNotFoundProps = BoxProps & {
  query?: string;
  sx?: SxProps<Theme>;
  slotProps?: {
    title?: TypographyProps;
    description?: TypographyProps;
  };
};

export function SearchNotFound({ query, sx, slotProps, ...other }: SearchNotFoundProps) {
  const { t } = useTranslate('common');
  const descriptionSlotProps = slotProps?.description;
  const descriptionSx = Array.isArray(descriptionSlotProps?.sx)
    ? descriptionSlotProps?.sx
    : descriptionSlotProps?.sx
      ? [descriptionSlotProps.sx]
      : [];

  if (!query) {
    return (
      <Typography variant="body2" {...descriptionSlotProps}>
        {t('search.enterKeywords')}
      </Typography>
    );
  }

  return (
    <Box
      sx={[
        {
          gap: 1,
          display: 'flex',
          borderRadius: 1.5,
          textAlign: 'center',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}>
      <Typography
        variant="h6"
        {...slotProps?.title}
        sx={[
          { color: 'text.primary' },
          ...(Array.isArray(slotProps?.title?.sx) ? slotProps.title.sx : [slotProps?.title?.sx]),
        ]}>
        {t('search.title')}
      </Typography>

      <Typography variant="body2" {...descriptionSlotProps} sx={descriptionSx.length ? descriptionSx : undefined}>
        <Trans ns="common" i18nKey="search.results" values={{ query }} components={{ strong: <strong /> }} />
        <br />
        {t('search.suggestion')}
      </Typography>
    </Box>
  );
}
