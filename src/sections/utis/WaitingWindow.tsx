// @mui
import { styled, SxProps, Theme } from '@mui/material/styles';
import { Typography, Portal } from '@mui/material';
// components
import Iconify from 'src/components/iconify/Iconify';
// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  right: 24,
  zIndex: 9,
  bottom: 40,
  display: 'flex',
  position: 'fixed',
  alignItems: 'center',
  boxShadow: theme.customShadows.z20,
  padding: theme.spacing(1.5, 1, 1.5, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.text.primary,
  color: 'white',
}));

// ----------------------------------------------------------------------

type Props = {
  title: string;
  sx?: SxProps<Theme>;
};

export default function WaitingWindow({
  title,
  sx,
  ...other
}: Props) {
  return (
    <Portal>
      <StyledRoot sx={sx} {...other}>
        <Typography variant='caption' sx={{ mr: 2 }}> {title} </Typography>
        <Iconify icon="eos-icons:loading" color={'primary'} sx={{ mr: 1 }}/>
      </StyledRoot>
    </Portal>
  );
}
