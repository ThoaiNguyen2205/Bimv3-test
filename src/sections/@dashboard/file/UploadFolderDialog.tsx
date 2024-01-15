// react 
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { IFile, IFileReqCreate, IFileFolderUpload } from 'src/shared/types/file';
import filesApi from 'src/api/filesApi';
import { PATH_DASHBOARD } from 'src/routes/paths';
import logsApi from 'src/api/logsApi';
import { IFolder, IFolderPathReqCreate, IFolderReqCreate } from 'src/shared/types/folder';
import { removeAccents } from 'src/shared/helpers/stringHelpers';
import foldersApi from 'src/api/foldersApi';
import { IGroupInFolderReqCreate } from 'src/shared/types/groupInFolder';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import { IGroup } from 'src/shared/types/group';

// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  showProgress: boolean,
  eachProgress: number,
  fullProgress: number,
  files: FileList | null,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  onLoadFolders: (folderId: string) => void;
  getFolderTree: VoidFunction;
}

export default function UploadFolderDialog({ open, onClose, onLoadFolders, getFolderTree, ...other }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();

  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    showProgress: false,
    eachProgress: 0,
    fullProgress: 0,
    files: null,
  });

  const handleDirectoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDirectory = event.target.files;
    if (selectedDirectory) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: selectedDirectory }));
    }
  }

  const closeDialog = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, files: null }));
    onClose();
  }

  const handleUpload = async () => {
    if (selectedFolder === null) return;
    if (localState.files === null) return;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));

    // Tạo các thư mục cần thiết:
    const folderList: {folder: IFolder, path: string}[] = [];
    for (let i = 0; i < localState.files.length; i++) {
      const file: File = localState.files[i];
      const dir: string = file.webkitRelativePath;
      const fPath = dir.slice(0, dir.lastIndexOf('/'));
      const father = selectedFolder;
      const flist: string[] = fPath.split('/');

      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        eachProgress: (localState.files !== null) ? Math.round((100 * i) / (localState.files.length -1)) : 0,
      }));

      let lastFolder: IFolder = father;
      let scanPath = '';
      for (let k = 0; k < flist.length; k++) {
        scanPath = scanPath + flist[k] + '/';
        const ExistingFolder = folderList.filter((e) => e.path === scanPath);
        if (ExistingFolder.length < 1) {
          const randomTag = Array(4)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const uniqueDate = Date.now().toString(36);
          const fatherPath: string = lastFolder.path + lastFolder.storeName + '/';
          const newFolderData: IFolderReqCreate = {
            customer: user?.customer._id,
            project: user?.project._id,
            path: fatherPath,
            displayName: flist[k],
            storeName: removeAccents(flist[k]) + `-${randomTag + uniqueDate}`,
            createdBy: user?.id,
            updatedName: user?.username,
          };
          lastFolder = await foldersApi.postCreate(newFolderData);
          // Thêm phân quyền cho thư mục vừa tạo
          const param = {
            folder: father._id,
          }
          const folderGroups = await groupInFoldersApi.getGroupsInFolder(param);
          for (const group of folderGroups.data) {
            const newGroupInProjectData: IGroupInFolderReqCreate = {
              folder: lastFolder._id,
              group: (group.group as IGroup)._id,
              isEdit: group.isEdit,
              isUpdate: group.isUpdate,
              isDownload: group.isDownload,
              isApprove: group.isApprove,
              isConfirm: group.isConfirm,
            }
            await groupInFoldersApi.postCreate(newGroupInProjectData);
          }
          const rootPath = father.path + father.storeName + '/';
          const rootSplit = rootPath.split('/');
          const rootFolderString = rootSplit[rootSplit.length - 2];
          if (rootFolderString === 'bn_wip' || rootFolderString === 'bn_shared' || rootFolderString === 'bn_public' || rootFolderString === 'bn_archived') {
            // Tạo phân quyền cho nhóm người dùng tạo thư mục
            const newGroupInProjectData: IGroupInFolderReqCreate = {
              folder: lastFolder._id,
              group: user?.group._id,
              isEdit: true,
              isUpdate: true,
              isDownload: true,
              isApprove: true,
              isConfirm: true,
            }
            await groupInFoldersApi.postCreate(newGroupInProjectData);
          }
          folderList.push({
            folder: lastFolder,
            path: scanPath,
          });
        } else {
          lastFolder = ExistingFolder[0].folder;
        }
      }
    }
    // Upload files
    for (let i = 0; i < localState.files.length; i++) {
      const file: File = localState.files[i];
      const dir: string = file.webkitRelativePath;
      const fPath = dir.slice(0, dir.lastIndexOf('/')) + '/';
      
      const fFilter = folderList.filter((e) => e.path === fPath);
      
      if (fFilter.length > 0) {
        const fatherFolder = fFilter[0].folder;
        const despath = fatherFolder.path + fatherFolder.storeName + '/';
        const fileSize = (file.size / (1024.0*1024.0)).toFixed(3);
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          fullProgress: (localState.files !== null) ? Math.round((100 * i) / (localState.files.length -1)) : 0,
        }));
        const formData = new FormData(); 
        formData.append("file", file);
        const ufileResponse = await filesApi.upload(formData, despath, (e: any) => {
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            eachProgress: Math.round((100 * e.loaded) / e.total),
          }));
        });
        const uploadedFile = ufileResponse.filename;
        const displayName = uploadedFile.slice(0, uploadedFile.lastIndexOf('-'));
        const ext = uploadedFile.slice(uploadedFile.lastIndexOf('.') + 1);

        const folderVersion = fatherFolder.version;
        const param = {
          folder: fatherFolder._id,
          displayName: displayName + '.' + ext,
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
          folder: fatherFolder._id,
          displayName: displayName + '.' + ext,
          storeFile: uploadedFile,
          size: fileSize,
          version: folderVersion,
          subVersion: subver,
          updatedBy: user?.id,
        }
        // Tạo mới dữ liệu files
        const newFileResponse = await filesApi.postCreate(newFile);
      }
    }
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    getFolderTree();
    onLoadFolders(selectedFolder._id);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('cloud.upload_to')} ${selectedFolder?.displayName}`} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <Stack direction="row" alignItems="center" display="inline-flex" >
          <label style={{
            display: "inline-block",
            borderRadius: "7px",
            border: "1px solid #ccc",
            padding: "12px 24px",
            cursor: "pointer",
          }}>
            <input
              type="file"
              //@ts-ignore
              webkitdirectory="" // This is required for directory input
              onChange={handleDirectoryChange}
              style={{ display: "none" }}
            />
            {`${translate('cloud.select_folder')}`}
          </label>
          {(localState.files !== null) ?
            <Typography variant='subtitle2' sx={{ ml: 2 }}>{`${translate('cloud.total_files')} ${translate('cloud.file')}: ${localState.files.length} `}</Typography>
            : null
          }
        </Stack>
        {localState.showProgress ?
          <Stack sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={localState.eachProgress} color="success" />
            <LinearProgress variant="determinate" value={localState.fullProgress} sx={{ mt: 1 }}/>
          </Stack>
          : 
          <></>
        }
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={closeDialog}
        >
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="carbon:folder-move-to" />}
          onClick={handleUpload}
        >
          {`${translate('cloud.upload')}`}
        </LoadingButton>

      </DialogActions>
    </Dialog>
  );
}
