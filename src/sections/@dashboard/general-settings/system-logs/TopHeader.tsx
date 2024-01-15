// @mui
import {
  Stack,
  Button,
  Typography,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

interface Props {
  handleInvitationsDialog: (show: boolean) => void;
}

export default function TopHeader({
  handleInvitationsDialog,
}: Props) {

  const { translate } = useLocales();

  return (
    <Stack
      spacing={1}
      direction='column'
      alignItems={{ xs: 'flex-end', md: 'right' }}
      justifyContent="space-between"
      sx={{ mt: 1 }}
    >
      <Stack
        spacing={1}
        direction='row'
        alignItems={{ xs: 'flex-end', md: 'right' }}
        justifyContent="space-between"
        sx={{ mt: 1 }}
      >
        <Button
          variant="contained"
          startIcon={<Iconify icon="typcn:export" />}
          onClick={() => handleInvitationsDialog(true)}
        >
          {`${translate('common.exports')}`}
        </Button>
      </Stack>
      
    </Stack>
  );
}
