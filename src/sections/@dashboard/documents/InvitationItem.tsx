// @mui
import {
  Button,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  Typography
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';
import Label from '../../../components/label';
// locales
import { useLocales } from '../../../locales';
// type
import { IDocInvitation } from '../../../shared/types/docInvitation';
// assets
import { EmailInboxIcon } from '../../../assets/icons';
// ----------------------------------------------------------------------

type Props = {
  invitation: IDocInvitation;
  onDelete: (id: string) => void;
};

export default function InvitationItem({ invitation, onDelete }: Props) {
  const { translate } = useLocales();
  const isDesktop = useResponsive('up', 'lg');

  return (
    <>
      <ListItem className="invitations__item" disableGutters>
        <ListItemAvatar className="invitations__item-avatar">
          <EmailInboxIcon className="avatar_icon" />
        </ListItemAvatar>

        <ListItemText className="invitations__item-text">
          <Stack className="item-text">
            <Typography variant="subtitle2" className="item-text__email">
              {`${translate('common.to')}: ${invitation.toEmail}`}
            </Typography>

            <Stack className="item-text__settings">
              {invitation.isComment === true ? (
                <Label
                  className="item-text__settings-label"
                  variant="soft"
                  color="primary">
                  {`${translate('documents.can_comment')}`}
                </Label>
              ) : null}
              {invitation.isEdit === true ? (
                <Label
                  className="item-text__settings-label"
                  variant="soft"
                  color="warning">
                  {`${translate('documents.can_edit')}`}
                </Label>
              ) : null}
            </Stack>
          </Stack>
        </ListItemText>

        <Button
          className="invitations__item-button"
          size="small"
          color="error"
          onClick={() => onDelete(invitation._id)}>
          <Iconify className="button-icon" icon="mdi:remove-circle-outline" />
          {isDesktop ? `${translate('common.delete')}` : null}
        </Button>
      </ListItem>
    </>
  );
}
