// @mui
import {
  Button,
  ListItem,
  ListItemText,
  ListItemAvatar,
  MenuItem,
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// type
import { IInvitation } from "src/shared/types/invitation";
// assets
import { EmailInboxIcon } from 'src/assets/icons';
// ----------------------------------------------------------------------

type Props = {
  invitation: IInvitation;
  onDelete: (id: string) => void;
};

export default function InvitationItem({ invitation, onDelete }: Props) {
  const { translate } = useLocales();
  const isDesktop = useResponsive('up', 'lg');
  
  return (
    <>
      <ListItem
        disableGutters
        sx={{
          flexGrow: 1,
          pr: 1,
          pb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: '#00ab5526',
          px: 1,
          mb: 1,
        }}
      >
        <ListItemAvatar>
          <EmailInboxIcon sx={{ mb: 0, height: 62 }} />
        </ListItemAvatar>

        <ListItemText
          primary={`${translate('common.to')}: ${invitation.toEmail}`}
          secondary={`${translate('common.from')}: ${invitation.fromEmail}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
        />
        
        <Button
          size="small"
          color="error"
          onClick={() => onDelete(invitation._id)}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
          }}
        >
          <Iconify icon='mdi:remove-circle-outline' />
          {isDesktop ? `${translate('common.delete')}` : null}
        </Button>


      </ListItem>

    </>
  );
}
