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
import { IBimnextApp } from 'src/shared/types/bimnextApp';
// ----------------------------------------------------------------------

type Props = {
  app: IBimnextApp;
  onDelete: (id: string) => void;
};

export default function AppItem({ app, onDelete }: Props) {
  const { translate } = useLocales();

  return (
    <>
    <Paper variant='outlined' sx={{ p: 1, m: 2 }}>
      <ListItem disableGutters>
        <ListItemText
          primary={app.AppIMEI}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          style={{ color: '#00AB55' }}
          sx={{ flexGrow: 1, pr: 1 }}
        />

        <Button
          size="small"
          color="error"
          startIcon={<Iconify icon='mdi:remove-circle-outline' />}
          onClick={() => onDelete(app._id)}
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
