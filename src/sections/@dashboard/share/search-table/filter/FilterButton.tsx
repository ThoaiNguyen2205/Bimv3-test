// @mui
import { Button, ButtonProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends ButtonProps {
  children?: React.ReactNode;
}

export default function FilterButton({
  children,

  ...other
}: Props) {
  return (
    <Button variant="contained" color="inherit" {...other}>
      {children}
    </Button>
  );
}
