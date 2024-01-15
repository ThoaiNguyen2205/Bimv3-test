// @mui
import {
  Stack,
  Button,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

interface Props {
  handleNewTask: VoidFunction;
}

export default function TopHeader({
  handleNewTask,
}: Props) {

  const { translate } = useLocales();

  return (
    
    <Stack
      spacing={1}
      direction='row'
      alignItems={{ xs: 'flex-end', md: 'right' }}
      sx={{ mt: 1, mb: 1 }}
    >
      <Button
        variant="contained"
        startIcon={<Iconify icon="fluent:book-add-20-regular" />}
        onClick={handleNewTask}
      >
        {`${translate('common.add')}`}
      </Button>
    </Stack>

  );
}
