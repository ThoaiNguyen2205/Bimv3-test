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
import { IContract } from 'src/shared/types/contract';

// ----------------------------------------------------------------------

interface Props {
  handleGroupsDialog: (show: boolean) => void;
  handleInvitationsDialog: (show: boolean) => void;
  countUclasses: () => void;
  contract: IContract | null;
}

export default function TopHeader({
  handleGroupsDialog,
  handleInvitationsDialog,
  countUclasses,
  contract,
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
          startIcon={<Iconify icon="el:group-alt" />}
          onClick={() => handleGroupsDialog(true)}
        >
          {`${translate('nav.groups')}`}
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon="bi:send-check-fill" />}
          onClick={() => handleInvitationsDialog(true)}
        >
          {`${translate('invitations.invitations')}`}
        </Button>
      </Stack>
      
      <Typography color='primary' variant='subtitle2'>
        {`${translate('common.total')}: ${countUclasses()}/${contract?.users} ${translate('common.user')}`}
      </Typography>
    </Stack>
  );
}
