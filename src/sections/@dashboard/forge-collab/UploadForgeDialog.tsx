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
  Typography,
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
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TaskCategory, TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { IFile, IFileReqCreate } from 'src/shared/types/file';
import filesApi from 'src/api/filesApi';
import { PATH_DASHBOARD } from 'src/routes/paths';
import logsApi from 'src/api/logsApi';
import { IFolder } from 'src/shared/types/folder';
import { IForgeObject, IForgeObjectReqCreate, ICollaborationTaskData, IForgeObjectData } from 'src/shared/types/forgeObject';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
import forgesApi from 'src/api/forgesApi';
import { IForgeManifest, IForgeModel } from 'src/shared/types/forgeToken';
import { OfficeFiles, CadFiles, ImageFiles, ModelFiles, GlbFiles } from 'src/sections/utis/FileTypeAccept';
// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  showProgress: boolean,
  eachProgress: number,
  fullProgress: number,
  info: string,
  files: File[],
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function UploadForgeDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const {
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
  } = useForgeViewState(
    (state) => ({
      isSplit: state.isSplit,
      setIsSplit: state.setIsSplit,
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      subLoading: state.subLoading,
      setSubLoading: state.setSubLoading,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      firstSubObject: state.firstSubObject,
      setFirstSubObject: state.setFirstSubObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
      forgeViewer: state.forgeViewer,
      setForgeViewer: state.setForgeViewer,
      subViewer: state.subViewer,
      setSubViewer: state.setSubViewer,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    showProgress: false,
    eachProgress: 0,
    fullProgress: 0,
    info: `${translate('cloud.first_converting')}`,
    files: [],
  });

  useEffect(() => {
    if (!open) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: [] }));
    }
  }, [open]);


  const dropAcceptedFiles = (newFiles: File[], acceptList: string[]): File[] => {
    const selFiles: File[] = [];
    for (const file of newFiles) {
      const ext = file.name.slice(file.name.lastIndexOf('.') + 1);
      if (acceptList.filter(e => e.includes(ext.toLowerCase())).length > 0) {
        selFiles.push(file);
      }
    }
    return selFiles;
  }

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      let selFiles: File[] = [];
      switch (currentTask?.category) {
        case TaskCategory.ImageCollaboration:
          selFiles = dropAcceptedFiles(newFiles, ImageFiles);
          break;
        case TaskCategory.OfficeCollaboration:
          selFiles = dropAcceptedFiles(newFiles, OfficeFiles);
          break;
        case TaskCategory.CadCollaboration:
          selFiles = dropAcceptedFiles(newFiles, CadFiles);
          break;
        case TaskCategory.ModelCollaboration:
          selFiles = dropAcceptedFiles(newFiles, ModelFiles);
          break;
        // case TaskCategory.GlbCollaboration:
        //   selFiles = dropAcceptedFiles(newFiles, GlbFiles);
        //   break;
      }
      const allFiles = [...localState.files, ...selFiles];
      setLocalState((prevState: ILocalState) => ({ ...prevState, files: allFiles }));
    },
    [localState.files]
  );

  const loadTaskData = async () => {
    if (user === null) return;
    let urlParams = new URLSearchParams(window.location.search);
    let taskParam = urlParams.get('task');
    if (taskParam) {
      const taskData: ICollaborationTaskData = await forgeObjectsApi.getCollaborationTaskData(taskParam, user.id, user.class.uclass, user.customer._id);
      setForgeObjectData(taskData.forgeObjectData);
      if (taskData.forgeObjectData.length > 0) {
        setFirstObject(taskData.forgeObjectData[0].forgeObject);
        setSelectedObject(taskData.forgeObjectData[0].forgeObject);
      }
    }
  };

  const upLoadImage = async (file: IFile) => {
    if (currentTask === null) return;
    // Tạo forgeObject liên kết đến file
    const objData: IForgeObjectReqCreate = {
      task: currentTask._id,
      urn: (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile,
      file: file._id,
      text: file.displayName,
      displayName: file.displayName,
      xform: '',
      version: file.version,
      subVersion: file.subVersion,
      checked: true,
      updatedBy: user?.id,
      createdGroup: user?.group._id,
    }
    const newForgeObj = await forgeObjectsApi.postCreate(objData);
  }

  const upLoadOffice = async (file: IFile) => {
    if (currentTask === null) return;
    const ext = file.displayName.slice(file.displayName.lastIndexOf('.') + 1);
    if (ext.toLowerCase() !== 'pdf') {
      await forgeObjectsApi.convetOfficeToPdf(file._id);
    }
    const urn = (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile;
    const name = urn.slice(0, urn.lastIndexOf('.'));
    const outputPath = name + '.pdf';
    // Tạo forgeObject liên kết đến file
    const objData: IForgeObjectReqCreate = {
      task: currentTask._id,
      urn: outputPath,
      file: file._id,
      text: file.displayName,
      displayName: file.displayName,
      xform: '',
      version: file.version,
      subVersion: file.subVersion,
      checked: true,
      updatedBy: user?.id,
      createdGroup: user?.group._id,
    }
    
    const newForgeObj = await forgeObjectsApi.postCreate(objData);
  }

  const upLoadCad = async (file: IFile) => {
    if (currentTask === null) return;
    enqueueSnackbar(`${translate('cloud.convert_upload_message')}`, {
      variant: "info",
      autoHideDuration: 10000,
      anchorOrigin: { vertical: "bottom", horizontal: "center" }
    });

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isLoading: true,
    }));

    // =========================
    const fileData = await filesApi.getReadById(file._id);
    const uploadedFile = (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;

    // Tạo bucket tương ứng thư mục nếu chưa có
    try {
      await forgesApi.getBucketDetails((fileData.folder as IFolder)._id);
    } catch {
      await forgesApi.createBucket((fileData.folder as IFolder)._id);
    }
    
    // Kiểm tra model dã upload lên Forge hay chưa? Nếu chưa upload lên Forge
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      info: 'Đọc dữ liệu chuyển đổi'
    }));
    let urn = '';
    const modelsRes: IForgeModel[] = await forgesApi.getModels((fileData.folder as IFolder)._id);
    for (const bli of modelsRes) {
      if (bli.text === fileData.storeFile) {
        urn = bli.id;
      }
    }
    
    if (urn === '') {
      // Upload to Autodesk Forge:
      const uploadToForge = await forgesApi.uploadLargeModelFromServer({
        bucket: (fileData.folder as IFolder)._id,
        object: fileData.storeFile,
        filepath: uploadedFile
      });
      while (urn === '') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const blist = await forgesApi.getModels((fileData.folder as IFolder)._id);
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          info: localState.info + '.'
        }));
        for (const bli of blist) {
          if (bli.text === fileData.storeFile) {
            urn = bli.id;
          }
        }
      }
    }
    
    if (urn !== '') {
      // Translate model 
      let manifest: IForgeManifest = await forgesApi.getModelManifest(urn);      
      if (manifest.status.toString() !== 'success') {
        await forgesApi.translateModel(urn);
      }

      while (manifest.status.toString() !== 'success' && manifest.status.toString() !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        manifest = await forgesApi.getModelManifest(urn);
        
        if (manifest.progress !== undefined) {
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            info: 'Chuyển đổi ' + manifest.progress.toLowerCase().replace(' complete', '')
          }));
        }
      }
      if (manifest.status.toString() === 'failed') {
        enqueueSnackbar(`${translate('cloud.convert_failed')}`, {
          variant: "error",
          autoHideDuration: 5000,
          anchorOrigin: { vertical: "bottom", horizontal: "center" }
        });
      }
      if (manifest.status.toString() === 'success') {
        await filesApi.updateById(file._id, { convertFile: manifest.urn });

        // Tạo forgeObject liên kết đến file
        const objData: IForgeObjectReqCreate = {
          task: currentTask._id,
          urn: urn,
          file: file._id,
          text: file.displayName,
          displayName: file.displayName,
          xform: '',
          version: file.version,
          subVersion: file.subVersion,
          checked: true,
          updatedBy: user?.id,
          createdGroup: user?.group._id,
        }
        
        const newForgeObj = await forgeObjectsApi.postCreate(objData);
      }
    }

    // const ext = file.displayName.slice(file.displayName.lastIndexOf('.') + 1);
    // if (ext.toLowerCase() !== 'pdf') {
    //   await forgeObjectsApi.convetOfficeToPdf(file._id);
    // }

    // const urn = (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile;
    // const name = urn.slice(0, urn.lastIndexOf('.'));
    // const outputPath = name + '.pdf';
    // =========================
    
    
  }

  const handleUpload = async () => {
    if (currentTask === null) return;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));

    const selectedFolder = currentTask.folder as IFolder;
    
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
      if (newFileResponse) {
        switch (currentTask?.category) {
          case TaskCategory.ImageCollaboration:
            await upLoadImage(newFileResponse);
            break;
          case TaskCategory.OfficeCollaboration:
            await upLoadOffice(newFileResponse);
            break;
          case TaskCategory.CadCollaboration:
            await upLoadCad(newFileResponse);
            break;
          case TaskCategory.ModelCollaboration:
            await upLoadCad(newFileResponse);
            break;
          // case TaskCategory.GlbCollaboration:
          //   await upLoadImage(newFileResponse);
          //   break;
        }
      }
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    await loadTaskData();
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
      <DialogTitle> {`${translate('cloud.upload_to')} ${currentTask?.name}`} </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        <Upload multiple files={localState.files} onDrop={handleDrop} onRemove={handleRemoveFile} />
        {localState.showProgress ?
          <Stack sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={localState.eachProgress} color="success" />
            <LinearProgress variant="determinate" value={localState.fullProgress} sx={{ mt: 1 }}/>
            <Typography variant='caption' sx={{ mt: 1 }} ><i>{`${localState.info}`}</i></Typography>
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
