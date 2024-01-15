import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// react-color
// @ts-ignore
import { SketchPicker, ChromePicker, TwitterPicker } from 'react-color';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Avatar,
  Box,
  Container,
  InputAdornment, 
  Stack,
  Button,
  Rating,
  Dialog,
  LinearProgress,
  MenuItem,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  FormHelperText,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { UploadAvatar, UploadLandscape, Upload, UploadBox } from 'src/components/upload';
// apis
import mainTasksApi from 'src/api/mainTasksApi';
// zustand store
import useTask from 'src/redux/taskStore';
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useSnackbar } from 'src/components/snackbar';
// enums
import { TaskCategory, UserClassEnum } from 'src/shared/enums';
// type
import { IMainTask, IMainTaskReqCreate, IMainTaskResGetAll } from 'src/shared/types/mainTask';
// sections
import SelectFolderDialog from '../discussion/SelectFolderDialog';
import { IFolder } from 'src/shared/types/folder';
import { IGroup } from 'src/shared/types/group';
import foldersApi from 'src/api/foldersApi';
import uploadsApi from 'src/api/uploadsApi';
import useRequest from 'src/redux/requestStore';
import { IRequestReqCreate } from 'src/shared/types/request';
import requestsApi from 'src/api/requestsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  displaySelectFolder: boolean;
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  title: string,
  content: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  title: string;
  loadTaskData: VoidFunction;
  onClose: VoidFunction;
}

export default function NewRequestDialog({ open, title, loadTaskData, onClose, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
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

  const {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    requestLoading,
    setRequestLoading,
    countRequests,
    currentTask,
    setCurrentTask,
    requestsTree,
    setRequestsTree,
    requestContents,
    setRequestContents,
  } = useRequest(
    (state) => ({
      requests: state.datas,
      setRequests: state.setDatas,
      selectedRequest: state.selectedData,
      setSelectedRequest: state.setSelectedData,
      requestLoading: state.loading,
      setRequestLoading: state.setLoading,
      countRequests: state.countDatas,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      requestsTree: state.requestsTree,
      setRequestsTree: state.setRequestsTree,
      requestContents: state.requestContents,
      setRequestContents: state.setRequestContents,
    }),
    shallow
  );

  const newTaskSchema = Yup.object().shape({
    title: Yup.string().required(translate('task.name_required')),
    content: Yup.string().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    title: '',
    content: '',
  }), [selectedRequest]);

  const [localState, setLocalState] = useState<ILocalState>({
    displaySelectFolder: false,
  });  

  const handleShowSelectFolder = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, displaySelectFolder: true }));
  }

  const handleCloseSelectFolder = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, displaySelectFolder: false }));
  }

  useEffect(() => {
    setSelectedFolder(null);
    const loadFolder = async () => {
      setSelectedFolder(selectedRequest?.folder as IFolder);
      const strPath = await foldersApi.getFolderListById((selectedRequest?.folder as IFolder)._id);
      setDestination(strPath);
    }
    if (selectedRequest) {
      reset(defaultValues);
      // Tải Folder và destination
      loadFolder();
    } 
  }, [selectedRequest]);

  const handleResetFormData = () => {
    setSelectedRequest(null);
    setSelectedFolder(null);
    setDestination('');
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newTaskSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;


  const onSubmit = async (data: FormValuesProps) => {
    if (selectedFolder === null) {
      enqueueSnackbar(`${translate('task.folder_required')}`, { variant: 'error' });
      return;
    }
    const newRequestTaskData: IRequestReqCreate = {
      task: currentTask?._id,
      title: data.title,
      content: data.content,
      folder: (selectedFolder as IFolder)._id,
      createdBy: user?.id,
      createdGroup: (user?.group as IGroup)._id,
      father: (selectedRequest === null) ? '' : selectedRequest._id,
    }

    const newRequest = await requestsApi.postCreate(newRequestTaskData);

    loadTaskData();
    handleResetFormData();
    onClose();
    reset();
    
  };

  const onCancel = () => {
    handleResetFormData();
    onClose();
    reset();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {title} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          {(selectedRequest !== null) ?
            <>
              <Stack direction="row" alignItems="center" display="inline-flex" spacing={3} sx={{ mb: 1 }}>
                {(currentTask?.isEdit === true || currentTask?.isApprove === true) ?
                  <Tooltip title={`${translate('common.cancel')}`} placement='top'>
                    <Button
                      color="primary"
                      variant="soft"
                      onClick={() => setSelectedRequest(null)}
                    >
                      <Iconify icon="ic:outline-cancel" />
                    </Button>
                  </Tooltip>
                  : null
                }

                <Typography variant='body2' color='primary'>
                  {`${translate('request.father_request')}: ${selectedRequest?.title}`}
                </Typography>
              </Stack>
              
            </>
            : null
          }

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <RHFTextField
              size='small'
              name="title"
              label={`${translate('documents.title')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:rename-box" width={24} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <RHFTextField
              name="content"
              label={`${translate('common.content')}`}
              multiline
              rows={5}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="fluent:text-description-rtl-20-filled" width={24} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              disabled
              size='small'
              label={`${translate('task.connective_folder')}`}
              value={destination}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="flat-color-icons:folder" width={24} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              color="primary"
              variant="contained"
              onClick={handleShowSelectFolder}
              startIcon={<Iconify icon="mdi:folder-key" />}
              sx={{ minWidth: 120 }}
            >
              {`${translate('common.change')}`}
            </Button>
          </Stack>
          
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon="bxs:edit" />}>
            {`${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
      <SelectFolderDialog open={localState.displaySelectFolder} onClose={handleCloseSelectFolder} />
    </Dialog>
  );
}
