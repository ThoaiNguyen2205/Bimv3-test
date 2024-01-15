// react 
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import { useTheme, styled, alpha } from '@mui/material/styles';
// react-player
import ReactPlayer from 'react-player/lazy';
//
import Image from 'src/components/image/Image';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { Upload } from 'src/components/upload';
import FormProvider from 'src/components/hook-form/FormProvider';
// form
import { useForm, Controller } from 'react-hook-form';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TransferType } from 'src/shared/enums';
// file type
import { OfficeFiles, ModelFiles, CadFiles, ImageFiles, VideoFiles } from 'src/sections/utis/FileTypeAccept';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { IFile, IFileReqCreate } from 'src/shared/types/file';
import { IBucket, IForgeManifest, IForgeModel, IForgeToken } from 'src/shared/types/forgeToken';
import filesApi from 'src/api/filesApi';
import { PATH_DASHBOARD } from 'src/routes/paths';
import logsApi from 'src/api/logsApi';
import forgesApi from 'src/api/forgesApi';
import { IFolder } from 'src/shared/types/folder';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import { union } from 'lodash';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
import { exit } from 'process';
import ForgeContainer from 'src/containers/forge/forge.container';
import useForgeViewState from 'src/redux/forgeViewStore';
import PreviewForgeComponent from './PreviewForgeComponent';
import { IUser } from 'src/shared/types/user';
import usersApi from 'src/api/usersApi';
// ----------------------------------------------------------------------

const PreviousStyled = styled('div')(({ theme }) => ({
  left: 24,
  zIndex: 9,
  bottom: '50%',
  display: 'flex',
  position: 'fixed',
  alignItems: 'center',
  color: 'white',
}));

const NextStyled = styled('div')(({ theme }) => ({
  right: 24,
  zIndex: 9,
  bottom: '50%',
  display: 'flex',
  position: 'fixed',
  alignItems: 'center',
  color: 'white',
}));

type ILocalState = {
  isLoading: boolean,
  previousId: string,
  nextId: string,
  nonePreview: boolean,
  fileName: string,
  convertFile: string,
  isPdf: boolean,
  isImage: boolean,
  isOffice: boolean,
  isForge: boolean,
  isVideo: boolean,
  showTranslate: boolean,
  info: string,
  previewUrn: string,
  //
  confirmedBy: IUser | null,
  approvedBy: IUser | null,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  fileId: string;
  files: IFile[];
}

