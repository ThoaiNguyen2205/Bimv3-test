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
  Checkbox,
  FormControlLabel,
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
  copyPermit: boolean,
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

export default function CreateFolderTemplates({ open, onClose, onLoadFolders, getFolderTree, ...other }: Props) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
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
    copyPermit: false,
    isSubmitting: false,
    showProgress: false,
    eachProgress: 0,
    fullProgress: 0,
    files: null,
  });

  const handleCopy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      copyPermit: event.target.checked,
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDirectory = event.target.files;
    if (selectedDirectory) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: selectedDirectory }));
    }
  }

  const closeDialog = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, files: null }));
    onClose();
  }

  const handleCreate = async () => {
    if (selectedFolder === null) return;
    if (localState.files === null) return;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));

    // upload file to server
    const despath = selectedFolder.path + selectedFolder.storeName + '/';
    const file: File = localState.files[0];
    const fileSize = (file.size / (1024.0*1024.0)).toFixed(3);
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

    const folderVersion = selectedFolder.version;
    const param = {
      folder: selectedFolder._id,
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
      folder: selectedFolder._id,
      displayName: displayName + '.' + ext,
      storeFile: uploadedFile,
      size: fileSize,
      version: folderVersion,
      subVersion: subver,
      updatedBy: user?.id,
    }

    // Tạo mới dữ liệu files
    const newFileResponse = await filesApi.postCreate(newFile);

    const uri = process.env.REACT_APP_APIURL + '/files/download/' + newFileResponse._id;
    const response = await fetch(uri);
    const responseData = await response.json();

    // Tạo cây thư mục
    for (let i = 0; i < responseData.length; i++) {
      const createNode = async (node: any, father: IFolder) => {
        const label = node.label;
        const children = node.children;
        // Tạo thư mục
        const path = father.path + father.storeName + '/';
        const randomTag = Array(4)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        const uniqueDate = Date.now().toString(36);
        const newFolder: IFolderReqCreate = {
          customer: user?.customer._id,
          project: user?.project._id,
          path: path,
          displayName: label,
          storeName: removeAccents(label) + `-${randomTag + uniqueDate}`,
          createdBy: user?.id,
          updatedName: user?.username,
        }
        const createResponse = await foldersApi.postCreate(newFolder);
        if (createResponse) {
          if (localState.copyPermit === true) {
            // copy phân quyền từ cha
            const param = {
              folder: selectedFolder._id,
            }
            const folderGroups = await groupInFoldersApi.getGroupsInFolder(param);
            for (const group of folderGroups.data) {
              const newGroupInProjectData: IGroupInFolderReqCreate = {
                folder: createResponse._id,
                group: (group.group as IGroup)._id,
                isEdit: group.isEdit,
                isUpdate: group.isUpdate,
                isDownload: group.isDownload,
                isApprove: group.isApprove,
                isConfirm: group.isConfirm,
              }
              await groupInFoldersApi.postCreate(newGroupInProjectData);
            }
            
            const pathSplit = path.split('/');
            const lastFolder = pathSplit[pathSplit.length - 2];
            
            if (lastFolder === 'bn_wip' || lastFolder === 'bn_shared' || lastFolder === 'bn_public' || lastFolder === 'bn_archived') {
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
            }
          } else {
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
          }

          // dùng đệ quy tạo các thư mục con
          if (children.length > 0) {
            for (const nextNode of children) {
              await createNode(nextNode, createResponse);
            }
          }
        }
      }

      await createNode(responseData[i], selectedFolder);

      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        fullProgress: Math.round((100 * i) / (responseData.length -1)),
      }));
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    getFolderTree();
    onLoadFolders(selectedFolder._id);
    enqueueSnackbar(`${translate('cloud.create_folder_template_successfull')}`, {
      variant: 'success',
    })
    closeDialog();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('cloud.create_folder_at')} ${selectedFolder?.displayName}`} </DialogTitle>

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
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept='json'
            />
            {`${translate('cloud.select_file')}`}
          </label>
          {(localState.files !== null) ?
            <Typography variant='subtitle2' sx={{ ml: 2 }}>{`${localState.files[0].name} `}</Typography>
            : null
          }
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Checkbox defaultChecked onChange={handleCopy} />}
            label={`${translate('cloud.copy_father_permit')}`}
          />
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
          onClick={handleCreate}
        >
          {`${translate('cloud.create')}`}
        </LoadingButton>

      </DialogActions>
    </Dialog>
  );
}
