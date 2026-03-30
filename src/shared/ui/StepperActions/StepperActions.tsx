import type { ButtonProps, StackProps, SxProps, Theme } from '@mui/material';
import { Button, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { Iconify } from '../Iconify';

export const secondaryActionButtonSx: SxProps<Theme> = {
  bgcolor: 'grey.200',
  color: 'text.primary',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'grey.300', boxShadow: 'none' },
  '&:disabled': { bgcolor: 'grey.100', color: 'text.disabled' },
};

type StepperActionsProps = {
  cancelLabel: string;
  saveExitLabel: string;
  backLabel: string;
  nextLabel: string;
  onCancel: () => void;
  onSaveExit: () => void;
  onBack: () => void;
  onNext: () => void;
  isCancelDisabled?: boolean;
  isSaveExitDisabled?: boolean;
  isBackDisabled?: boolean;
  isNextDisabled?: boolean;
  backIcon?: ReactNode;
  nextIcon?: ReactNode;
  containerProps?: StackProps;
  actionsWrapperProps?: StackProps;
  cancelButtonProps?: ButtonProps;
  saveExitButtonProps?: ButtonProps;
  backButtonProps?: ButtonProps;
  nextButtonProps?: ButtonProps;
};

const mergeSx = (
  base: SxProps<Theme> | undefined,
  override: SxProps<Theme> | undefined,
): SxProps<Theme> | undefined => {
  if (!base && !override) {
    return undefined;
  }

  const normalizedBase = Array.isArray(base) ? base : base ? [base] : [];
  const normalizedOverride = Array.isArray(override) ? override : override ? [override] : [];

  const merged = [...normalizedBase, ...normalizedOverride];

  if (merged.length === 1) {
    return merged[0];
  }

  return merged;
};

export const StepperActions = ({
  cancelLabel,
  saveExitLabel,
  backLabel,
  nextLabel,
  onCancel,
  onSaveExit,
  onBack,
  onNext,
  isCancelDisabled,
  isSaveExitDisabled,
  isBackDisabled,
  isNextDisabled,
  containerProps,
  actionsWrapperProps,
  cancelButtonProps,
  saveExitButtonProps,
  backButtonProps,
  nextButtonProps,
}: StepperActionsProps) => {
  const defaultContainerProps: StackProps = {
    direction: { xs: 'column', md: 'row' },
    spacing: 2,
    alignItems: { xs: 'stretch', md: 'center' },
    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
  };

  const defaultActionsWrapperProps: StackProps = {
    direction: { xs: 'column', sm: 'row' },
    spacing: 1.5,
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
    flexWrap: 'wrap',
  };

  const mergedContainerProps: StackProps = { ...defaultContainerProps, ...containerProps };
  const mergedActionsWrapperProps: StackProps = { ...defaultActionsWrapperProps, ...actionsWrapperProps };

  return (
    <Stack {...mergedContainerProps}>
      <Stack {...mergedActionsWrapperProps}>
        <Button
          variant="contained"
          color="inherit"
          onClick={onCancel}
          disabled={isCancelDisabled}
          sx={mergeSx(secondaryActionButtonSx, cancelButtonProps?.sx)}
          {...cancelButtonProps}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color="inherit"
          onClick={onSaveExit}
          disabled={isSaveExitDisabled}
          sx={mergeSx(secondaryActionButtonSx, saveExitButtonProps?.sx)}
          {...saveExitButtonProps}>
          {saveExitLabel}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onBack}
          disabled={isBackDisabled}
          startIcon={<Iconify icon={'material-symbols-light:arrow-back-ios'} width={15} />}
          {...backButtonProps}>
          {backLabel}
        </Button>
        <Button
          variant="contained"
          color="black"
          onClick={onNext}
          disabled={isNextDisabled}
          endIcon={<Iconify icon={'material-symbols:arrow-forward-ios'} width={15} />}
          {...nextButtonProps}>
          {nextLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
