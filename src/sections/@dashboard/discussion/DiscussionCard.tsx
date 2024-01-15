import { useEffect, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  Stack,
  IconButton,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fDate } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
//
import { IGroupInFolder } from '../../../shared/types/groupInFolder';
import { IGroup } from '../../../shared/types/group';
import Tooltip from '@mui/material/Tooltip';
import { useLocales } from '../../../locales';
import { IDiscussionTask } from '../../../shared/types/mainTask';
import DiscussionPopupMenu from './DiscussionPopupMenu';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { IUser } from '../../../shared/types/user';
import { IFolder } from '../../../shared/types/folder';
import { useRouter } from 'next/router';
import { StyledEditor } from '../../../components/editor/styles';
import Markdown from '../../../components/markdown/Markdown';
import CommentItem from './CommentItem';
import { IDiscussion } from 'src/shared/types/discussion';
import discussionsApi from 'src/api/discussionsApi';
import useTask from 'src/redux/taskStore';
import { shallow } from 'zustand/shallow';
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean;
  isSubmitting: boolean;
  openCommentEditor: boolean;
  showDiscussionsCount: number;
  //
  solutionOnly: boolean;
}

type Props = {
  handleComment: () => void;
  groupsInFoler: IGroupInFolder[];
  openPopover: HTMLElement | null;
  data: IDiscussionTask;
  handleClosePopover: VoidFunction;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  //
  selected: boolean;
  //
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  //
  replyId: string;
  //
  handleOpenFilesDialog: VoidFunction;
  handleOpenInfoDialog: VoidFunction;
};

