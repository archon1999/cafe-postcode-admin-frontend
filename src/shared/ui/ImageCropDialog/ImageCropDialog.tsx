import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';

type ImageCropDialogProps = {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onApply: (file: File) => void;
};

const OUTPUT_SIZE = 1024;

async function cropImage(file: File, zoom: number, positionX: number, positionY: number) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = reject;
      nextImage.src = imageUrl;
    });
    const coverScale = Math.max(OUTPUT_SIZE / image.naturalWidth, OUTPUT_SIZE / image.naturalHeight) * zoom;
    const sourceWidth = OUTPUT_SIZE / coverScale;
    const sourceHeight = OUTPUT_SIZE / coverScale;
    const sourceX = Math.max(0, (image.naturalWidth - sourceWidth) * (positionX / 100));
    const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * (positionY / 100));
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Canvas is not available');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Image crop failed'))), outputType, 0.92),
    );

    return new File([blob], file.name, { type: outputType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function ImageCropDialog({ open, file, onClose, onApply }: ImageCropDialogProps) {
  const { t } = useTranslate('common');
  const [previewUrl, setPreviewUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return (
    <Dialog open={open} onClose={processing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('imageCrop.title', { defaultValue: 'Rasmni kesish va joylash' })}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box
            sx={{
              width: 'min(100%, 420px)',
              aspectRatio: '1 / 1',
              mx: 'auto',
              borderRadius: 2.5,
              overflow: 'hidden',
              bgcolor: 'background.neutral',
              border: 1,
              borderColor: 'divider',
            }}>
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt={t('imageCrop.previewAlt', { defaultValue: 'Kesilgan rasm namunasi' })}
                sx={{
                  width: 1,
                  height: 1,
                  objectFit: 'cover',
                  objectPosition: `${positionX}% ${positionY}%`,
                  transform: `scale(${zoom})`,
                  transition: 'transform 180ms ease',
                }}
              />
            ) : null}
          </Box>

          <Stack spacing={1}>
            <Typography variant="body2">{t('imageCrop.zoom', { defaultValue: 'Masshtab' })}</Typography>
            <Slider value={zoom} min={1} max={3} step={0.05} onChange={(_, value) => setZoom(value as number)} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">
                {t('imageCrop.horizontal', { defaultValue: 'Gorizontal joylashuv' })}
              </Typography>
              <Slider value={positionX} min={0} max={100} onChange={(_, value) => setPositionX(value as number)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{t('imageCrop.vertical', { defaultValue: 'Vertikal joylashuv' })}</Typography>
              <Slider value={positionY} min={0} max={100} onChange={(_, value) => setPositionY(value as number)} />
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={processing}>
          {t('actions.cancel', { defaultValue: 'Bekor qilish' })}
        </Button>
        <Button
          variant="contained"
          loading={processing}
          disabled={!file}
          onClick={async () => {
            if (!file) return;
            setProcessing(true);
            try {
              onApply(await cropImage(file, zoom, positionX, positionY));
              onClose();
            } finally {
              setProcessing(false);
            }
          }}>
          {t('imageCrop.apply', { defaultValue: "Kesishni qo'llash" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
