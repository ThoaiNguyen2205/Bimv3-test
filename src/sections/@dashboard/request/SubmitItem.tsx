// @mui
import {
  Avatar,
  Button,
  Box,
  Card,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
// hooks
import useResponsive from 'src/hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';
// locales
import { useLocales } from 'src/locales';
import { IGroup } from 'src/shared/types/group';
// type
import { IDiscussion } from 'src/shared/types/discussion';
import { IUser } from 'src/shared/types/user';
import Markdown from 'src/components/markdown';
// utils
import { fToNow } from 'src/utils/formatTime';
import { StyledEditor } from 'src/components/editor/styles';
import discussionsApi from 'src/api/discussionsApi';
import { shallow } from 'zustand/shallow';
import useDiscussion from 'src/redux/discussionStore';
import { useEffect, useState } from 'react';
import { IRequestContent } from 'src/shared/types/requestContent';
// ----------------------------------------------------------------------

type ILocalState = {
  showUpdate: boolean;
  showConfirm: boolean;
};

type Props = {
  requestContent: IRequestContent;
  isUpdate: boolean | undefined;
  isConfirm: boolean | undefined;
  isApprove: boolean | undefined;
  onEditSubmit: VoidFunction;
  onConfirm: VoidFunction;
  onApprove: VoidFunction;
};

export default function SubmitItem({ requestContent, isUpdate, isConfirm, isApprove, onEditSubmit, onConfirm, onApprove }: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    showUpdate: false,
    showConfirm: false,
  });

  useEffect(() => {
    let showUpdate = false;
    if (isUpdate) {
      if ((requestContent.isConfimed !== null && requestContent.isConfimed !== undefined) ||
      (requestContent.isApproved !== null && requestContent.isApproved !== undefined)) {
        showUpdate = false;
      } else {
        showUpdate = true;
      }
    }
    
    let showConfirm = false;
    if (isConfirm) {
      if (requestContent.isApproved !== null && requestContent.isApproved !== undefined) {
        showConfirm = false;
      } else {
        showConfirm = true;
      }
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      showUpdate,
      showConfirm,
    }));
  }, [isUpdate, isConfirm, requestContent]);

  return (
    <>
      <Card
        sx={{
          p: 0.5,
          width: 1,
          boxShadow: (theme) => theme.customShadows.z4,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        {(requestContent?.isConfimed !== undefined && requestContent.isConfimed !== null) ?
          <Stack
            justifyContent="center"
            sx={{ position: 'absolute', top: 16, right: 40 }}
          >
            <Tooltip title={`${translate('common.confirm')}`} placement="top">
              <Iconify icon="mdi:approve" color='secondary.main' width={20} height={20} />
            </Tooltip>
          </Stack>
          : null
        }
        {(requestContent?.isApproved !== undefined && requestContent.isApproved !== null) ?
          <Stack
            justifyContent="center"
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Tooltip title={`${translate('common.approve')}`} placement="top">
              <Iconify icon="carbon:task-approved" color='error.main' width={20} height={20} />
            </Tooltip>
          </Stack>
          : null
        }

        <Stack spacing={1}
          direction='row'
          sx={{ flexGrow: 1, p: 1 }}
        >
          <Avatar
            alt={(requestContent.createdBy as IUser).username}
            src={process.env.REACT_APP_APIFILE + `/images/${(requestContent.createdBy as IUser).avatar}`}
            sx={{ width: 40, height: 40 }}
          />
          <Stack spacing={0}
            direction='column'
          >
            <Typography variant="subtitle2" color='primary' >
              <i>{`${(requestContent.createdBy as IUser).username}`}</i>
            </Typography>
            <Typography variant="caption" color='text.disabled'>
              <Iconify icon="ep:collection-tag" sx={{ mr: 0.5, width: 12, height: 12 }} />
              <i>{`${(requestContent.createdGroup as IGroup).groupname}`} </i>
              <Iconify icon="solar:tag-outline" sx={{ ml: 0.5, mr: 0.5, width: 12, height: 12 }} />
              <i>{`${(requestContent.createdGroup as IGroup).title}`} </i>
              <Iconify icon="eva:clock-outline" sx={{ ml: 0.5, mr: 0.5, width: 12, height: 12 }} />
              <i>{fToNow(requestContent.createdAt)}</i>
            </Typography>
          </Stack>

        </Stack>

        <Stack
          justifyContent="center"
          sx={{ p: 1 }}
        >
          <StyledEditor>
            <Markdown children={requestContent.content} />
          </StyledEditor>
          
        </Stack>

        <Stack spacing={1}
          direction='row'
          display='flex-end'
          sx={{
            flexGrow: 1,
            p: 1,
          }}
        >
          {(localState.showUpdate === true) ?
            <>
              <Tooltip title={`${translate('common.edit')}`} placement="top">
                <Button variant='soft' onClick={onEditSubmit}>
                  <Iconify icon="basil:edit-outline" width={20} height={20} />
                </Button>
              </Tooltip>
            </>
            : null
          }
          {(localState.showConfirm === true) ?
            <>
              <Tooltip title={(requestContent.isConfimed !== undefined && requestContent.isConfimed !== null) ? `${translate('common.cancel')} ${translate('common.confirm')}` : `${translate('common.confirm')}`} placement="top">
                <Button variant='soft' onClick={onConfirm} color={(requestContent.isConfimed !== undefined && requestContent.isConfimed !== null) ? 'warning' : 'primary'}>
                  <Iconify icon="mdi:approve" width={20} height={20} />
                </Button>
              </Tooltip>
            </>
            : null
          }
          {(isApprove === true) ?
            <>
              <Tooltip title={(requestContent?.isApproved !== undefined && requestContent.isApproved !== null) ? `${translate('common.cancel')} ${translate('common.approve')}` : `${translate('common.approve')}`} placement="top">
                <Button variant='soft' onClick={onApprove} color={(requestContent?.isApproved !== undefined && requestContent.isApproved !== null) ? 'warning' : 'primary'}>
                  <Iconify icon="carbon:task-approved" width={20} height={20} />
                </Button>
              </Tooltip>
            </>
            : null
          }
        </Stack>

      </Card>
    </>
  );
}
