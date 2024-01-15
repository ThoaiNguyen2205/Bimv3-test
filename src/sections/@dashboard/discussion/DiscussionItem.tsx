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
// ----------------------------------------------------------------------

type ILocalState = {
  showSolution: boolean;
};

type Props = {
  discussion: IDiscussion;
  isConfirm: boolean | undefined;
};

export default function DiscussionItem({ discussion, isConfirm }: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    showSolution: true,
  });

  const {
    discussions,
    setDiscussions,
  } = useDiscussion(
    (state) => ({ 
      discussions: state.datas,
      setDiscussions: state.setDatas,
    }),
    shallow
  );

  const checkShow = (discussionList: IDiscussion[]) => {
    const disFilter = discussionList.filter((e) => (e.solution !== undefined && e.solution !== null));
    if (disFilter.length > 0) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        showSolution: false,
      }));
    } else {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        showSolution: true,
      }));
    }
  }

  const loadDAllDiscussions = async () => {
    const param = {
      relativeid: discussion.relativeid,
    }
    const discussionsInfo = await discussionsApi.getAllDiscussions(param);
    checkShow(discussionsInfo.data);
    setDiscussions(discussionsInfo.data);
  }

  const setStolution = async () => {
    await discussionsApi.setSolution(discussion._id);
    loadDAllDiscussions();
  }

  const cancelStolution = async () => {
    await discussionsApi.cancelSolution(discussion._id);
    loadDAllDiscussions();
  }

  useEffect(() => {
    checkShow(discussions);
  }, [discussions]);
  
  return (
    <>
      <Card
        sx={{
          p: 0.5,
          width: 1,
          boxShadow: (theme) => theme.customShadows.z4,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((discussion.solution !== undefined && discussion.solution !== null) && {
            bgcolor: 'success.lighter',
          }),
        }}
      >
        {(discussion.solution !== undefined && discussion.solution !== null) ?
          <Stack
            sx={{
              top: 8,
              right: 8,
              position: 'absolute',
            }}
          >
            <Iconify icon="icon-park-outline:check-one" color='primary.main' sx={{ width: 18, height: 18 }}/>
          </Stack>
          : null
        }

        <Stack spacing={1}
          direction='row'
          sx={{ flexGrow: 1, p: 1 }}
        >
          <Avatar
            alt={(discussion.from as IUser).username}
            src={process.env.REACT_APP_APIFILE + `/images/${(discussion.from as IUser).avatar}`}
            sx={{ width: 40, height: 40 }}
          />
          <Stack spacing={0}
            direction='column'
          >
            <Typography variant="subtitle2" color='primary' >
              <i>{`${(discussion.from as IUser).username}`}</i>
            </Typography>
            <Typography variant="caption" color='text.disabled'>
              <Iconify icon="ep:collection-tag" sx={{ mr: 0.5, width: 12, height: 12 }} />
              <i>{`${(discussion.createdGroup as IGroup).groupname}`} </i>
              <Iconify icon="solar:tag-outline" sx={{ ml: 0.5, mr: 0.5, width: 12, height: 12 }} />
              <i>{`${(discussion.createdGroup as IGroup).title}`} </i>
              <Iconify icon="eva:clock-outline" sx={{ ml: 0.5, mr: 0.5, width: 12, height: 12 }} />
              <i>{fToNow(discussion.createdAt)}</i>
            </Typography>
          </Stack>

        </Stack>

        <Stack
          justifyContent="center"
          sx={{ p: 1 }}
        >
          <StyledEditor>
            <Markdown children={discussion.content} />
          </StyledEditor>
          
        </Stack>

        {(localState.showSolution === true && isConfirm === true) ?
          <Stack
            sx={{
              position: 'relative',
            }}
          >
            <Button
                variant='soft'
                color='primary'
                onClick={setStolution}
              >
                {`${translate('common.solution')}`}
            </Button>
          </Stack>
          : null
        }

        {(localState.showSolution === false && (discussion.solution !== undefined && discussion.solution !== null) && isConfirm === true) ?
          <Stack
            sx={{
              position: 'relative',
            }}
          >
            <Button
              variant='soft'
              color='primary'
              onClick={cancelStolution}
            >
              {`${translate('common.cancel')}`}
            </Button>
          </Stack>
          : null
        }

      </Card>
    </>
  );
}
