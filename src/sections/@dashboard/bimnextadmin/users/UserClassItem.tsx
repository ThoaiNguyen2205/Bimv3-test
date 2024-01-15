// @mui
import {
  Avatar,
  Button,
  Paper,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// type
import { IUclass } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import { ICustomer } from 'src/shared/types/customer';
// ----------------------------------------------------------------------

type Props = {
  uclass: IUclass;
  onDelete: (id: string) => void;
};

export default function UserClassItem({ uclass, onDelete }: Props) {
  const { translate } = useLocales();

  return (
    <>
      <Paper variant='outlined' sx={{ p: 1, m: 2 }}>
        <ListItem disableGutters>
          <ListItemAvatar>
            <Avatar alt={(uclass.user as IUser).username} src={process.env.REACT_APP_APIFILE + `/images/` + (uclass.customer as ICustomer).logo} />
          </ListItemAvatar>

          <ListItemText
            primary={(uclass.customer as ICustomer).shortName}
            secondary={uclass.uclass}
            primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
            secondaryTypographyProps={{ noWrap: true }}
            sx={{ flexGrow: 1, pr: 1 }}
          />

          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon='mdi:remove-circle-outline' />}
            onClick={() => onDelete(uclass._id)}
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
