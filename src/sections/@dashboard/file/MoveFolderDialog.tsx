//react
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Card,
  FormControlLabel,
  Checkbox,
  Grid,
  Table,
  Tooltip,
  TableBody,
  Typography,
  Container,
  IconButton,
  TableContainer,
  Stack,
  LinearProgress,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TransferType, UserClassEnum } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
// type
import { IFolder, IFolderFullData, IFolderNodeData } from 'src/shared/types/folder';
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
import { IFile, IFileReqCreate } from 'src/shared/types/file';
// ----------------------------------------------------------------------

type ILocalState = {
  selectedFolder: IFolder | null,
  folderTree: IFolderNodeData[],
  fLinks: IFolder[],
  destination: string,
  copy: boolean,
  isSubmitting: boolean,
  showProgress: boolean,
  eachProgress: number,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  moveMode: string;
  moveFolder: IFolder | null;
  moveFile: IFile | null;
  moveItems: {id: string, type: string}[];
  fatherFolder: IFolder | null;
  fatherGetFolderTree: VoidFunction;
  fatherOnLoadFolders: (folderId: string) => void;
}

export default function MoveFolderDialog({
  open,
  onClose, 
  moveMode,
  moveFolder,
  moveFile,
  moveItems,
  fatherFolder,
  fatherGetFolderTree,
  fatherOnLoadFolders,
  ...other
}: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  let displayName = '';
  if (moveMode === 'folder') {
    displayName = (moveFolder as IFolder).displayName;
  } 
  if (moveMode === 'file') {
    displayName = (moveFile as IFile).displayName;
  }

  const [localState, setLocalState] = useState<ILocalState>({
    selectedFolder: null,
    folderTree: [],
    fLinks: [],
    destination: '',
    copy: true,
    isSubmitting: false,
    showProgress: false,
    eachProgress: 0,
  });

  const treeItemOnClick = async (nodeId: string) => {

    let uRole = user?.class.uclass;
    if (user?.projectrole === UserClassEnum.Admin) {
      uRole = user?.projectrole;
    }
    const folderFullData: IFolderFullData = await filesApi.getFullFolderData(nodeId, user?.id, uRole);

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedFolder: folderFullData.folder,
      fLinks: folderFullData.linkList,
    }));
    
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

      if (localState.selectedFolder === null) {
        if (projectFolderData[0] != undefined) {
          const folder = await foldersApi.getReadByIdWithUser(projectFolderData[0].nodeId, user?.id);
          treeItemOnClick(folder._id);
        }
      } else {
        treeItemOnClick(localState.selectedFolder._id);
      }
    }
  }, [
    user,
    localState.selectedFolder,
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

  const handleCopy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      copy: event.target.checked,
    }));
  };

  const movingFolder = async (fol: IFolder): Promise<IFolder | null> => {
    if (localState.selectedFolder !== null) {
      // Move thư mục
      const deleteData: DeleteData = {
        deletedByName: user?.username,
        deletedById: user?.id,
      }

      const moveFolderRes = await foldersApi.moveById(
        user?.customer._id,
        fol._id,
        localState.selectedFolder._id,
        (localState.copy === true) ? 'copy' : 'none',
        deleteData,
      );
      return moveFolderRes;
    } else {
      return null;
    }
  }

  const handleMoveFolder = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));
 
    if (moveFolder === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    // Trường hợp không copy cần kiểm tra có liên kết công việc hay không
    if (localState.copy === false) {
      // Kiểm tra thư mục có liên kết công viêc?!
      const checkRes = await foldersApi.checkLinkFolderById((moveFolder as IFolder)._id, user?.id, user?.class.uclass);
        
      if (checkRes !== '00000') {
        const tach: string[] = checkRes.split('$');
        for (const stri of tach) {
          if (stri.length > 2) {
            enqueueSnackbar(stri, {
              variant: "error",
              autoHideDuration: 10000,
              anchorOrigin: { vertical: "top", horizontal: "right" }
            });
          }
        }
        return;
      }
    }
    
    if (localState.selectedFolder === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    if (!localState.selectedFolder.isUpdate) {
      enqueueSnackbar(`${translate('cloud.unaccess_folder')}`, {variant: "warning"});
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }
    
    const moveFolderRes = await movingFolder(moveFolder);
    if (moveFolderRes) {
      enqueueSnackbar(`${translate('cloud.movefolder_success')}`, {variant: "success"});
    }

    fatherGetFolderTree();
    if (fatherFolder) fatherOnLoadFolders(fatherFolder?._id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
    onClose();
    
  }

  const movingFile = async (file: IFile) => {
    if (localState.selectedFolder !== null) {
      // Copy file gốc
      const desPath = localState.selectedFolder.path + localState.selectedFolder.storeName + '/';
      // copy physical file
      const copyFileObj = {
        originFile: file.fullPath + file.storeFile,
        destinationFile: desPath + file.storeFile
      }
      await filesApi.postCopyFile(copyFileObj);
      // Trường hợp file đã convert copy file convert
      if (file.convertFile !== undefined && file.convertFile !== null) {
        if (file.convertFile.includes('.pdf')) {
          const copyConvertFileObj = {
            originFile: file.fullPath + file.convertFile,
            destinationFile: desPath + file.convertFile
          }
          await filesApi.postCopyFile(copyConvertFileObj);
        }
      }
      
      // create file data
      const param = {
        folder: localState.selectedFolder._id,
        displayName: file.displayName,
      }
      const sameFiles = await filesApi.getAllSameFiles(param);           
      let subver = '01';
      if (sameFiles.length > 0) {
        const newest = sameFiles[0];
        const newsub = parseInt(newest.subVersion) + 1;
        if (newsub < 10) {
          subver = '0' + newsub.toString();
        } else {
          subver = newsub.toString();
        }
      }
      const newFile: IFileReqCreate = {
        project: user?.project._id,
        folder: localState.selectedFolder._id,
        displayName: file.displayName,
        storeFile: file.storeFile,
        size: file.size,
        version: file.version,
        subVersion: subver,
        convertFile: file.convertFile,
        thumbnail: file.thumbnail,
        updatedBy: user?.id,
      }
      const newFileResponse = await filesApi.postCreate(newFile);
      // Nếu move: xóa file gốc
      const deleteData: DeleteData = {
        deletedByName: user?.username,
        deletedById: user?.id,
      }
      if (localState.copy === false) {
        await filesApi.deleteById(file._id, deleteData);
      }

      // Ghi log
      const newLogs = {
        customer: user?.customer._id,
        father: user?.project._id,
        content: `${user?.username} di chuyển tập tin ${file.displayName} đến ${localState.destination}.`,
        type: LogType.File,
        actionLink: PATH_DASHBOARD.cloud.filesManager,
        createdBy: user?.id,
      };
      await logsApi.postCreate(newLogs);
    }
  }

  const handleMoveFile = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));
 
    if (moveFile === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }
    
    if (localState.selectedFolder === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    if (!localState.selectedFolder.isUpdate) {
      enqueueSnackbar(`${translate('cloud.unaccess_folder')}`, {variant: "warning"});
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    await movingFile(moveFile);

    enqueueSnackbar(`${translate('cloud.movefile_success')}`, {variant: "warning"});

    fatherGetFolderTree();
    if (fatherFolder) fatherOnLoadFolders(fatherFolder?._id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
    onClose();
  }

  const handleMoveItems = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
      eachProgress: 0,
    }));
 
    if (moveItems.length === 0) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
        showProgress: false,
        eachProgress: 0,
      }));
      return;
    }

    if (localState.selectedFolder === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    if (!localState.selectedFolder.isUpdate) {
      enqueueSnackbar(`${translate('cloud.unaccess_folder')}`, {variant: "warning"});
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
      return;
    }

    // Kiểm tra với trường hợp có folder hoặc có file:
    let hasFolder = false;
    let hasFile = false;
    let fileId = '';
    for (const item of moveItems) {
      if (item.type === 'folder') hasFolder = true;
      if (item.type === 'file') {
        hasFile = true;
        fileId = item.id;
      }
    }

    if (hasFolder) {
      // Trường hợp không copy cần kiểm tra có liên kết công việc hay không
      if (localState.copy === false) {
        // Kiểm tra thư mục có liên kết công viêc?!
        const checkRes = await foldersApi.checkLinkFolderById((moveFolder as IFolder)._id, user?.id, user?.class.uclass);
          
        if (checkRes !== '00000') {
          const tach: string[] = checkRes.split('$');
          for (const stri of tach) {
            if (stri.length > 2) {
              enqueueSnackbar(stri, {
                variant: "error",
                autoHideDuration: 10000,
                anchorOrigin: { vertical: "top", horizontal: "right" }
              });
            }
          }
          return;
        }
      }
      
    }

    let allfiles: IFile[] = [];
    if (hasFile) {
      const firstFileRes = await filesApi.getReadById(fileId);
      const param = {
        folder: (firstFileRes.folder as IFolder)._id,
      }
      allfiles = await filesApi.getAllLastedFilesInFolder(param);
    }

    let count = 0;
    for (const item of moveItems) {
      if (item.type === 'folder') {
        const folderRes = await foldersApi.getReadById(item.id);
        await movingFolder(folderRes);
      }
      if (item.type === 'file') {
        const fileFilter = allfiles.filter((e) => (e._id === item.id));
        if (fileFilter.length > 0) {
          await movingFile(fileFilter[0]);
        }
      }
      count += 1;
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: Math.round((100 * count) / (moveItems.length -1)),
      }));
    }

    fatherGetFolderTree();
    if (fatherFolder) fatherOnLoadFolders(fatherFolder?._id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    onClose();

  }

  const handleMove = () => {
    
    switch (moveMode) {
      case 'folder':
        handleMoveFolder();
        break;
      case 'file':
        if (localState.selectedFolder?.storeName.includes('bn_wip') ||
          localState.selectedFolder?.storeName.includes('bn_shared') ||
          localState.selectedFolder?.storeName.includes('bn_public') ||
          localState.selectedFolder?.storeName.includes('bn_archived')
        ) {
          enqueueSnackbar(`${translate('cloud.root_deny_upload')}`, {variant: "warning"});
          return;
        }
        handleMoveFile();
        break;
      case 'items':
        handleMoveItems();
        break;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('cloud.move')} ${displayName}`} </DialogTitle>

      <DialogContent>
        <Stack sx={{ paddingBottom: 1 }}>
          <Scrollbar sx={{ maxHeight: 425 }}>
            <TreeView
              aria-label="doc-categories"
              defaultExpandIcon={<Iconify icon={'bx:folder'} color="#ffc144" width={24} height={24} />}
              defaultEndIcon={<Iconify icon={'bxs:folder'} color="#ffc144" width={24} height={24} />}
              defaultCollapseIcon={<Iconify icon={'bx:folder-open'} color="#ffc144" width={24} height={24} />}
              sx={{ flexGrow: 1, overflowY: 'auto' }}
              selected={localState.selectedFolder ? localState.selectedFolder._id : ''}
            >
              { renderFoldersTree(localState.folderTree) }
            </TreeView>
          </Scrollbar>
          {localState.showProgress ?
            <Stack sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={localState.eachProgress} color="success" />
            </Stack>
            : 
            <></>
          }
        </Stack>
        
        <Stack
          spacing={1}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ md: 'center' }}
          sx={{ width: '100%', pb: 1 }}
        >
          <Typography variant='body2' color='default'> {`${translate('cloud.move_to')}`} </Typography>
          <Typography variant='body2' color='primary' noWrap> {localState.destination} </Typography>
        </Stack>

        <Stack>
          <FormControlLabel control={<Checkbox defaultChecked onChange={handleCopy} />} label={`${translate('cloud.create_copy')}`} />
          {(moveFolder !== null) ? 
            <Typography variant='caption'>
              <i>{`${translate('cloud.movefolder_notice')}`}</i>
            </Typography>
            : null
          }
        </Stack>
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
          startIcon={<Iconify icon="carbon:folder-move-to" />}
          onClick={handleMove}
        >
          {`${translate('cloud.move')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
