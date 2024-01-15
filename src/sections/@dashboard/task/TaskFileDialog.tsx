// react
import { useEffect, useState } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Button,
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// type
import { IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// router
import { PATH_DASHBOARD } from 'src/routes/paths';
// apis
import filesApi from 'src/api/filesApi';
// zustand store
import useForgeViewState from 'src/redux/forgeViewStore';
import useFile from 'src/redux/filesStore';
import { shallow } from 'zustand/shallow';
// hooks
import { useLocales } from 'src/locales';
// sections
import { PreviewFileDialog, FileDetailsDrawer, UploadFilesDialogs } from '../file';
import TaskFileCard from './TaskFileCard';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import useTask from 'src/redux/taskStore';
// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  openPreviewFileDialog: boolean,
  previewFileId: string,
  openDetails: boolean,
  detailItem: IFile | null,
  openUploadFilesDialog: boolean,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function TaskFileDialog({ open, onClose, ...other }: Props) {
  const router = useRouter();
  const { translate } = useLocales();
  const {
    tasks,
    taskLoading,
    selectedTask,
    setTasks,
    countTasks,
    setSelectedTask,
    setTaskLoading,
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      taskLoading: state.loading,
      selectedTask: state.selectedData,
      setTasks: state.setDatas,
      countTasks: state.countDatas,
      setSelectedTask: state.setSelectedData,
      setTaskLoading: state.setLoading,
    }),
    shallow
  );

  const {
    files,
    setFiles,
  } = useFile(
    (state) => ({ 
      files: state.datas,
      setFiles: state.setDatas,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    openPreviewFileDialog: false,
    previewFileId: '',
    openDetails: false,
    detailItem: null,
    openUploadFilesDialog: false,
  });

  const loadFilesData = async () => {
    if (selectedTask !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: true,
      }));
      const param = {
        folder: (selectedTask.folder as IFolder)._id,
      }
      const files = await filesApi.getAllLastedFilesInFolder(param);
      setFiles(files);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
    }
  }

  useEffect(() => {
    loadFilesData();
  }, [selectedTask]);
  
  const onCancel = () => {
    onClose();
  };

  const handlePreviewFile = (fileId: string | null) => {
    if (fileId === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        openPreviewFileDialog: false,
      }));
    } else {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        previewFileId: fileId,
        openPreviewFileDialog: true,
      }));
    }
  }

  // Details Dialog
  const handleDetailsDialog = async (itemId: string) => {
    const renameFile = files.filter(e => e._id === itemId);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: true,
      detailItem: renameFile[0],
    }));
  }

  const handleCloseDetailsDialog = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: false,
      detailItem: null,
    }));
  }

  // Upload Dialog
  const handleUploadFiles = (open: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openUploadFilesDialog: open,
    }));
  }

  const jumpToFilesManager = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));
    router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${(selectedTask?.folder as IFolder)._id}`)
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} {...other} >
      <DialogTitle> {`${translate('cloud.file')}`} </DialogTitle>
      <DialogContent sx={{ alignItems: 'center' }}>
        {localState.isSubmitting ? 
          <LoadingWindow />
          :
          <Scrollbar sx={{ minHeight: 220, maxHeight: 370 }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={3}
              sx={{ pb: 1 }}
            >
              {files && files.map((file) => (
                <TaskFileCard
                  key={file._id}
                  file={file}
                  detailItem={localState.detailItem}
                  handleDetailsDialog={() => handleDetailsDialog(file._id)}
                />
              ))}
            </Box>
          </Scrollbar>
        }
      </DialogContent>

      <DialogActions>
        <LoadingButton
          color="primary"
          variant="outlined"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:folder-key-outline" />}
          onClick={() => jumpToFilesManager()}
          sx={{ mr: 50 }}
        >
          {`${translate('cloud.open')} ${translate('cloud.files_manager')}`}
        </LoadingButton>

        {(selectedTask?.isEdit || selectedTask?.isUpdate) ?
          <LoadingButton
            type="submit"
            variant="contained"
            loading={localState.isSubmitting}
            startIcon={<Iconify icon="material-symbols:drive-folder-upload-outline-rounded" />}
            onClick={() => handleUploadFiles(true)}
          >
            {`${translate('cloud.upload')}`}
          </LoadingButton>
          : null
        }
        
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onCancel}
        >
          {`${translate('common.cancel')}`}
        </Button>
      </DialogActions>

      <FileDetailsDrawer
        item={localState.detailItem}
        itemType={'file'}
        open={localState.openDetails}
        onClose={handleCloseDetailsDialog}
        onOpenRow={() => handlePreviewFile(localState.detailItem?._id || '')}
        treeItemOnClick={() => {loadFilesData()}}
        handlePreviewFile={() => handlePreviewFile(localState.detailItem?._id || '')}
        sx={{ zIndex: 1300 }}
      />

      <PreviewFileDialog
        open={localState.openPreviewFileDialog}
        onClose={() => handlePreviewFile(null)}
        fileId={localState.previewFileId}
        files={files}
        sx={{ zIndex: 1300 }}
      />

      <UploadFilesDialogs
        open={localState.openUploadFilesDialog}
        onClose={() => handleUploadFiles(false)}
        onLoadFolders={loadFilesData}
      />
      
    </Dialog>
  );
}
