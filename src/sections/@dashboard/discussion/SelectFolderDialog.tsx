//react
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useCustomer from 'src/redux/customerStore';
import useProject from 'src/redux/projectStore';
import useTask from 'src/redux/taskStore';
import useProjectCategory from 'src/redux/projectCategoryStore';
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TransferType, UserClassEnum } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
// type
import { IFolder, IFolderNodeData } from 'src/shared/types/folder';
import { width } from '@mui/system';
// apis 
import foldersApi from 'src/api/foldersApi';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
import { IProject } from 'src/shared/types/project';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import { IGroupInFolderReqCreate } from 'src/shared/types/groupInFolder';
import { IGroup } from 'src/shared/types/group';
import filesApi from 'src/api/filesApi';
import { DeleteData } from 'src/shared/types/deleteData';
import logsApi from 'src/api/logsApi';
import { PATH_DASHBOARD } from 'src/routes/paths';
// helper
import { removeAccents } from 'src/shared/helpers/stringHelpers';
import { ISystemLogReqCreate } from 'src/shared/types/systemlog';
// ----------------------------------------------------------------------

type ILocalState = {
  folderTree: IFolderNodeData[],
  fLinks: IFolder[],
  destination: string,
  selectedFolder: IFolder | null,
  isSubmitting: boolean,
  newFolderName: string,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function SelectFolderDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  
  const {
    selectedFolder,
    setSelectedFolder,
    destination,
    setDestination,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
      setSelectedFolder: state.setSelectedData,
      destination: state.destination,
      setDestination: state.setDestination,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    folderTree: [],
    fLinks: [],
    destination: '',
    selectedFolder: null,
    isSubmitting: false,
    newFolderName: '',
  });

  const treeItemOnClick = async (nodeId: string) => {
    const selFolderResponse = await foldersApi.getReadByIdWithUser(nodeId, user?.id);

    // Chọn thư mục hiện hành
    setLocalState((prevState: ILocalState) => ({ ...prevState, selectedFolder: selFolderResponse }));

    // Tải dữ liệu đường dẫn thư mục
    const path = selFolderResponse.path + selFolderResponse.storeName + '/';
    
    const strs = path.split('/');
    let linkList: IFolder[] = [];
    let temp = strs[0] + '/' + strs[1] + '/';
    for (let i = 2; i < strs.length - 1; i++) {
      const tempFolder = await foldersApi.getFolderByPath(temp, strs[i]);
      if (tempFolder.data.length > 0) {
        const folderData = tempFolder.data[0];
        linkList.push(folderData);
      }
      temp = temp + strs[i] + '/';
    }
    setLocalState((prevState: ILocalState) => ({ ...prevState, fLinks: linkList }));
    
  };

  // Render folder tree
  const renderFoldersTree = (treeData: IFolderNodeData[]) => (
    treeData.map((folder) => (
      <StyledTreeFolder
        key={folder.nodeId}
        nodeId={folder.nodeId}
        labelText={folder.label}
        color={'#00AB55'}
        bgColor="#3be79036"
        colorForDarkMode={'#00AB55'}
        bgColorForDarkMode="#3be79036"
        onClick={() => (treeItemOnClick(folder.nodeId))}
      >
        {(folder.children.length > 0) ?
          <>
            {renderFoldersTree(folder.children)}
          </>
          : null
        }
      </StyledTreeFolder>
    ))
  );

  // Load folder tree data base on current user and project
  const getFolderTree = useCallback(async () => {
    if (user === null) return;
    
    // Lấy dữ liệu cây thư mục của dự án theo user
    if (user?.project !== null) {
      let userRole = UserClassEnum.User;
      if (user?.class.uclass === UserClassEnum.Admin || user?.projectrole === UserClassEnum.Admin) {
        userRole = UserClassEnum.Admin;
      }
      const projectFolderData: IFolderNodeData[] = await foldersApi.getProjectFolderTree(
        user?.customer._id,
        user?.project._id,
        user?.id,
        userRole,
      );
      setLocalState((prevState: ILocalState) => ({ ...prevState, folderTree: projectFolderData }));

      if (selectedFolder === null) {
        if (projectFolderData[0] != undefined) {
          const folder = await foldersApi.getReadByIdWithUser(projectFolderData[0].nodeId, user?.id);
          treeItemOnClick(folder._id);
        }
      } else {
        treeItemOnClick(selectedFolder._id);
      }
    }
  }, [
    user,
    selectedFolder,
  ]);

  useEffect(() => {
    getFolderTree();
  }, [user]);

  useEffect(() => {
    let str = '';
    for (const fi of localState.fLinks) {
      str += fi.displayName + '/';
    }
    str = str.substring(0, str.length - 1);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      destination: str,
    }));
  }, [localState.fLinks]);

  const handleSelectFolder = async () => {
    const wip = localState.selectedFolder?.storeName.includes('bn_wip');
    const shared = localState.selectedFolder?.storeName.includes('bn_shared');
    const publicFolder = localState.selectedFolder?.storeName.includes('bn_public');
    const archived = localState.selectedFolder?.storeName.includes('bn_archived');
    if (wip || shared || publicFolder || archived)
    {
      enqueueSnackbar(`${translate('cloud.root_deny')}`, {
        variant: 'info',
      });
      return;
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));
    setSelectedFolder(localState.selectedFolder);
    setDestination(localState.destination);

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
    onClose();
  }

  const updateFolderName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      newFolderName: event.target.value,
    }));
  }

  const createFolder = async () => {
    if (localState.selectedFolder === null) {
      enqueueSnackbar(`${translate('cloud.select_root_folder_required')}`, {
        variant: 'info',
      });
      return;
    }
    const wip = localState.selectedFolder?.storeName.includes('bn_wip');
    const shared = localState.selectedFolder?.storeName.includes('bn_shared');
    const publicFolder = localState.selectedFolder?.storeName.includes('bn_public');
    const archived = localState.selectedFolder?.storeName.includes('bn_archived');
    if (wip || shared || publicFolder || archived)
    {
      if (user?.class.uclass != UserClassEnum.Admin) {
        enqueueSnackbar(`${translate('cloud.root_user_create_deny')}`, {
          variant: 'info',
        });
        return;
      }
    }

    const path = localState.selectedFolder.path + localState.selectedFolder.storeName + '/';
    const randomTag = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const uniqueDate = Date.now().toString(36);
    const newFolder = {
      project: user?.project._id,
      path: path,
      displayName: localState.newFolderName,
      storeName: removeAccents(localState.newFolderName) + `-${randomTag + uniqueDate}`,
      createdBy: user?.id
    }

    const createResponse = await foldersApi.postCreate(newFolder);
    if (createResponse) {
      // Tạo phân quyền cho nhóm người dùng tạo thư mục
      const newGroupInProjectData: IGroupInFolderReqCreate = {
        folder: createResponse._id,
        group: user?.group._id,
        isEdit: true,
        isUpdate: true,
        isDownload: true,
        isApprove: true,
        isConfirm: true,
      }
      await groupInFoldersApi.postCreate(newGroupInProjectData);

      // Ghi log
      const logData: ISystemLogReqCreate = {
        customer: user?.customer._id,
        father: user?.project._id,
        content: `${user?.username} tạo thư mục mới ${createResponse.displayName}`,
        type: LogType.Folder,
        actionLink: '/dashboard/cloud/files-manager',
        createdBy: user?.id,
      }
      await logsApi.postCreate(logData);

      enqueueSnackbar(`${translate('cloud.created_folder_successfull')}`, {
        variant: 'info',
      });

      setSelectedFolder(createResponse);
      const desString = await foldersApi.getFolderListById(createResponse._id);
      setDestination(desString);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('task.select_folder')}`} </DialogTitle>

      <DialogContent>
        <Stack sx={{ paddingBottom: 1 }}>
          <Scrollbar sx={{ maxHeight: 425 }}>
            <TreeView
              aria-label="doc-categories"
              defaultExpandIcon={<Iconify icon={'bx:folder'} color="#ffc144" width={24} height={24} />}
              defaultEndIcon={<Iconify icon={'bxs:folder'} color="#ffc144" width={24} height={24} />}
              defaultCollapseIcon={<Iconify icon={'bx:folder-open'} color="#ffc144" width={24} height={24} />}
              sx={{ flexGrow: 1, overflowY: 'auto' }}
              selected={selectedFolder ? selectedFolder._id : ''}
            >
              { renderFoldersTree(localState.folderTree) }
            </TreeView>
          </Scrollbar>
        </Stack>
        <Stack
          spacing={1}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ md: 'center' }}
          sx={{ width: '100%', pb: 1 }}
        >
          <Typography variant='body2' color='default'> {`${translate('task.selected_folder')}: `} </Typography>
          <Typography variant='body2' color='primary' noWrap> {localState.destination} </Typography>
        </Stack>
        {(localState.selectedFolder?.isEdit) ?
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
            <TextField name="foldername" label={`${translate('cloud.new_folder')}`} size="small" onChange={updateFolderName}/>
            <Button variant="outlined" onClick={createFolder}>{`${translate('cloud.create')}`}</Button>
          </Stack>
          : null
        }
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onClose}
        >
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:folder-key" />}
          onClick={handleSelectFolder}
        >
          {`${translate('task.select')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
