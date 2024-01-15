import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  List,
  Stack,
  Drawer,
  Button,
  Divider,
  Typography,
  IconButton,
  StackProps,
  DrawerProps,
} from '@mui/material';
// utils
import { fDate} from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import FileThumbnail, { fileFormat } from '../../../../components/file-thumbnail';
//
import PermitItem from '../../file/portal/PermitItem';
import HistoryItem from '../../file/portal/HistoryItem';
import DiscussionItem from '../../discussion/DiscussionItem';
// zustand store
import useHistoryFiles from 'src/redux/historyFilesStore';
import useDiscussion from 'src/redux/discussionStore';
import { shallow } from 'zustand/shallow';
// Locales
import { useLocales } from 'src/locales';
// type
import { IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
// apis
import discussionsApi from 'src/api/discussionsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  toggleProperties: boolean;
  togglePermission: boolean;
  toggleVersion: boolean;
  toggleDiscussion: boolean;
  groupsInFolder: IGroupInFolder[];
  openCommentEditor: boolean;
  destination: string;
};

interface Props extends DrawerProps {
  item: IFolder | IFile | null;
  itemType: string;
  onClose: VoidFunction;
  onRestoreRow: VoidFunction;
  onDeleteRow: VoidFunction;
}

export default function TrashDetailsDrawer({
  item,
  itemType,
  open,
  onClose,
  onRestoreRow,
  onDeleteRow,
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
    historyFiles,
    setHistoryFiles,
  } = useHistoryFiles(
    (state) => ({
      historyFiles: state.datas,
      setHistoryFiles: state.setDatas,
    }),
    shallow
  );

  const data = item;
  const displayName = (itemType === 'folder') ? (data as IFolder).displayName : (data as IFile).displayName;
  const updatedAt = (itemType === 'folder') ? (data as IFolder).updatedAt : (data as IFile).updatedAt;
  const size = (itemType === 'folder') ? '...' : (data as IFile).size;
  const version = (itemType === 'folder') ? (data as IFolder).version : `${(data as IFile).version}.${(data as IFile).subVersion}`;

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

  const [localState, setLocalState] = useState<ILocalState>({
    toggleProperties: true,
    togglePermission: true,
    toggleVersion: true,
    toggleDiscussion: true,
    groupsInFolder: [],
    openCommentEditor: false,
    destination: '',
  });
  
  useEffect(() => {
    const loadDetailsInfo = async () => {
      let fatherId = '';
      if (itemType === 'folder') {
        fatherId = (data as IFolder)._id;
      } else {
        fatherId = (data as IFile)._id;
      }
      const detailsInfo = await discussionsApi.getDetailsInfo(fatherId, itemType, 'trash');
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        groupsInFolder: detailsInfo.groups,
        destination: detailsInfo.strPath,
      }));
      setHistoryFiles(detailsInfo.histories);
      setDiscussions(detailsInfo.discussions);
    }
    loadDetailsInfo();
  }, [data]);

  const handleToggleProperties = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleProperties: !localState.toggleProperties }));
  };

  const handleTogglePermission = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, togglePermission: !localState.togglePermission }));
  };

  const handleToggleVersion = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleVersion: !localState.toggleVersion }));
  };

  const handleToggleDiscussion = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, toggleDiscussion: !localState.toggleDiscussion }));
  };

  const handleDelete = () => {
    onDeleteRow();
    onClose();
  }

  const handleRestore = () => {
    onRestoreRow();
    onClose();
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
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
        </Stack>
        
        <Scrollbar sx={{ height: 1 }}>
          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{ p: 2.5, bgcolor: 'background.neutral' }}
          >
            <FileThumbnail
              imageView
              file={itemType === 'folder' ? itemType : url}
              sx={{ width: 64, height: 64 }}
              imgSx={{ borderRadius: 1 }}
            />

            <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
              {displayName}
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
                  <Stack spacing={1.5}>
                    <Row label={`${translate('cloud.version')}:`} value={version} />
                    <Row label={`${translate('cloud.size')}:`} value={size + ' (Mb)'} />
                    <Row label={`${translate('cloud.update')}:`} value={fDate(updatedAt)} />
                    <Row label="Type" value={fileFormat(dataType)} />
                  </Stack>
                  <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
                    <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
                      {`${translate('cloud.path')}:`}
                    </Box>
                    {localState.destination}
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
                          isUpdate={false}
                          isDownload={true}
                          treeItemOnClick={() => {}}
                          onPreviewFile={() => {}}
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
                    <DiscussionItem key={discuss._id} discussion={discuss} isConfirm={false} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>

        </Scrollbar>

        <Stack sx={{ p: 1.5 }} direction='row' spacing={2} >
          <Button
            sx={{ width: '50%' }}
            variant="soft"
            color="success"
            size="large"
            startIcon={<Iconify icon="ic:round-restore" />}
            onClick={handleRestore}
          >
            {`${translate('cloud.restore')}`}
          </Button>
          <Button
            sx={{ width: '50%' }}
            variant="soft"
            color="error"
            size="large"
            startIcon={<Iconify icon="tabler:trash-off" />}
            onClick={handleDelete}
          >
            {`${translate('cloud.delete_trash')}`}
          </Button>
        </Stack>
      </Drawer>

      <></>
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
