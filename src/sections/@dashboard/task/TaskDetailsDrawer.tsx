import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { varHover, varTranHover, IconButtonAnimate, varFade } from 'src/components/animate';
// @mui
import {
  Box,
  List,
  Stack,
  Drawer,
  SwipeableDrawer,
  Button,
  Divider,
  Typography,
  IconButton,
  StackProps,
  DrawerProps,
  CardActionArea,
  Tooltip
} from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import Image from 'src/components/image';
//
import CommentEditor from '../discussion/editor/CommentEditor';
import DiscussionItem from '../discussion/DiscussionItem';
import PermitItem from '../file/portal/PermitItem';
import { IFolder } from 'src/shared/types/folder';
// zustand store
import useFolder from 'src/redux/foldersStore';
import useDiscussion from 'src/redux/discussionStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from 'src/locales';
// Type
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import { IMainTask } from 'src/shared/types/mainTask';
import { IUser } from 'src/shared/types/user';
import { IGroup } from 'src/shared/types/group';
// apis
import discussionsApi from 'src/api/discussionsApi';
// enums
import { LogType, TaskCategory } from 'src/shared/enums';
// utils
import { getLinkFromCategory } from 'src/utils/taskCategoryHelper';
import { PATH_DASHBOARD } from 'src/routes/paths';
// ----------------------------------------------------------------------

type ILocalState = {
  data: IMainTask | null;
  title: string;
  toggleProperties: boolean;
  togglePermission: boolean;
  toggleDiscussion: boolean;
  groupsInFolder: IGroupInFolder[];
  destination: string;
  openCommentEditor: boolean;
  hrefLink: string,
};

interface Props extends DrawerProps {
  item: IMainTask | null;
  onClose: VoidFunction;
  onOpenRow: VoidFunction;
}

