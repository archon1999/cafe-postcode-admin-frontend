import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';

export const Button: React.FC<MuiButtonProps> = ({ children, ...props }) => {
  return <MuiButton {...props}>{children}</MuiButton>;
};
