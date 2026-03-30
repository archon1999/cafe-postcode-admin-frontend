import { Button, Stack, type StackProps } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

export interface FormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
  submitLabel: string;
  disableSubmit?: boolean;
  stackProps?: StackProps;
  cancelTestId?: string;
  submitTestId?: string;
}

export const FormActions = ({
  isSubmitting,
  onCancel,
  submitLabel,
  disableSubmit = false,
  stackProps,
  cancelTestId,
  submitTestId,
}: FormActionsProps) => {
  const { t } = useTranslate('common');
  const { sx, ...restStackProps } = stackProps ?? {};
  const stackSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={[{ mt: 3 }, ...stackSx]} {...restStackProps}>
      <Button
        onClick={onCancel}
        disabled={isSubmitting}
        variant="outlined"
        color="inherit"
        type="button"
        data-testid={cancelTestId}
        sx={{ minWidth: 120 }}>
        {t('actions.cancel')}
      </Button>
      <Button
        loading={isSubmitting}
        disabled={isSubmitting || disableSubmit}
        variant="contained"
        color="black"
        type="submit"
        data-testid={submitTestId}
        sx={{ minWidth: 120 }}>
        {submitLabel}
      </Button>
    </Stack>
  );
};
