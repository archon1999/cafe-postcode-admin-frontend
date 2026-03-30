import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { mergeClasses, varAlpha } from 'minimal-shared/utils';

import { fData } from 'shared/utils/format-number';

import { FileThumbnail, getFileMeta, useFilePreview } from '../../FileThumbnail';
import { uploadClasses } from '../classes';
import type { FileUploadType } from '../types';

export type SingleFilePreviewProps = React.ComponentProps<typeof PreviewRoot> & {
  file: FileUploadType;
};

export function SingleFilePreview({ sx, file, className, ...other }: SingleFilePreviewProps) {
  const fileMeta = getFileMeta(file);
  const { previewUrl } = useFilePreview(file);
  const isImagePreview = fileMeta.format === 'image' && !!previewUrl;

  return (
    <PreviewRoot className={mergeClasses([uploadClasses.preview.single, className])} sx={sx} {...other}>
      {isImagePreview ? (
        <PreviewImage alt={fileMeta.name} src={previewUrl} />
      ) : (
        <PreviewCard>
          <FileThumbnail
            file={file}
            sx={(theme) => ({
              width: 72,
              height: 72,
              border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
              backgroundColor: theme.vars.palette.background.paper,
            })}
            slotProps={{
              icon: {
                sx: { width: 36, height: 36 },
              },
            }}
          />
          <Stack spacing={0.25} alignItems="center">
            <Typography variant="subtitle2" title={fileMeta.name} noWrap sx={{ maxWidth: 240 }}>
              {fileMeta.name || 'Uploaded file'}
            </Typography>
            {fileMeta.size ? (
              <Typography variant="caption" color="text.secondary">
                {fData(fileMeta.size)}
              </Typography>
            ) : null}
          </Stack>
        </PreviewCard>
      )}
    </PreviewRoot>
  );
}

const PreviewRoot = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  borderRadius: 'inherit',
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

const PreviewCard = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2, 3),
  borderRadius: 12,
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
  boxShadow: `0 12px 28px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.18)}`,
}));
