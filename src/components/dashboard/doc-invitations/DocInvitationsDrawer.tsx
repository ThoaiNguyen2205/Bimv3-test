import { useRouter } from 'next/router';
import { useReducer, useEffect, useCallback, useState } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Avatar, Box, Button, Card, CardHeader, Divider, Drawer, Grid, Stack, Typography, Tooltip, IconButton, DialogActions } from '@mui/material';
// utils
import { bgBlur } from 'src/utils/cssStyles';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Image from 'src/components/image';
//
import ToggleButton from './ToggleButton';
// api
import docInvitationsApi from 'src/api/docInvitationsApi';
// type
import { IDocInvitation, IDocInvitationResGetAll } from 'src/shared/types/docInvitation';
// authContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
import { ICustomer } from 'src/shared/types/customer';
import { IBimDocument } from 'src/shared/types/bimDocument';
// ----------------------------------------------------------------------

type ILocalState = {
  invitations: Array<IDocInvitation>;
  open: boolean;
}

// ----------------------------------------------------------------------

const SPACING = 2.5;

export default function DocInvitationsDrawer() {
  const theme = useTheme();
  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const router = useRouter();

  const [localState, setLocalState] = useState<ILocalState>({
    invitations: [],
    open: false,
  });

  const handleToggle = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, open: !localState.open }));
  };

  const handleClose = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, open: false }));
  };
  
  const loadInvitations = useCallback(async () => {
    const params = { toEmail: user?.email };
    const invitationsResponse: IDocInvitationResGetAll = await docInvitationsApi.getInvitations(params);
    const invitations: Array<IDocInvitation> = invitationsResponse.data;
    setLocalState((prevState: ILocalState) => ({ ...prevState, invitations: invitations }));
  }, [user]);

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const onConfirm = async () => {
    const updateInvitation = await docInvitationsApi.patchComfirmById(localState.invitations[0]._id);
    if (updateInvitation) {
      await refresh(user?.id);
      handleClose();
      loadInvitations();
    }
  }

  return (
    <>
      {(localState.invitations.length > 0) ?
        <>
          {!localState.open && <ToggleButton open={localState.open} notDefault={true} onToggle={handleToggle} />}

          <Drawer
            anchor="right"
            open={localState.open}
            onClose={handleClose}
            BackdropProps={{ invisible: true }}
            PaperProps={{
              sx: {
                ...bgBlur({ color: theme.palette.background.default, opacity: 0.9 }),
                width: '400px',
                height: '40%',
                boxShadow: `-24px 12px 40px 0 ${alpha(
                  theme.palette.mode === 'light' ? theme.palette.grey[500] : theme.palette.common.black,
                  0.16
                )}`,
                right: '3%',
                top: '55%',
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
                {`${translate('documents.document')}`}
              </Typography>

              <IconButton onClick={handleClose}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Scrollbar sx={{ p: SPACING, pb: 0 }}>
              <Card>
                <Grid container spacing={1} sx={{
                    ml: 3,
                    mt: 1,
                    mr: 3,
                  }}>
                  <Grid item xs={12} md={2}>
                    <Image
                      alt={document.title}
                      src={`${process.env.REACT_APP_APIFILE}images/${(localState.invitations[0].document as IBimDocument).cover}`}
                      ratio="4/3"
                      sx={{
                        position: 'relative',
                        top: 0,
                        borderRadius: 1,
                        width: '100%',
                        height: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={8} textAlign={'left'}>
                    <Typography noWrap variant="subtitle1"  sx={{ mt: 1 }}>
                      {(localState.invitations[0].document as IBimDocument).title}
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
                    {`${translate('documents.invi_sayhi')}`}
                  </Typography>
                  <Typography variant="caption" sx={{ mb: 1 }}>
                    <i>{translate('documents.from') + ' ' + localState.invitations[0].fromEmail}</i><br/>
                  </Typography>
                </Box>

                <Divider />
                <Stack sx={{ flexDirection: 'row', mt: 2, mb: 3, alignItems: 'right' }}>
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
