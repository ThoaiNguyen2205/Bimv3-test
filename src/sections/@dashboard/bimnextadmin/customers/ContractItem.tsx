// @mui
import {
  Button,
  Paper,
  ListItem,
  ListItemText,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// type
import { IContract } from 'src/shared/types/contract';
// utils
import { fDate } from 'src/utils/formatTime';
// ----------------------------------------------------------------------

type Props = {
  contract: IContract;
  onDelete: (id: string) => void;
  onEdit: (id: IContract) => void;
};

export default function ContractItem({ contract, onDelete, onEdit }: Props) {
  const { translate } = useLocales();

  return (
    <>
    <Paper variant='outlined' sx={{ p: 1, m: 2 }}>
      <ListItem disableGutters>
        <ListItemText
          primary={contract.contractCode}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          secondary={`${translate('contracts.expire')}: ${fDate(contract.expire)}`}
          style={{ color: '#00AB55' }}
          sx={{ flexGrow: 1, pr: 1 }}
        />

        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon='fluent:note-edit-24-regular' />}
          onClick={() => onEdit(contract)}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
          }}
        >
          {`${translate('common.modify')}`}
        </Button>

        <Button
          size="small"
          color="error"
          startIcon={<Iconify icon='mdi:remove-circle-outline' />}
          onClick={() => onDelete(contract._id)}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
          }}
        >
          {`${translate('common.delete')}`}
        </Button>
      </ListItem>
      </Paper>
    </>
  );
}
