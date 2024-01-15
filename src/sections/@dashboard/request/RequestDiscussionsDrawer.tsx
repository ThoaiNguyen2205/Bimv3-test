import { useEffect, useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  Button,
  Divider,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  StackProps,
  DrawerProps,
  Autocomplete,
  ButtonGroup,
} from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
// utils
import { fData } from '../../../utils/formatNumber';
import { fDate, fDateTime } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import FileThumbnail, { fileFormat } from '../../../components/file-thumbnail';
//
// import PermitItem from './PermitItem';
// import HistoryItem from './HistoryItem';
import DiscussionItem from '../discussion/DiscussionItem';
import { IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// zustand store
import useFolder from 'src/redux/foldersStore';
import useDiscussion from 'src/redux/discussionStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from 'src/locales';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import filesApi from 'src/api/filesApi';
import useHistoryFiles from 'src/redux/historyFilesStore';

import CommentEditor from '../discussion/editor/CommentEditor';
import { Approved, LogType, TaskCategory } from 'src/shared/enums';
import discussionsApi from 'src/api/discussionsApi';
import { IMarkup } from 'src/shared/types/markup';
import useMarkup from 'src/redux/markupStore';
import { IMainTask } from 'src/shared/types/mainTask';
import useRequest from 'src/redux/requestStore';
// ----------------------------------------------------------------------

type ILocalState = {
  groupsInFolder: IGroupInFolder[];
  openCommentEditor: boolean;
  solutionOnly: boolean;
};

interface Props extends DrawerProps {
  onClose: VoidFunction;
}

export default function RequestDiscussionsDrawer({
  open,
  onClose,
  ...other
}: Props) {
  const { translate } = useLocales();

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

  const {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    requestLoading,
    setRequestLoading,
    countRequests,
    currentTask,
    setCurrentTask,
    requestsTree,
    setRequestsTree,
    requestContents,
    setRequestContents,
  } = useRequest(
    (state) => ({
      requests: state.datas,
      setRequests: state.setDatas,
      selectedRequest: state.selectedData,
      setSelectedRequest: state.setSelectedData,
      requestLoading: state.loading,
      setRequestLoading: state.setLoading,
      countRequests: state.countDatas,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      requestsTree: state.requestsTree,
      setRequestsTree: state.setRequestsTree,
      requestContents: state.requestContents,
      setRequestContents: state.setRequestContents,
    }),
    shallow
  );

  const isConfirm = (currentTask?.isConfirm !== null && currentTask?.isConfirm !== undefined) ? currentTask?.isConfirm : false;

  const [localState, setLocalState] = useState<ILocalState>({
    groupsInFolder: [],
    openCommentEditor: false,
    solutionOnly: false,
  });

  const solutionOnlyLoad = async () => {
    if (selectedRequest !== null && selectedRequest !== undefined) {
      const param = {
        relativeid: selectedRequest?._id,
      }
      const discussionsInfo = await discussionsApi.getAllDiscussions(param);
      if (localState.solutionOnly) {
        setDiscussions(discussionsInfo.data.filter((e) => (e.solution !== undefined && e.solution !== null)));
      } else {
        setDiscussions(discussionsInfo.data);
      }
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        solutionOnly: !localState.solutionOnly,
      }));
    }
  }
  
  useEffect(() => {
    const loadDetailsInfo = async () => {
      if (selectedRequest !== null) {
        let fatherId = selectedRequest._id;
        const detailsInfo = await discussionsApi.getDetailsInfo(fatherId, 'request', 'trash');
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          groupsInFolder: detailsInfo.groups,
        }));
      }
      
    }
    loadDetailsInfo();

    const loadDAllDiscussions = async () => {
      if (selectedRequest !== null && selectedRequest !== undefined) {
        const param = {
          relativeid: selectedRequest?._id,
        }
        const discussionsInfo = await discussionsApi.getAllDiscussions(param);
        setDiscussions(discussionsInfo.data);
      }
    }
    loadDAllDiscussions();


  }, [selectedRequest]);

  const handleCommentEditor = (value: boolean) => {
    if (value) {
      if (selectedRequest !== null) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          openCommentEditor: value,
        }));
      } else {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          openCommentEditor: false,
        }));
      }
    } else {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        openCommentEditor: false,
      }));
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        variant='persistent'
        anchor="right"
        BackdropProps={{
          invisible: true,
        }}
        PaperProps={{
          sx: { width: 380 },
        }}
        {...other}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
          <Typography variant="h6">
            {`${selectedRequest ? selectedRequest.title : translate('request.select_request')}`}
          </Typography>
          
          <ButtonGroup>
            <Tooltip title={`${translate('common.solution_only')}`} placement="top">
              <Button variant="soft" size='small' color='primary' onClick={solutionOnlyLoad}>
                <Iconify icon="icon-park-outline:check-one" />
              </Button>
            </Tooltip>
            <Tooltip title={`${translate('common.close')}`} placement="top">
              <Button variant="soft" size='small' color='error' onClick={onClose}>
                <Iconify icon="gg:close-o" />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Stack>
        
        <Scrollbar sx={{ height: 1 }}>
          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{ p: 2.5 }}
          >
            <Stack spacing={1.5}>
              <Stack spacing={1.5}>
                {discussions && discussions.map((discuss) => (
                  <DiscussionItem key={discuss._id} discussion={discuss} isConfirm={isConfirm}/>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Scrollbar>

        {(currentTask?.isUpdate === true || currentTask?.isConfirm === true || currentTask?.isApprove === true) ?
          <Stack sx={{ p: 1.5 }} direction='row' spacing={2} >
            <Button
              sx={{ width: '100%' }}
              variant="soft"
              color="success"
              // size="large"
              startIcon={<Iconify icon="ant-design:comment-outlined" />}
              onClick={() => handleCommentEditor(true)}
            >
              {`${translate('nav.discussion')}`}
            </Button>
          </Stack>
          : null
        }

        {selectedRequest ?
          <CommentEditor
            task={''}
            item={selectedRequest ? selectedRequest._id : ''}
            logType={LogType.FileRequestCloud}
            link={window.location.href}
            title={selectedRequest ? selectedRequest.title : ''}
            open={localState.openCommentEditor}
            onClose={() => handleCommentEditor(false)}
            groupsInFolder={localState.groupsInFolder}
            linkFolderId={(selectedRequest?.folder as IFolder)._id}
          />
          :
          null
        }
      </Drawer>

      <></>
    </>
  );
}