export default function TaskDetailsDrawer({
  item,
  open,
  onClose,
  onOpenRow,
  ...other
}: Props) {
  const { translate } = useLocales();
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

  const data = item;
  const [localState, setLocalState] = useState<ILocalState>({
    data: null,
    title: '',
    toggleProperties: true,
    togglePermission: true,
    toggleDiscussion: true,
    groupsInFolder: [],
    destination: '',
    openCommentEditor: false,
    hrefLink: '',
  });
  
  useEffect(() => {
    const data = item;
    if (data === null) return;
    const loadDetailsInfo = async () => {
      let fatherId = data._id;
      const detailsInfo = await discussionsApi.getDetailsInfo(fatherId, 'task', 'trash');
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        data,
        groupsInFolder: detailsInfo.groups,
        destination: detailsInfo.strPath,
      }));
      setDiscussions(detailsInfo.discussions);
    }
    loadDetailsInfo();

    switch (data.category)
    {
      case TaskCategory.FileRequestCloud:
        setLocalState((prevState: ILocalState) => ({ ...prevState, title: `${translate('nav.request')}` }));
        break;
      case TaskCategory.ImageCollaboration:
        setLocalState((prevState: ILocalState) => ({ ...prevState, title: `${translate('task.image_collaboration')}` }));
        break;
      case TaskCategory.OfficeCollaboration:
        setLocalState((prevState: ILocalState) => ({ ...prevState, title: `${translate('task.office_collaboration')}` }));
        break;
      case TaskCategory.CadCollaboration:
        setLocalState((prevState: ILocalState) => ({ ...prevState, title: `${translate('task.cad_collaboration')}` }));
        break;
      case TaskCategory.ModelCollaboration:
        setLocalState((prevState: ILocalState) => ({ ...prevState, title: `${translate('task.model_collaboration')}` }));
        break;
    }

  }, [data]);

  const handleToggleProperties = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleProperties: !localState.toggleProperties }));
  };

  const handleTogglePermission = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, togglePermission: !localState.togglePermission }));
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

  useEffect(() => {
    if (localState.data !== null) {
      const link = getLinkFromCategory((localState.data.category as TaskCategory), localState.data._id);
      setLocalState((prevState: ILocalState) => ({ ...prevState, hrefLink: link }));
    }
  }, []);

  const jumptoFilePath = async () => {
    const folderId = (localState.data?.folder as IFolder)._id;
    router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${folderId}`);
  }

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
              {localState.title}
            </Typography>
          </Stack>
          
          <Scrollbar sx={{ height: 1 }}>
            <Stack
              spacing={2.5}
              justifyContent="center"
              sx={{ p: 2.5, bgcolor: 'background.neutral' }}
            >
              <NextLink href={localState.hrefLink} passHref>
                <CardActionArea
                  component={m.div}
                  whileHover="hover"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    color: 'primary.main',
                    bgcolor: 'background.neutral',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Stack alignItems="center" spacing={1} >
                    <m.div variants={varHover(1.01)} transition={varTranHover()}>
                      <Image
                        alt={localState.data ? localState.data.category : ''}
                        src={`${process.env.REACT_APP_APIFILE}images/${localState.data ? localState.data.logo: ''}`}
                        sx={{ height: '200px', borderRadius: 1 }}
                      />
                    </m.div>
                  </Stack>
                </CardActionArea>
              </NextLink>

              <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
                {localState.data ? localState.data.name : ''}
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
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('common.description')}:`}
                      </Box>
                      {localState.data ? localState.data.description : ''}
                    </Stack>
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('cloud.update')}:`}
                      </Box>
                      {localState.data ? fDate(localState.data?.updatedAt): ''}
                    </Stack>
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('common.createdby')}:`}
                      </Box>
                      {localState.data ? (localState.data?.createdBy as IUser).username : ''}
                    </Stack>
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('nav.group')}:`}
                      </Box>
                      {localState.data ? `${(localState.data.createdGroup as IGroup).groupname} - ${(localState.data.createdGroup as IGroup).title}` : ''}
                    </Stack>
                    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                        {`${translate('cloud.folder')}:`}
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
                    <Stack direction="row" alignItems="center" alignContent="center" textAlign="center" alignSelf="center">
                      {localState.data?.isEdit ?
                        <Tooltip title={`${translate('common.edit')}`} placement='top'>
                          <Iconify icon="iconamoon:edit-fill" color='primary.main' width={20} height={20} sx={{ mr: 2 }} />
                        </Tooltip>
                        : null
                      }
                      {localState.data?.isUpdate ? 
                        <Tooltip title={`${translate('common.update')}`} placement='top'>
                          <Iconify icon="dashicons:update" color='info.main' width={20} height={20} sx={{ mr: 2 }} />
                        </Tooltip>
                        : null
                      }
                      {localState.data?.isDownload ? 
                        <Tooltip title={`${translate('common.download')}`} placement='top'>
                          <Iconify icon="ic:round-download" color='warning.main' width={20} height={20} sx={{ mr: 2 }} />
                        </Tooltip>
                        : null
                      }
                      {localState.data?.isConfirm ? 
                        <Tooltip title={`${translate('common.confirm')}`} placement='top'>
                          <Iconify icon="mdi:approve" color='secondary.light' width={20} height={20} sx={{ mr: 2 }} />
                        </Tooltip>
                        : null
                      }
                      {localState.data?.isApprove ? 
                        <Tooltip title={`${translate('common.approve')}`} placement='top'>
                          <Iconify icon="carbon:task-approved" color='error.main' width={20} height={20} sx={{ mr: 2 }} />
                        </Tooltip>
                        : null
                      }
                    </Stack>
                  </Stack>
                )}
              </Stack>

            </Stack>
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
            </Stack>
            
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
                      <DiscussionItem key={discuss._id} discussion={discuss} isConfirm={false} />
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
              // size="large"
              startIcon={<Iconify icon="fluent:open-16-filled" />}
              onClick={onOpenRow}
            >
              {`${translate('cloud.open')}`}
            </Button>
            <Button
              sx={{ width: '60%' }}
              variant="soft"
              color="success"
              // size="large"
              startIcon={<Iconify icon="ant-design:comment-outlined" />}
              onClick={() => handleCommentEditor(true)}
            >
              {`${translate('nav.discussion')}`}
            </Button>
          </Stack>

          <CommentEditor
            task={data ? data._id : ''}
            item={data ? data._id : ''}
            logType={LogType.Task}
            link={window.location.href}
            title={`${localState.title}: ${localState.data?.name}`}
            open={localState.openCommentEditor}
            onClose={() => handleCommentEditor(false)}
            groupsInFolder={localState.groupsInFolder}
            linkFolderId={data ? (data.folder as IFolder)._id : null}
          />
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
