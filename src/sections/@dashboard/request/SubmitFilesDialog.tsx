//react
import { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// type
import { IFile } from '../../../shared/types/file';
// apis 
import filesApi from '../../../api/filesApi';
// zustand store
import useFolder from '../../../redux/foldersStore';
import useFile from '../../../redux/filesStore';
import { shallow } from 'zustand/shallow';
// AuthContext
import { useAuthContext } from '../../../auth/useAuthContext';
// Locales
import { useLocales } from '../../../locales';
// sections
import FileCard from '../discussion/editor/FileCard';
import { UploadFilesDialogs } from '../file';
// components
import Iconify from '../../../components/iconify/Iconify';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { useSnackbar } from '../../../components/snackbar';
import EmptyContent from '../../../components/empty-content/EmptyContent';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
// ----------------------------------------------------------------------
const folderNameStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  minWidth: '50px',
  maxWidth: '150px',
  textOverflow: 'ellipsis',
  alignItems: 'left',
  justifyContent: 'left',
  flexGrow: 1,
}

type ILocalState = {
  openUploadFilesDialog: boolean;
  isSubmitting: boolean,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function SubmitFilesDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();

  const {
    selectedFolder,
  } = useFolder(
    (state) => ({
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const {
    files,
    selectedFiles,
    setSelectedFiles,
    setFiles,
  } = useFile(
    (state) => ({ 
      files: state.datas,
      selectedFiles: state.selectedFiles,
      setFiles: state.setDatas,
      setSelectedFiles: state.setSelectedFiles,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    openUploadFilesDialog: false,
    isSubmitting: false,
  });

  const onSelectFile = (file: IFile) => {
    const fData = selectedFiles.filter(e => e._id === file._id);
    if (fData.length < 1) {
      setSelectedFiles([...selectedFiles, file]);
    }
  }

  const onRemoveFile = (file: IFile) => {
    const fData = selectedFiles.filter(e => e._id !== file._id);
    setSelectedFiles(fData);
  }

  const handleSelectFiles = async () => {
    onCancel();
  }

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      files: [],
      selectedFolder: null,
      selectedFiles: [],
      isSubmitting: false,
    }));
    onClose();
  }

  // Upload Dialog
  const handleUploadFiles = (open: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openUploadFilesDialog: open,
    }));
  }

  const loadFilesData = useCallback( async () => {
    if (selectedFolder !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: true,
      }));
      const param = {
        folder: selectedFolder._id,
      }
      const fileRes = await filesApi.getAllLastedFilesInFolder(param);
      setFiles(fileRes);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isSubmitting: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadFilesData();
  }, [selectedFolder]);

  return (
    <Dialog open={open} maxWidth='md' onClose={onClose} {...other}>
      <DialogTitle> {`${translate('discussion.attach')}`} </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} minWidth={500} sx={{ mb: 2 }}>
          <Grid item xs={12} md={12} >
            <Card sx={{ borderRadius: '10px !important', p: 1, m: 1 }}>
              <Scrollbar sx={{ maxHeight: 300 }}>
                {localState.isSubmitting ? 
                  <LoadingWindow />
                  :
                  <Stack
                    minHeight={214}
                    spacing={1}
                    direction={{ xs: 'row', md: 'column' }}
                    alignItems={{ xs: 'flex-start', md: 'left' }}
                    sx={{ mb: 1 }}
                  >
                    {files && files.map((file) => (
                      <FileCard
                        key={file._id}
                        handleClick={onSelectFile}
                        file={file}
                        searchMode={false}
                        location={[]}
                        onLinkClick={() => {}}
                        folderNameStyle={folderNameStyle}
                      />
                    ))}
                    {(files.length < 1) ?
                      <Box sx={{ width: '100%' }}>
                        <EmptyContent
                          title={`${translate('common.no_data')}`}
                          sx={{
                            '& span.MuiBox-root': { height: 160 },
                          }}
                        />
                      </Box>
                      : null
                    }
                  </Stack>
                }
              </Scrollbar>
            </Card>
          </Grid>
        </Grid>

        {(selectedFiles.length > 0) ? 
          <Card sx={{ borderRadius: '10px !important', p: 1, m: 1, mb: 3 }}>
            <Scrollbar sx={{ minHeight: 60, maxHeight: 125 }}>
              {selectedFiles && selectedFiles.reverse().map((file) => (
                <Stack
                  key={file._id}
                  spacing={1}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'left' }}
                >
                  <IconButton
                    color='error'
                    onClick={() => onRemoveFile(file)}
                  >
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                  <Typography color='primary' variant='subtitle2' sx={{ pt: 1 }}><i>{file.displayName}</i></Typography>
                </Stack>
              ))}
            </Scrollbar>
          </Card>
          : null
        }
        
      </DialogContent>

      <DialogActions>
        {(selectedFolder?.isUpdate) ?
          <LoadingButton
            type="submit"
            variant="soft"
            loading={localState.isSubmitting}
            startIcon={<Iconify icon="material-symbols:drive-folder-upload-outline-rounded" />}
            onClick={() => handleUploadFiles(true)}
            sx={{ mr: 30 }}
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

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:folder-key" />}
          onClick={handleSelectFiles}
        >
          {`${translate('task.select')}`}
        </LoadingButton>
      </DialogActions>
      
      <UploadFilesDialogs
        open={localState.openUploadFilesDialog}
        onClose={() => handleUploadFiles(false)}
        onLoadFolders={loadFilesData}
      />

    </Dialog>
  );
}
