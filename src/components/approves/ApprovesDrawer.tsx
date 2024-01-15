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
import ApproveDiscussionCard from './ApproveDiscussionCard';
//
import ToggleButton from './ToggleButton';
// api
import invitationsApi from 'src/api/invitationsApi';
// type
import { IInvitation, IInvitationResGetAll } from 'src/shared/types/invitation';
import { IDiscussion, IDiscussionResGetAll } from 'src/shared/types/discussion';
// authContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
import { ICustomer } from 'src/shared/types/customer';
import discussionsApi from 'src/api/discussionsApi';
// enum
import { Approved } from 'src/shared/enums';
// ----------------------------------------------------------------------

type ILocalState = {
  approves: IDiscussion[];
  open: boolean;
}

// ----------------------------------------------------------------------

const SPACING = 2.5;

export default function ApprovesDrawer() {
  const theme = useTheme();
  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const router = useRouter();

  const [localState, setLocalState] = useState<ILocalState>({
    approves: [],
    open: false,
  });

  const handleToggle = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, open: !localState.open }));
  };

  const handleClose = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, open: false }));
  };
  
  const loadApproves = useCallback(async () => {
    if (user?.isKey === true) {
      const params = { 
        customer: user?.customer?._id,
        createdGroup: user?.group?._id,
        approved: Approved.None
      };
      const approvesResponse: IDiscussionResGetAll = await discussionsApi.getAllDiscussions(params);
      const approves: IDiscussion[] = approvesResponse.data;
      setLocalState((prevState: ILocalState) => ({ ...prevState, approves: approvesResponse.data }));
    }
  }, [user]);

  useEffect(() => {
    loadApproves();
  }, [user]);

  const onApprove = async (approveId: string) => {
    const approveDiscussion = await discussionsApi.postApprove(approveId);
    if (approveDiscussion) {
      loadApproves();
    }
  }

  const onReject = async (rejectId: string) => {
    const rejectDiscussion = await discussionsApi.postReject(rejectId);
    if (rejectDiscussion) {
      loadApproves();
    }
  }

  return (
    <>
      {(localState.approves.length > 0) ?
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
                height: '360px',
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
                {`${translate('discussion.discussion_accept')}`}
              </Typography>

              <IconButton onClick={handleClose}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Scrollbar sx={{ p: SPACING, pb: 0 }}>
              <Stack spacing={1.5} sx={{ pb: 2 }} >
                {localState.approves && localState.approves.map((discuss) => (
                  <ApproveDiscussionCard
                    key={discuss._id}
                    discussion={discuss}
                    onApprove={() => onApprove(discuss._id)}
                    onReject={() => onReject(discuss._id)}
                  />
                ))}
              </Stack>
            </Scrollbar>

          </Drawer>
        </>
        :
        null
      }
    </>
  );
}
