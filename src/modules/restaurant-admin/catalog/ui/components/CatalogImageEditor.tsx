import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFormContext, type FieldValues, type Path, type PathValue } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { CatalogImageSource } from 'shared/api/admin-types';
import { RHFUpload } from 'shared/ui/HookForm';
import { ImageCropDialog } from 'shared/ui/ImageCropDialog';
import type { FileUploadType } from 'shared/ui/Upload';

type CatalogImageEditorProps<TForm extends FieldValues> = {
  imageName: Path<TForm>;
  imageSourceName: Path<TForm>;
  mxikImageUrl?: string | null;
  disabled?: boolean;
  onClearImage: () => void;
  onRestoreMxikImage: () => void;
};

export function CatalogImageEditor<TForm extends FieldValues>({
  imageName,
  imageSourceName,
  mxikImageUrl,
  disabled = false,
  onClearImage,
  onRestoreMxikImage,
}: CatalogImageEditorProps<TForm>) {
  const { t } = useTranslate('catalog');
  const { watch, setValue } = useFormContext<TForm>();
  const [cropOpen, setCropOpen] = useState(false);

  const imageValue = watch(imageName) as FileUploadType | undefined;
  const imageSource = (watch(imageSourceName) as CatalogImageSource | '' | null | undefined) ?? '';
  const hasImage = Boolean(imageValue);
  const cropFile = imageValue instanceof File && imageValue.type.startsWith('image/') ? imageValue : null;
  const canRestoreMxikImage = Boolean(mxikImageUrl) && imageSource !== 'mxik-cache';
  const imageSourceLabel =
    imageSource === 'manual'
      ? t('labels.manualImageSource')
      : imageSource === 'mxik-cache'
        ? t('labels.mxikImageSource')
        : null;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="subtitle1">{t('fields.image')}</Typography>
        {imageSourceLabel ? (
          <Chip
            size="small"
            variant="soft"
            color={imageSource === 'manual' ? 'success' : 'info'}
            label={imageSourceLabel}
          />
        ) : null}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {mxikImageUrl ? t('labels.catalogImageDescription') : t('labels.catalogImageUnavailable')}
      </Typography>

      <RHFUpload<TForm>
        name={imageName}
        disabled={disabled}
        helperText={!mxikImageUrl && !hasImage ? t('labels.catalogImageUnavailable') : undefined}
        onDelete={onClearImage}
      />

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {hasImage ? (
          <>
            {cropFile ? (
              <Button variant="outlined" onClick={() => setCropOpen(true)} disabled={disabled}>
                {t('actions.cropImage', { defaultValue: 'Rasmni kesish' })}
              </Button>
            ) : null}
            <Button variant="outlined" color="inherit" onClick={onClearImage} disabled={disabled}>
              {t('actions.removeImage')}
            </Button>
          </>
        ) : null}

        {canRestoreMxikImage ? (
          <Button variant="outlined" onClick={onRestoreMxikImage} disabled={disabled}>
            {t('actions.restoreMxikImage')}
          </Button>
        ) : null}
      </Stack>

      <ImageCropDialog
        open={cropOpen}
        file={cropFile}
        onClose={() => setCropOpen(false)}
        onApply={(file) =>
          setValue(imageName, file as PathValue<TForm, Path<TForm>>, { shouldDirty: true, shouldValidate: true })
        }
      />
    </Stack>
  );
}
