// @mui
import { styled, SxProps, Theme } from '@mui/material/styles';
import { Typography, Portal } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import { useLocales } from 'src/locales';
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
  sx?: SxProps<Theme>;
};

export default function DownloadZip({
  sx,
  ...other
}: Props) {
  const { translate } = useLocales();
  return (
    <Portal>
      <StyledRoot sx={sx} {...other}>
        <Typography variant='caption' sx={{ mr: 2 }}> {`${translate('cloud.creating_zip_file')}`} </Typography>
        <Iconify icon="eos-icons:loading" color={'primary'} sx={{ mr: 1 }}/>
      </StyledRoot>
    </Portal>
  );
}
