import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { Theme, SxProps } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import { CONFIG } from 'app/config/globalConfig.ts';
import { useTranslate } from 'app/providers/locales';

export type EmptyContentProps = React.ComponentProps<'div'> & {
  title?: string;
  imgUrl?: string;
  filled?: boolean;
  sx?: SxProps<Theme>;
  description?: string;
  action?: React.ReactNode;
  slotProps?: {
    img?: BoxProps<'img'>;
    title?: TypographyProps;
    description?: TypographyProps;
  };
};

export function EmptyContent({
  sx,
  imgUrl,
  action,
  filled,
  slotProps,
  description,
  title,
  ...other
}: EmptyContentProps) {
  const { t } = useTranslate('common');

  const imgSlotProps = slotProps?.img;
  const titleSlotProps = slotProps?.title;
  const descriptionSlotProps = slotProps?.description;

  const titleContent = title ?? t('empty.noData');
  const imageSx = Array.isArray(imgSlotProps?.sx) ? imgSlotProps?.sx : imgSlotProps?.sx ? [imgSlotProps.sx] : [];
  const titleSx = Array.isArray(titleSlotProps?.sx)
    ? titleSlotProps?.sx
    : titleSlotProps?.sx
      ? [titleSlotProps.sx]
      : [];
  const descriptionSx = Array.isArray(descriptionSlotProps?.sx)
    ? descriptionSlotProps?.sx
    : descriptionSlotProps?.sx
      ? [descriptionSlotProps.sx]
      : [];

  return (
    <ContentRoot filled={filled} sx={sx} {...other}>
      <Box
        component="img"
        src={imgUrl ?? `${CONFIG.assetsDir}/assets/icons/empty/ic-content.svg`}
        {...imgSlotProps}
        alt={imgSlotProps?.alt ?? t('empty.imageAlt')}
        sx={[
          {
            width: 1,
            maxWidth: 130,
          },
          ...imageSx,
        ]}
      />

      {titleContent && (
        <Typography
          variant="body1"
          {...titleSlotProps}
          sx={[
            {
              textAlign: 'center',
              color: 'text.disabled',
            },
            ...titleSx,
          ]}>
          {titleContent}
        </Typography>
      )}

      {description && (
        <Typography
          variant="body2"
          {...descriptionSlotProps}
          sx={[
            {
              mt: 1,
              textAlign: 'center',
              color: 'text.disabled',
            },
            ...descriptionSx,
          ]}>
          {description}
        </Typography>
      )}

      {action && action}
    </ContentRoot>
  );
}

const ContentRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['filled', 'sx'].includes(prop),
})<Pick<EmptyContentProps, 'filled'>>(({ filled, theme }) => ({
  flexGrow: 1,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(0, 3),
  ...(filled && {
    borderRadius: Number(theme.shape.borderRadius) * 2,
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
    border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
  }),
}));
