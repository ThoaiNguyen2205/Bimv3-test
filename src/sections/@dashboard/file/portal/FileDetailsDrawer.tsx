import React, { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  SwipeableDrawer,
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
import { fData } from '../../../../utils/formatNumber';
import { fDate, fDateTime } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import FileThumbnail, { fileFormat } from '../../../../components/file-thumbnail';
import ConfirmDialog from '../../../../components/confirm-dialog/ConfirmDialog';
//
import PermitItem from './PermitItem';
import HistoryItem from './HistoryItem';
import DiscussionItem from '../../discussion/DiscussionItem';
import { IFolder } from '../../../../shared/types/folder';
import { IFile } from '../../../../shared/types/file';
// zustand store
import useFolder from '../../../../redux/foldersStore';
import useDiscussion from '../../../../redux/discussionStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from '../../../../locales';
import { IGroupInFolder } from '../../../../shared/types/groupInFolder';
import groupInFoldersApi from '../../../../api/groupInFoldersApi';
import filesApi from '../../../../api/filesApi';
import useHistoryFiles from '../../../../redux/historyFilesStore';

import CommentEditor from '../../discussion/editor/CommentEditor';
import { Approved, LogType } from '../../../../shared/enums';
import discussionsApi from '../../../../api/discussionsApi';
import { PATH_DASHBOARD } from '../../../../routes/paths';
import { useRouter } from 'next/router';
import { IMainTask } from '../../../../shared/types/mainTask';
import TaskRelativeItem from './TaskRelativeItem';
import { DeleteData } from '../../../../shared/types/deleteData';
import { useAuthContext } from '../../../../auth/useAuthContext';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
// ----------------------------------------------------------------------

type ILocalState = {
  data: IFolder | IFile | null;
  displayName: string;
  url: string;
  updatedAt: Date | null;
  size: string;
  version: string;
  dataType: string;
  toggleProperties: boolean;
  togglePermission: boolean;
  toggleTask: boolean;
  toggleVersion: boolean;
  toggleDiscussion: boolean;
  groupsInFolder: IGroupInFolder[];
  tasksRelatived: IMainTask[];
  openCommentEditor: boolean;
  destination: string;
  //
  confirmed: boolean;
  approved: boolean;
  dataDialog: ConfirmDialogProps;
};

interface Props extends DrawerProps {
  item: IFolder | IFile | null;
  itemType: string;
  treeItemOnClick: (foderId: string) => void;
  onClose: VoidFunction;
  onOpenRow: VoidFunction;
  handlePreviewFile: (fileId: string) => void;
}

export default function FileDetailsDrawer({
  item,
  itemType,
  treeItemOnClick,
  open,
  onClose,
  onOpenRow,
  handlePreviewFile,
  ...other
}: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const router = useRouter();
  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

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
    historyFiles,
    setHistoryFiles,
  } = useHistoryFiles(
    (state) => ({
      historyFiles: state.datas,
      setHistoryFiles: state.setDatas,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    data: null,
    displayName: '',
    url: '',
    updatedAt: null,
    size: '',
    version: '',
    dataType: '',
    toggleProperties: true,
    togglePermission: true,
    toggleTask: true,
    toggleVersion: true,
    toggleDiscussion: true,
    groupsInFolder: [],
    tasksRelatived: [],
    openCommentEditor: false,
    destination: '',
    //
    confirmed: false,
    approved: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
  });
  
  useEffect(() => {
    const data = item;
    if (data === null) return;

    const loadDetailsInfo = async () => {
      const displayName = (itemType === 'folder') ? (data as IFolder)?.displayName : (data as IFile)?.displayName;
      const updatedAt = (itemType === 'folder') ? (data as IFolder)?.updatedAt : (data as IFile)?.updatedAt;
      const size = (itemType === 'folder') ? '...' : (data as IFile)?.size;
      const version = (itemType === 'folder') ? (data as IFolder)?.version : `${(data as IFile)?.version}.${(data as IFile)?.subVersion}`;
      
      let url = process.env.REACT_APP_APIFILE + 'projects/';
      if (itemType === 'file') {
        const fi = data as IFile;
        url += (fi.folder as IFolder).path + (fi.folder as IFolder).storeName + '/' + fi.storeFile;
      }
      
      let dataType = 'folder';
      if (itemType === 'file') {
        const fi = data as IFile;
        const storeFile = fi.storeFile;
        const dotIndex = storeFile.lastIndexOf('.');
        dataType = storeFile.substring(dotIndex + 1);
      }
      
      let fatherId = '';
      let isConfirmed = false;
      let isApproved = false;
      if (itemType === 'folder') {
        fatherId = (data as IFolder)._id;
      } else {
        const fil = data as IFile;
        fatherId = fil._id;
        if (fil.isConfimed !== undefined && fil.isConfimed !== null) {
          isConfirmed = true;
        } else {
          isConfirmed = false;
        }
        if (fil.isApproved !== undefined && fil.isApproved !== null) {
          isApproved = true;
        } else {
          isApproved = false;
        }
        
      }
      const detailsInfo = await discussionsApi.getDetailsInfo(fatherId, itemType, 'none');      
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        data,
        displayName,
        updatedAt,
        size,
        version,
        dataType,
        groupsInFolder: detailsInfo.groups,
        destination: detailsInfo.strPath,
        tasksRelatived: detailsInfo.tasks,
        confirmed: isConfirmed,
        approved: isApproved,
      }));
      setHistoryFiles(detailsInfo.histories);
      setDiscussions(detailsInfo.discussions);
    }
    loadDetailsInfo();
  }, [item]);

  const handleToggleProperties = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleProperties: !localState.toggleProperties }));
  };

  const handleTogglePermission = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, togglePermission: !localState.togglePermission }));
  };

  const handleToggleTask = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleTask: !localState.toggleTask }));
  };

  const handleToggleVersion = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleVersion: !localState.toggleVersion }));
  };

  const handleToggleDiscussion = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleDiscussion: !localState.toggleDiscussion }));
  };

  const handleCommentEditor = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openCommentEditor: value,
    }));
  }

  const jumptoFilePath = async () => {
    if (itemType === 'file') {
      const fileData = localState.data as IFile;
      const folderId = (fileData.folder as IFolder)._id;
      router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${folderId}&sel=${fileData._id}`);
    }
  }

  const confirmFile = async () => {
    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }
    if (itemType === 'file') {
      const fileData = localState.data as IFile;
      
      let confirmed: boolean = false;

      if (fileData.isConfimed !== undefined && fileData.isConfimed !== null) {
        const fileRes = await filesApi.cancelApproveById(fileData._id, deleteData);
        confirmed = (fileRes.isConfimed !== undefined && fileRes.isConfimed !== null) ? true : false;
      } else {
        const fileRes = await filesApi.approveById(fileData._id, deleteData);
        confirmed = (fileRes.isConfimed !== undefined && fileRes.isConfimed !== null) ? true : false;
      }
      
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        confirmed,
      }));
      treeItemOnClick((fileData.folder as IFolder)._id);
    }
    handleConfirmFile(false);
  }

  const approveFile = async () => {
    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }
    if (itemType === 'file') {
      const fileData = localState.data as IFile;

      let approved: boolean = false;

      if (fileData.isApproved !== undefined && fileData.isApproved !== null) {
        const fileRes = await filesApi.cancelApproveById(fileData._id, deleteData);
        approved = (fileRes.isApproved !== undefined && fileRes.isApproved !== null) ? true : false;
      } else {
        const fileRes = await filesApi.approveById(fileData._id, deleteData);
        approved = (fileRes.isApproved !== undefined && fileRes.isApproved !== null) ? true : false;
      }
      
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        approved,
      }));
      treeItemOnClick((fileData.folder as IFolder)._id);
    }
    handleConfirmFile(false);
  }

  const handleConfirmFile = (open: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleConfirmFile(false),
    }

    if (open === true) {
      dataDialog = {
        open: true,
        onClose: () => handleConfirmFile(false),
        title: `${translate('common.confirm')} | ${translate('common.un_confirm')}`,
        content: (localState.data as IFile) ? (localState.data as IFile).displayName : '',
        action: (
          <Button variant="contained" color="error" onClick={() => confirmFile()}>
            Ok
          </Button>
        )
      }
    }

    setLocalState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    return;
  };

  const handleApproveFile = (open: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleApproveFile(false),
    }

    if (open === true) {
      dataDialog = {
        open: true,
        onClose: () => handleApproveFile(false),
        title: `${translate('common.approve')} | ${translate('common.un_approve')}`,
        content: (localState.data as IFile) ? (localState.data as IFile).displayName : '',
        action: (
          <Button variant="contained" color="error" onClick={() => approveFile()}>
            Ok
          </Button>
        )
      }
    }

    setLocalState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    return;
  };

  return (
    <>
      <React.Fragment key={"right"}>
        <SwipeableDrawer
          open={open}
          onClose={onClose}
          onOpen={onClose}
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
              {itemType === 'folder' ? `${translate('cloud.folder')}` : `${translate('cloud.file')}`}
            </Typography>
            {itemType === 'file' ?
              <Stack direction="row" alignItems="center" justifyContent="flex-end" >
                <ButtonGroup>
                  {(selectedFolder?.isConfirm === true && localState.approved === false) ? 
                    <Tooltip title={(localState.confirmed ? `${translate('common.un_confirm')}` : `${translate('common.confirm')}`)}>
                      <Button
                        variant="soft"
                        color="secondary"
                        onClick={() => handleConfirmFile(true)}
                      >
                        <Iconify icon="mdi:approve" />
                      </Button>
                    </Tooltip>
                    : null
                  }
                  {(selectedFolder?.isApprove === true) ? 
                    <Tooltip title={(localState.approved ? `${translate('common.un_approve')}` : `${translate('common.approve')}`)}>
                      <Button
                        variant="soft"
                        color="error"
                        onClick={() => handleApproveFile(true)}
                      >
                        <Iconify icon="carbon:task-approved" />
                      </Button>
                    </Tooltip>
                    : null
                  }
                </ButtonGroup>
              </Stack>
              : null
            }
          </Stack>

          <Stack direction="row" alignItems="center" sx={{ top: 80, right: 20, position: 'absolute', zIndex: 2 }} >
            {itemType === 'file' ?
              <Stack direction="row" alignItems="center" justifyContent="flex-end" >
                <ButtonGroup>
                  {(localState.confirmed === true) ? 
                    <Tooltip title={`${translate('common.confirmed')}`}>
                      <Iconify color="secondary.main" icon="mdi:approve" />
                    </Tooltip>
                    : null
                  }
                  {(localState.approved === true) ? 
                    <Tooltip title={`${translate('common.approved')}`}>
                      <Iconify color="error.main" icon="carbon:task-approved" />
                    </Tooltip>
                    : null
                  }
                </ButtonGroup>
              </Stack>
              : null
            }
          </Stack>
          
          <Scrollbar sx={{ height: 1 }}>
            <Stack
              spacing={2.5}
              justifyContent="center"
              sx={{ p: 2.5, bgcolor: 'background.neutral' }}
            >
              <FileThumbnail
                imageView
                file={itemType === 'folder' ? itemType : localState.url}
                sx={{ width: 64, height: 64 }}
                imgSx={{ borderRadius: 1 }}
              />

              <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
                {localState.displayName}
              </Typography>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack spacing={1.5}>
                <Panel
                  label={`${translate('cloud.properties')}:`}
                  toggle={localState.toggleProperties}
                  onToggle={handleToggleProperties}
                />

                {localState.toggleProperties && (
                  <Stack spacing={1.5}>
                    <Row label={`${translate('cloud.version')}:`} value={localState.version} />
                    <Row label={`${translate('cloud.size')}:`} value={localState.size + ' (Mb)'} />
                    <Row label={`${translate('cloud.update')}:`} value={fDate(localState.updatedAt)} />
                    <Row label="Type" value={fileFormat(localState.dataType)} />
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('cloud.path')}:`}
                      </Box>
                      <Typography
                        variant='caption'
                        color='primary.main'
                        sx={{ cursor: 'pointer' }}
                      >
                        <Box onClick={() => jumptoFilePath()}>
                        {localState.destination}
                        </Box>
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Stack>

            </Stack>

            {(itemType === 'folder') ? 
              <Stack
                spacing={2.5}
                justifyContent="center"
                sx={{ p: 2.5 }}
              >

                <Stack spacing={1.5}>
                  <Panel
                    label={`${translate('cloud.permission')}:`}
                    toggle={localState.togglePermission}
                    onToggle={handleTogglePermission}
                  />

                  {localState.togglePermission && (
                    <Stack spacing={1.5}>
                      <List disablePadding>
                        {localState.groupsInFolder && localState.groupsInFolder.map((gif) => (
                          <PermitItem key={gif._id} groupInFolder={gif} />
                        ))}
                      </List>
                    </Stack>
                  )}
                </Stack>

                <Stack spacing={1.5}>
                  <Panel
                    label={`${translate('task.task')}:`}
                    toggle={localState.toggleTask}
                    onToggle={handleToggleTask}
                  />

                  {localState.toggleTask && (
                    <Stack spacing={1.5}>
                      <List disablePadding>
                        {localState.tasksRelatived && localState.tasksRelatived.map((task) => (
                          <TaskRelativeItem key={task._id} task={task} />
                        ))}
                      </List>
                    </Stack>
                  )}
                </Stack>

              </Stack>
              : null
            }

            {(itemType === 'file') ? 
              <Stack
                spacing={2.5}
                justifyContent="center"
                sx={{ p: 2.5 }}
              >

                <Stack spacing={1.5}>
                  <Panel
                    label={`${translate('cloud.versions')}:`}
                    toggle={localState.toggleVersion}
                    onToggle={handleToggleVersion}
                  />

                  {localState.toggleVersion && (
                    <Stack spacing={1.5}>
                      <List disablePadding>
                        {historyFiles && historyFiles.map((his) => (
                          <HistoryItem
                            key={his._id}
                            file={his}
                            isUpdate={selectedFolder?.isUpdate || false}
                            isDownload={selectedFolder?.isDownload || false}
                            treeItemOnClick={() => treeItemOnClick((his.folder as IFolder)._id)}
                            onPreviewFile={() => handlePreviewFile(his._id)}
                          />
                        ))}
                      </List>
                    </Stack>
                  )}
                  
                </Stack>
              </Stack>
              : null
            }

            <Stack
              spacing={2.5}
              justifyContent="center"
              sx={{ p: 2.5 }}
            >
              <Stack spacing={1.5}>
                <Panel
                  label={`${translate('discussion.discussion')}:`}
                  toggle={localState.toggleDiscussion}
                  onToggle={handleToggleDiscussion}
                />

                {localState.toggleDiscussion && (
                  <Stack spacing={1.5}>
                    {discussions && discussions.map((discuss) => (
                      <DiscussionItem key={discuss._id} discussion={discuss} isConfirm={false}/>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>

          </Scrollbar>

          <Stack sx={{ p: 1.5 }} direction='row' spacing={2} >
            <Button
              sx={{ width: '40%' }}
              variant="soft"
              color="success"
              // size="small"
              startIcon={<Iconify icon="fluent:open-16-filled" />}
              onClick={onOpenRow}
            >
              {`${translate('cloud.open')}`}
            </Button>
            <Button
              sx={{ width: '60%' }}
              variant="soft"
              color="success"
              // size="small"
              startIcon={<Iconify icon="ant-design:comment-outlined" />}
              onClick={() => handleCommentEditor(true)}
            >
              {`${translate('nav.discussion')}`}
            </Button>
          </Stack>

          <CommentEditor
            task={''}
            item={localState.data ? localState.data._id : ''}
            logType={(itemType === 'folder') ? LogType.Folder : LogType.File}
            link={window.location.href}
            title={localState.displayName}
            open={localState.openCommentEditor}
            onClose={() => handleCommentEditor(false)}
            groupsInFolder={localState.groupsInFolder}
            linkFolderId={null}
          />

          <ConfirmDialog {...localState.dataDialog} />
          
        </SwipeableDrawer>

      </React.Fragment>
    </>
  );
}

// ----------------------------------------------------------------------

interface PanelProps extends StackProps {
  label: string;
  toggle: boolean;
  onToggle: VoidFunction;
}

function Panel({ label, toggle, onToggle, ...other }: PanelProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type RowProps = {
  label: string;
  value: string;
};

function Row({ label, value = '' }: RowProps) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}