export default function PreviewFileDialog({ open, onClose, fileId, files, ...other }: Props) {
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const methods = useForm({});
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isLoading: true,
    previousId: '',
    nextId: '',
    nonePreview: true,
    fileName: '',
    convertFile: '',
    isPdf: false,
    isImage: false,
    isOffice: false,
    isForge: false,
    isVideo: false,
    showTranslate: false,
    info: `${translate('cloud.first_converting')}`,
    previewUrn: '',
    //
    confirmedBy: null,
    approvedBy: null,
  });
  
  const closeDialog  = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isLoading: true,
      nonePreview: true,
      fileName: '',
      convertFile: '',
      isPdf: false,
      isImage: false,
      isOffice: false,
      isForge: false,
      showTranslate: false,
    }));
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      previewUrn: '',
    }));
    onClose();
  }

  const goPreNext = (fileId: string) => {
    if (fileId !== '') {
      const index = files.indexOf(files.filter((e) => e._id === fileId)[0]);
      
      let pre = '';
      let next = '';
      if (index > 0) {
        pre = files[index - 1]._id;
      }
      if (index < files.length - 1) {
        next = files[index + 1]._id;
      }
      loadFile(fileId, pre, next);
    }
  }

  const loadFile = useCallback(async (file: string, pre: string, next: string) => {
    if (file !== '') {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isLoading: true,
        nonePreview: true,
        fileName: '',
        convertFile: '',
        isPdf: false,
        isImage: false,
        isOffice: false,
        isForge: false,
        showTranslate: false,
      }));

      const fileData = await filesApi.getReadById(file);
      const storeFile = fileData.storeFile;
      const fileName = fileData.displayName;
      const ext = storeFile.slice(storeFile.lastIndexOf('.') + 1).toLowerCase();

      let nonePreview = true;
      let convertFile = fileData.convertFile;

      const isPdf = ext === 'pdf';
      if (isPdf) {
        convertFile = process.env.REACT_APP_APIFILE + 'projects/' + (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;
        nonePreview = false;
      }

      const isImage = ImageFiles.includes(ext);
      if (isImage) {
        convertFile = process.env.REACT_APP_APIFILE + 'projects/' + (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;
        nonePreview = false;
      }

      const isOffice = OfficeFiles.includes(ext);
      if (isOffice) {
        if (convertFile === '') {
          await forgeObjectsApi.convetOfficeToPdf(file);
        }
        const urn = process.env.REACT_APP_APIFILE + 'projects/' + (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;
        const name = urn.slice(0, urn.lastIndexOf('.'));
        convertFile = name + '.pdf';
        nonePreview = false;
      }
      
      const isVideo = VideoFiles.includes(ext);
      if (isVideo) {
        convertFile = process.env.REACT_APP_APIFILE + 'projects/' + (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;
        nonePreview = false;
      }

      const forgeFiles = union(CadFiles, ModelFiles);
      const isForge = forgeFiles.includes(ext);
      let showTranslate = false;
      
      if (isForge) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          previewUrn: convertFile,
        }));
        if (convertFile === '') {
          showTranslate = true;
        }
        nonePreview = false;
      }

      // Bổ sung tải dữ liệu người thẩm tra và phê duyệt
      let confirmUsername: IUser | null = null;
      let approveUsername: IUser | null = null;
      if (fileData.confimedBy) {
        confirmUsername = await usersApi.getReadById(fileData.confimedBy);
      }
      if (fileData.approvedBy) {
        approveUsername = await usersApi.getReadById(fileData.approvedBy);
      }
      

      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isLoading: false,
        previousId:  pre,
        nextId: next,
        nonePreview: nonePreview,
        fileName: fileData.displayName,
        convertFile,
        isPdf,
        isImage,
        isOffice,
        isForge,
        isVideo,
        showTranslate,
        confirmedBy: confirmUsername,
        approvedBy: approveUsername,
      }));
    }
  }, []);

  useEffect(() => {
    goPreNext(fileId);
  }, [open]);

  const convertModel = async () => {
    enqueueSnackbar(`${translate('cloud.convert_message')}`, {
      variant: "info",
      autoHideDuration: 10000,
      anchorOrigin: { vertical: "bottom", horizontal: "center" }
    });

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isLoading: true,
    }));

    const fileData = await filesApi.getReadById(fileId);
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
        // await new Promise(resolve => setTimeout(resolve, 5000));
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
        // await new Promise(resolve => setTimeout(resolve, 1000));
        manifest = await forgesApi.getModelManifest(urn);
        if (manifest.progress !== undefined) {
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            info: 'Chuyển đổi ' + manifest.progress.replace(' complete', '')
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
        await filesApi.updateById(fileId, { convertFile: manifest.urn });
      }
    }

    goPreNext(fileId);
  }

  return (
    <Dialog fullScreen maxWidth="xl" open={open} onClose={onClose} {...other} >
      <DialogContent dividers sx={{ pt: 1, pb: 0, border: 'none' }}>
        {(localState.confirmedBy !== null) ?
          <Stack direction="column" alignItems="center" sx={{ top: 16, left: 16, position: 'absolute', zIndex: 2 }} >
            <Stack 
              direction="column"
              alignItems="center"
              sx={{
                p: 1,
                border: 'solid 1px blue',
                borderRadius: 1,
                color: 'secondary.main',
                textTransform: 'capitalize'
              }}
            >
              <Tooltip title={`${localState.confirmedBy.username}`} placement='top'>
                <Avatar
                  alt={localState.confirmedBy.username}
                  src={process.env.REACT_APP_APIFILE + `/images/${localState.confirmedBy.avatar}`}
                  sx={{ width: 30, height: 30 }}
                />
              </Tooltip>
              <Typography variant='caption'>
                {`${translate('common.confirmed')}`}
              </Typography>
            </Stack>
          </Stack>
          : null
        }
        {(localState.approvedBy !== null) ?
          <Stack direction="column" alignItems="center" sx={{ top: 16, right: 16, position: 'absolute', zIndex: 2 }} >
            <Stack 
              direction="column"
              alignItems="center"
              sx={{
                p: 1,
                border: 'solid 1px red',
                borderRadius: 1,
                color: 'error.main',
                textTransform: 'capitalize'
              }}
            >
              <Tooltip title={`${localState.approvedBy.username}`} placement='top'>
                <Avatar
                  alt={localState.approvedBy.username}
                  src={process.env.REACT_APP_APIFILE + `/images/${localState.approvedBy.avatar}`}
                  sx={{ width: 30, height: 30 }}
                />
              </Tooltip>
              <Typography variant='caption'>
                {`${translate('common.approved')}`}
              </Typography>
            </Stack>
          </Stack>
          : null
        }

        <PreviousStyled>
          <IconButton
            color="primary"
            onClick={() => goPreNext(localState.previousId)}
            sx={{ mr: 2 }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" color={'primary'} />
          </IconButton>
        </PreviousStyled>
        <NextStyled>
          <IconButton
            color="primary"
            onClick={() => goPreNext(localState.nextId)}
            sx={{ mr: 2 }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" color={'primary'} />
          </IconButton>
        </NextStyled>
        <Box sx={{ height: 'calc(100vh - 60px)' }}>
          {localState.isLoading ?
            <LoadingWindow />
          :
            <>
              {localState.isImage ? 
                <Image src={localState.convertFile} sx={{ height: '100%', objectFit: 'contain' }} />
                : null
              }

              {(localState.isPdf || localState.isOffice) ? 
                <iframe src={localState.convertFile} width='100%' height='100%' frameBorder="0"></iframe>
                : null
              }

              {localState.isForge ? 
                <Box id='center' sx={{ display: 'flex', flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                  <PreviewForgeComponent previewUrn={localState.previewUrn}/>
                </Box>
                : null
              }

              {localState.isVideo ? 
                <Box id='center' sx={{ display: 'flex', flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                  <ReactPlayer
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload nofullscreen",
                        },
                      },
                    }}
                    url={localState.convertFile}
                    width='100%'
                    height='100%'
                    controls={true}
                    playing={true}
                  />
                </Box>
                : null
              }

              {localState.nonePreview ? 
                <EmptyContent
                  title={`${translate('cloud.none_preview')}`}
                  sx={{
                    '& span.MuiBox-root': { height: 160 },
                  }}
                />
                : null
              }

            </>
          }
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flexGrow: 1, pt: 1.5 }}>
            {localState.showTranslate ?
              <Button
                color="primary"
                variant="outlined"
                startIcon={<Iconify icon="fluent:convert-range-24-regular" />}
                onClick={convertModel}
                sx={{ mr: 2 }}
              >
                {`${translate('cloud.convert')}`}
              </Button>
              : null
            }
            {localState.isLoading ? 
              <Typography variant='caption' >{`${localState.info}`}</Typography>
              :
              <Typography variant='caption' >{`${localState.fileName}`}</Typography>
            }
          </Box>
          <Box sx={{ flexGrow: 200 }} />
          <Box sx={{ flexGrow: 1, pt: 1 }}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<Iconify icon="mdi:exit-to-app" />}
              onClick={closeDialog}
            >
              {`${translate('common.close')}`}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
