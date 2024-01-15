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
  handleNewProjectDialog: (show: boolean) => void;
  countUclasses: () => void;
}

export default function TopHeader({
  handleNewProjectDialog,
  countUclasses,
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
          startIcon={<Iconify icon="material-symbols:add-chart-outline" />}
          onClick={() => handleNewProjectDialog(true)}
        >
          {`${translate('common.add')}`}
        </Button>
      </Stack>
      
      <Typography color='primary' variant='subtitle2'>
        {`${translate('common.total')}: ${countUclasses()} ${translate('nav.project')}`}
      </Typography>
    </Stack>
  );
}
