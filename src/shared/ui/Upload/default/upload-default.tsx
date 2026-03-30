import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import { mergeClasses } from 'minimal-shared/utils';
import { useDropzone } from 'react-dropzone';
import { Trans } from 'react-i18next';

import { useTranslate } from 'app/providers/locales';
import { UploadIllustration } from 'shared/assets/illustrations';

import { Iconify } from '../../Iconify';
import { uploadClasses } from '../classes';
import { MultiFilePreview } from '../components/multi-file-preview';
import { RejectedFiles } from '../components/rejected-files';
import { SingleFilePreview } from '../components/single-file-preview';
import type { UploadProps } from '../types';

import { UploadArea, DeleteButton, UploadWrapper, PlaceholderContainer } from './styles';

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  className,
  helperText,
  onRemoveAll,
  slotProps,
  loading = false,
  multiple = false,
  hideFilesRejected = false,
  previewOrientation = 'horizontal',
  ...dropzoneOptions
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    ...dropzoneOptions,
  });

  const { t } = useTranslate('common');

  const isSingleFileSelected = !multiple && !!value && !Array.isArray(value);
  const hasMultiFilesSelected = multiple && Array.isArray(value) && value.length > 0;
  const hasError = isDragReject || !!error;
  const showFilesRejected = !hideFilesRejected && fileRejections.length > 0;

  const placeholderTitle = multiple ? t('upload.placeholder.titleMultiple') : t('upload.placeholder.titleSingle');
  const placeholderDescriptionKey = multiple
    ? 'upload.placeholder.descriptionMultiple'
    : 'upload.placeholder.descriptionSingle';

  const renderPlaceholder = () => (
    <PlaceholderContainer className={uploadClasses.placeholder.root}>
      <UploadIllustration hideBackground sx={{ width: 200 }} />
      <div className={uploadClasses.placeholder.content}>
        <div className={uploadClasses.placeholder.title}>{placeholderTitle}</div>
        <div className={uploadClasses.placeholder.description}>
          <Trans ns="common" i18nKey={placeholderDescriptionKey} components={{ span: <span /> }} />
        </div>
      </div>
    </PlaceholderContainer>
  );

  const renderSingleFileLoading = () =>
    loading &&
    !multiple && (
      <CircularProgress size={26} color="primary" sx={{ zIndex: 9, right: 16, bottom: 16, position: 'absolute' }} />
    );

  const renderSingleFilePreview = () => isSingleFileSelected && <SingleFilePreview file={value} />;

  const renderMultiFilesPreview = () =>
    hasMultiFilesSelected && (
      <>
        <Box sx={{ my: 3 }}>
          <MultiFilePreview
            files={value}
            onRemove={onRemove}
            orientation={previewOrientation}
            {...slotProps?.multiPreview}
          />
        </Box>

        {(onRemoveAll || onUpload) && (
          <Box sx={{ gap: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            {onRemoveAll && (
              <Button size="small" variant="outlined" color="inherit" onClick={onRemoveAll}>
                {t('upload.actions.removeAll')}
              </Button>
            )}
            {onUpload && (
              <Button
                size="small"
                variant="contained"
                onClick={onUpload}
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                loading={loading && multiple}
                loadingPosition="start">
                {loading && multiple ? t('upload.actions.uploading') : t('upload.actions.upload')}
              </Button>
            )}
          </Box>
        )}
      </>
    );

  return (
    <UploadWrapper {...slotProps?.wrapper} className={uploadClasses.wrapper}>
      <UploadArea
        {...getRootProps()}
        className={mergeClasses([uploadClasses.default, className], {
          [uploadClasses.state.dragActive]: isDragActive,
          [uploadClasses.state.disabled]: disabled,
          [uploadClasses.state.error]: hasError,
        })}
        sx={sx}>
        <input {...getInputProps()} />
        {isSingleFileSelected ? renderSingleFilePreview() : renderPlaceholder()}
      </UploadArea>

      {isSingleFileSelected && (
        <DeleteButton size="small" onClick={onDelete}>
          <Iconify icon="mingcute:close-line" width={16} />
        </DeleteButton>
      )}

      {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      {showFilesRejected && <RejectedFiles files={fileRejections} {...slotProps?.rejectedFiles} />}

      {renderSingleFileLoading()}
      {renderMultiFilesPreview()}
    </UploadWrapper>
  );
}
