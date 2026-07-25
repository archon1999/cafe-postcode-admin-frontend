import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { ConfirmDialog } from 'shared/ui/CustomDialog';

type EntityFormActionsProps = {
  isDialog: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  submitLabel: string;
  deleteTitle: string;
  deleteContent: string;
  onCancel?: () => void;
  onDelete: () => Promise<void>;
};

export function EntityFormActions({
  isDialog,
  isEditMode,
  isSubmitting,
  isDeleting,
  submitLabel,
  deleteTitle,
  deleteContent,
  onCancel,
  onDelete,
}: EntityFormActionsProps) {
  const { t } = useTranslate('common');
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isBusy = isSubmitting || isDeleting;

  const buttons = (
    <>
      {isEditMode ? (
        <Button
          type="button"
          color="error"
          variant="outlined"
          disabled={isBusy}
          onClick={() => setDeleteConfirmOpen(true)}>
          {t('actions.delete')}
        </Button>
      ) : null}

      <Box sx={{ flexGrow: 1 }} />

      <Button type="button" color="inherit" variant="outlined" onClick={onCancel} disabled={isBusy}>
        {t('actions.cancel')}
      </Button>
      <Button type="submit" variant="contained" color="black" loading={isSubmitting} disabled={isDeleting}>
        {submitLabel}
      </Button>
    </>
  );

  return (
    <>
      {isDialog ? (
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>{buttons}</DialogActions>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
          {buttons}
        </Stack>
      )}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={deleteTitle}
        content={deleteContent}
        action={
          <Button
            type="button"
            color="error"
            variant="contained"
            loading={isDeleting}
            onClick={async () => {
              await onDelete();
              setDeleteConfirmOpen(false);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );
}
