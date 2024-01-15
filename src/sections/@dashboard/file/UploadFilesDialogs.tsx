// react 
import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { Upload } from 'src/components/upload';
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
import { IFile, IFileReqCreate } from 'src/shared/types/file';
import filesApi from 'src/api/filesApi';
import { PATH_DASHBOARD } from 'src/routes/paths';
import logsApi from 'src/api/logsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  showProgress: boolean,
  eachProgress: number,
  fullProgress: number,
  files: File[],
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  onLoadFolders: (folderId: string) => void;
}

export default function UploadFilesDialogs({ open, onClose, onLoadFolders, ...other }: Props) {
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
    files: [],
  });

  useEffect(() => {
    if (!open) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: [] }));
    }
  }, [open]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const allFiles = [...localState.files, ...newFiles];
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: allFiles }));
    },
    [localState.files]
  );

  const handleUpload = async () => {
    console.log(user);
    
    if (selectedFolder === null) return;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));

    const despath = selectedFolder.path + selectedFolder.storeName + '/';
    for (let i = 0; i < localState.files.length; i++) {
      const file: File = localState.files[i];
      const fileSize = (file.size / (1024.0*1024.0)).toFixed(3);

      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        fullProgress: Math.round((100 * i) / (localState.files.length -1)),
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
    }
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    onLoadFolders(selectedFolder._id);
    onClose();
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const filtered = localState.files.filter((file) => file !== inputFile);
    setLocalState((prevState: ILocalState) => ({ ...prevState, files: filtered }));
  };

  const handleRemoveAllFiles = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, files: [] }));
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('cloud.upload_to')} ${selectedFolder?.displayName}`} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <Upload multiple files={localState.files} onDrop={handleDrop} onRemove={handleRemoveFile} />
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
          onClick={onClose}
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

        {!!localState.files.length && (
          <Button variant="outlined" color="inherit" onClick={handleRemoveAllFiles}>
            {`${translate('cloud.remove_all')}`}
          </Button>
        )}

      </DialogActions>
    </Dialog>
  );
}
