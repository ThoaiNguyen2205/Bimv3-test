import { useRouter } from 'next/router';
import { useReducer, useEffect, useCallback } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Avatar, Box, Button, Card, CardHeader, Divider, Drawer, Grid, Stack, Typography, Tooltip, IconButton, DialogActions } from '@mui/material';
// utils
import { bgBlur } from 'src/utils/cssStyles';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import ToggleButton from './ToggleButton';
// api
import invitationsApi from 'src/api/invitationsApi';
// type
import { IInvitation, IInvitationResGetAll } from 'src/shared/types/invitation';
// authContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
import { ICustomer } from 'src/shared/types/customer';
// ----------------------------------------------------------------------

interface eventState {
  invitations: Array<IInvitation>;
  open: boolean;
}

// Action enums
export enum InvitationItemActions {
  setInvitations = 'setInvitations',
  setOpen = 'setOpen',
}

// Actions
type setInvitations = { type: InvitationItemActions.setInvitations, payload: Array<IInvitation> }
type setOpen = { type: InvitationItemActions.setOpen, payload: boolean }
type eventActions =
  setInvitations | 
  setOpen;

// Reducer
const eventReducer = (state: eventState, action: eventActions) => {
  switch (action.type) {
    case InvitationItemActions.setInvitations:
      return { ...state, invitations: action.payload };
    case InvitationItemActions.setOpen:
      return { ...state, open: action.payload };
    default:
      return state;
  }
}

// ----------------------------------------------------------------------

const SPACING = 2.5;

export default function InvitationsDrawer() {
  const theme = useTheme();
  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const router = useRouter();

  const [state, dispatch] = useReducer(eventReducer, {
    invitations: [],
    open: false,
  });

  const handleToggle = () => {
    dispatch({ type: InvitationItemActions.setOpen, payload: !state.open });
  };

  const handleClose = () => {
    dispatch({ type: InvitationItemActions.setOpen, payload: false });
  };
  
  const loadInvitations = useCallback(async () => {
    const params = { email: user?.email };
    const invitationsResponse: IInvitationResGetAll = await invitationsApi.getInvitations(params);
    const invitations: Array<IInvitation> = invitationsResponse.data;
    dispatch({ type: InvitationItemActions.setInvitations, payload: invitations });
  }, [user]);

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const onConfirm = async () => {
    const updateInvitation = await invitationsApi.patchComfirmById(state.invitations[0]._id);
    if (updateInvitation) {
      await refresh(user?.id);
      dispatch({ type: InvitationItemActions.setOpen, payload: false });
      loadInvitations();
    }
  }

  return (
    <>
      {(state.invitations.length > 0) ?
        <>
          {!state.open && <ToggleButton open={state.open} notDefault={true} onToggle={handleToggle} />}

          <Drawer
            anchor="right"
            open={state.open}
            onClose={handleClose}
            BackdropProps={{ invisible: true }}
            PaperProps={{
              sx: {
                ...bgBlur({ color: theme.palette.background.default, opacity: 0.9 }),
                width: '400px',
                height: '320px',
                boxShadow: `-24px 12px 40px 0 ${alpha(
                  theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
                  0.16
                )}`,
                right: '3%',
                top: '50%',
                borderRadius: '20px',
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: 1, pr: 1, pl: SPACING }}
            >
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                {`${translate('invitations.invitations')}`}
              </Typography>

              <IconButton onClick={handleClose}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Scrollbar sx={{ p: SPACING, pb: 0 }}>
              <Card sx={{ mb: 2 }} >
                <Grid container spacing={1} sx={{
                    ml: 3,
                    mt: 1,
                    mr: 3,
                  }}>
                  <Grid item xs={12} md={2}>
                    <Avatar
                      alt={(state.invitations[0].customer as ICustomer).shortName}
                      src={process.env.REACT_APP_APIFILE + '/images/' + (state.invitations[0].customer as ICustomer).logo}
                      sx={{ mr: 2, width: 48, height: 48 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={8} textAlign={'left'}>
                    <Typography variant="subtitle1"  sx={{ mt: 1.5 }}>
                      {(state.invitations[0].customer as ICustomer).shortName}
                    </Typography>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: 'grid',
                    ml: 3,
                    mt: 1,
                    mr: 3,
                  }}
                >
                  <Typography variant="subtitle2"  sx={{ mt: 1 }}>
                    {`${translate('invitations.invi_sayhi')}`}
                  </Typography>
                  <Typography variant="caption" sx={{ mb: 1 }}>
                    <i>{translate('invitations.from') + ' ' + state.invitations[0].fromEmail}</i><br/>
                  </Typography>
                </Box>

                <Divider />
                <Stack sx={{ flexDirection: 'row', mt: 2, mb: 2, alignItems: 'right' }}>
                  <Button variant="contained" color="primary" startIcon={<Iconify icon="bxs:check-shield" />} sx={{ ml: 3 }} onClick={onConfirm}>
                    {`${translate('invitations.confirm')}`}
                  </Button>
                </Stack>
              </Card>
            </Scrollbar>

          </Drawer>
        </>
        :
        null
      }
    </>
  );
}