export default function DiscussionCard({
  handleComment,
  groupsInFoler,
  openPopover,
  data,
  handleClosePopover,
  handleOpenPopover,
  //
  selected,
  //
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  replyId,
  //
  handleOpenFilesDialog,
  handleOpenInfoDialog,
}: Props) {
  const { translate } = useLocales();
  const router = useRouter();
  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
    isSubmitting: false,
    openCommentEditor: false,
    showDiscussionsCount: 3,
    //
    solutionOnly: true,
  });

  const {
    tasks,
    taskLoading,
    selectedTask,
    setTasks,
    countTasks,
    setSelectedTask,
    setTaskLoading,
    discussionTask,
    setDiscussionTask,
    discussionTasks,
    setDiscussionTasks,
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      taskLoading: state.loading,
      selectedTask: state.selectedData,
      setTasks: state.setDatas,
      countTasks: state.countDatas,
      setSelectedTask: state.setSelectedData,
      setTaskLoading: state.setLoading,
      discussionTask: state.discussionTask,
      setDiscussionTask: state.setDiscussionTask,
      discussionTasks: state.discussionTasks,
      setDiscussionTasks: state.setDiscussionTasks,
    }),
    shallow
  );

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  const jumptoFilePath = async () => {
    const folderId = (data?.mainTask.folder as IFolder)._id;
    router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${folderId}`);
  }
 
  const readMore = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      showDiscussionsCount: localState.showDiscussionsCount + 3,
    }));
  }

  const readAll = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      showDiscussionsCount: data.discussions.length + 1,
    }));
  }

  const solutionOnlyLoad = async () => {
    const param = {
      relativeid: data.mainTask._id,
    }
    const discussionsInfo = await discussionsApi.getAllDiscussions(param);

    const newDiscussionTasks: IDiscussionTask[] = [];
    for (const dti of discussionTasks) {
      if (dti.mainTask._id === data.mainTask._id) {
        if (localState.solutionOnly) {
          dti.discussions = discussionsInfo.data.filter((e) => (e.solution !== undefined && e.solution !== null));
        } else {
          dti.discussions = discussionsInfo.data;
        }
      }
      newDiscussionTasks.push(dti);
    }
    
    if (newDiscussionTasks.length > 0) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        solutionOnly: !localState.solutionOnly,
      }));
    }
    setDiscussionTasks(newDiscussionTasks);
  }

  return (
    <>
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 3,
          width: 1,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((localState.showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...((replyId === data.mainTask._id) && {
            bgcolor: 'success.lighter',
          }),
        }}
      >
        {(data.mainTask.isEdit === true) ?
          <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute', zIndex: 99 }}>
            <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
          : null
        }

        <Stack direction="row" alignItems="center" sx={{ top: 20, right: 60, position: 'absolute' }}>
          {data.mainTask.isEdit ?
            <Tooltip title={`${translate('common.edit')}`} placement='top'>
              <Iconify icon="iconamoon:edit-fill" color='primary.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.mainTask.isUpdate ? 
            <Tooltip title={`${translate('common.update')}`} placement='top'>
              <Iconify icon="dashicons:update" color='info.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.mainTask.isDownload ? 
            <Tooltip title={`${translate('common.download')}`} placement='top'>
              <Iconify icon="ic:round-download" color='warning.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.mainTask.isConfirm ? 
            <Tooltip title={`${translate('common.confirm')}`} placement='top'>
              <Iconify icon="mdi:approve" color='secondary.light' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.mainTask.isApprove ? 
            <Tooltip title={`${translate('common.approve')}`} placement='top'>
              <Iconify icon="carbon:task-approved" color='error.main' width={12} height={12} />
            </Tooltip>
            : null
          }
        </Stack>

        <Stack direction="row" alignItems="center" >
          <TextMaxLine
            variant='h6'
            persistent
            sx={{ ml: 1, mt: 1 }}
          >
            {data.mainTask.name}
          </TextMaxLine>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ top: 50, right: 22, position: 'absolute', color: 'primary.main' }}>
          <Iconify icon="fluent:folder-20-regular" sx={{ width: 16, height: 16 }} />
          <Typography
            variant='caption'
            sx={{ cursor: 'pointer', ml: 1 }}
          >
            <Box onClick={() => jumptoFilePath()}>
            {data.strPath}
            </Box>
          </Typography>
        </Stack>

        <Stack>
          <StyledEditor>
            <Markdown>
              {data.mainTask.description}
            </Markdown>
          </StyledEditor>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <Iconify icon="basil:user-outline" sx={{ width: 14, height: 14 }} />
          <i>{(data.mainTask.createdBy as IUser).username}</i>
          <Iconify icon="fa-solid:users" sx={{ width: 14, height: 14 }} />
          <i>{(data.mainTask.createdGroup as IGroup).groupname}</i>
          <Iconify icon="mingcute:time-line" sx={{ width: 14, height: 14 }} />
          <i>{fDate(data.mainTask.updatedAt)}</i>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <AvatarGroup
            max={10}
            sx={{
              '& .MuiAvatarGroup-avatar': {
                width: 24,
                height: 24,
                '&:first-of-type': {
                  fontSize: 12,
                },
              },
            }}
          >
            {groupsInFoler &&
              groupsInFoler.map((group) => (
                <Avatar key={group._id} alt={(group.group as IGroup).groupname} src={process.env.REACT_APP_APIFILE + 'images/' + (group.group as IGroup).logo} />
              ))}
          </AvatarGroup>
        </Stack>

        <Stack
          spacing={2.5}
          justifyContent="center"
          sx={{ pt: 3, pl: 4, pb: 2 }}
        >
          <Stack spacing={1.5}>
            <Stack spacing={1.5}>
              {data.discussions && data.discussions.slice(0, localState.showDiscussionsCount).map((discuss) => (
                <CommentItem key={discuss._id} discussion={discuss} discussions={data.discussions} isConfirm={data.mainTask.isConfirm} />
              ))}
            </Stack>

            
            <Stack direction='row' spacing={1.5}>
              {(data.discussions.length > 3 && localState.showDiscussionsCount < data.discussions.length) ?
                <>
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={false}
                    startIcon={<Iconify icon='ep:more'/>}
                    onClick={readMore}
                  >
                    { `${translate('common.read_more')}` } 
                  </LoadingButton>
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={false}
                    startIcon={<Iconify icon='ic:round-read-more'/>}
                    onClick={readAll}
                  >
                    { `${translate('common.read_all')}` } 
                  </LoadingButton>
                </>
                : null
              }

              <LoadingButton
                size="small"
                variant="soft"
                loading={localState.isSubmitting}
                startIcon={<Iconify icon='icon-park-outline:check-one'/>}
                onClick={solutionOnlyLoad}
              >
                { `${translate('common.solution_only')}` } 
              </LoadingButton>
            </Stack>
            
          </Stack>
        </Stack>

        <Stack
          component="span" direction="row" alignItems="center" justifyContent="flex-end"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <LoadingButton
            size="small"
            variant="soft"
            loading={localState.isSubmitting}
            startIcon={<Iconify icon='clarity:file-group-line'/>}
            onClick={handleOpenFilesDialog}
          >
            { `${translate('coordinator.files')}` } 
          </LoadingButton>

          <LoadingButton
            size="small"
            variant="soft"
            loading={localState.isSubmitting}
            startIcon={<Iconify icon='typcn:info-outline'/>}
            onClick={handleOpenInfoDialog}
          >
            { `${translate('coordinator.info')}` } 
          </LoadingButton>
          
          {(data.mainTask.isUpdate === true || data.mainTask.isApprove === true || data.mainTask.isConfirm === true) ?
            <LoadingButton
              size="small"
              variant="contained"
              loading={localState.isSubmitting}
              startIcon={<Iconify icon='mdi:comment-edit'/>}
              onClick={handleComment}
            >
              { `${translate('common.reply')}` } 
            </LoadingButton>
            : null
          }
        </Stack>
      </Card>

      <DiscussionPopupMenu 
        openPopover={openPopover}
        data={data}
        handleClosePopover={handleClosePopover}
        onEditRow={onEditRow}
        onPermission={onPermission}
        onDeleteRow={onDeleteRow}
      />

    </>
  );
}
