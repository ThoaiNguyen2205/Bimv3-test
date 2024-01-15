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
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  FormHelperText,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';
import { ICustomer, ICustomerResGetAll, ICustomerReqCreate } from 'src/shared/types/customer';
import { UploadAvatar, UploadLandscape, Upload, UploadBox } from 'src/components/upload';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
// apis
import uploadsApi from 'src/api/uploadsApi';
import customersApi from 'src/api/customersApi';
import projectsApi from 'src/api/projectsApi';
import projectCategoriesApi from 'src/api/projectCategoriesApi';
import mainTasksApi from 'src/api/mainTasksApi';
// zustand store
import useCustomer from 'src/redux/customerStore';
import useProject from 'src/redux/projectStore';
import useTask from 'src/redux/taskStore';
import useFolder from 'src/redux/foldersStore';
import useProjectCategory from 'src/redux/projectCategoryStore';
import { shallow } from 'zustand/shallow';

import { useSnackbar } from 'src/components/snackbar';
// enums
import { TaskCategory, UserClassEnum } from 'src/shared/enums';
// type
import { IMainTask, IMainTaskReqCreate, IMainTaskResGetAll } from 'src/shared/types/mainTask';
// sections
import SelectFolderDialog from '../../discussion/SelectFolderDialog';
import { IFolder } from 'src/shared/types/folder';
import { IGroup } from 'src/shared/types/group';
import foldersApi from 'src/api/foldersApi';
// ----------------------------------------------------------------------

type ILocalState = {
  selectedCategory: string;
  displayColorPicker: boolean;
  pickedColor: string;
  displaySelectFolder: boolean;
  logoUrl: string;
  checkUpload: boolean;
  progressShow: boolean;
  progress: number
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string,
  description: string,
  note: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewCollaborationDialog({ open, isEdit, onClose, ...other }: Props) {
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
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      setTasks: state.setDatas,
      selectedTask: state.selectedData,
      setSelectedTask: state.setSelectedData,
    }),
    shallow
  );

  const subCategories = [
    {id: TaskCategory.ImageCollaboration, name: `${translate('task.image_collaboration')}`},
    {id: TaskCategory.OfficeCollaboration, name: `${translate('task.office_collaboration')}`},
    {id: TaskCategory.CadCollaboration, name: `${translate('task.cad_collaboration')}`},
    {id: TaskCategory.ModelCollaboration, name: `${translate('task.model_collaboration')}`},
    // {id: TaskCategory.GlbCollaboration, name: `${translate('task.glb_collaboration')}`},
  ]

  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, selectedCategory: event?.target.value }));
  }

  const newTaskSchema = Yup.object().shape({
    name: Yup.string().required(translate('task.name_required')),
    description: Yup.string().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    name: selectedTask?.name || '',
    description: selectedTask?.description || '',
    note: selectedTask?.note || '',
    logo: selectedTask?.logo || `project_${Math.floor(Math.random() * 10)}.jpg`,
  }), [selectedTask]);

  const [localState, setLocalState] = useState<ILocalState>({
    selectedCategory: '',
    displayColorPicker: false,
    pickedColor: selectedTask?.color || '#00AB55',
    displaySelectFolder: false,
    logoUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.logo}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
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
      setSelectedFolder(selectedTask?.folder as IFolder);
      const strPath = await foldersApi.getFolderListById((selectedTask?.folder as IFolder)._id);
      setDestination(strPath);
    }
    if (isEdit && selectedTask) {
      reset(defaultValues);
      // Tải Folder và destination
      loadFolder();
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        selectedCategory: selectedTask?.category,
        pickedColor: selectedTask?.color,
        logoUrl: `${process.env.REACT_APP_APIFILE}images/${selectedTask?.logo}`,
      }));
    }
    if (!isEdit) {
      reset(defaultValues);
    }    
  }, [isEdit, selectedTask]);

  const handleResetFormData = () => {
    setSelectedTask(null);
    setSelectedFolder(null);
    setDestination('');
    isEdit = false;
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

  const loadAllTasks = async () => {
    if (user?.customer !== null) {
      let uRole = user?.class.uclass;
      if (user?.projectrole === UserClassEnum.Admin) {
        uRole = user?.projectrole;
      }
      const params = { 
        project: user?.project._id,
        category: TaskCategory.Collaboration,
      };
      const apiRes: IMainTask[] = await mainTasksApi.getAllByUser(params, user?.id, uRole, user?.customer._id) as IMainTask[];
      setTasks(apiRes);
    }
  };

  const handleDropLogo = useCallback((acceptedFiles: any) => {
    const newLogo = acceptedFiles[0];
    const name = newLogo.name;
    const ext = name.slice(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'webp') {
      if (newLogo) {
        setLocalState((prevState: ILocalState) => ({ 
          ...prevState,
          logoUrl: Object.assign(newLogo, { preview: URL.createObjectURL(newLogo), }),
          checkUpload: true,
        }));
      }
    } else {
      enqueueSnackbar(`${translate('helps.accepted_image')}`, {variant: "warning"});
    }
  }, []);

  const onSubmit = async (data: FormValuesProps) => {
    let icon = 'coll_office.png';
    switch (localState.selectedCategory) {
      case TaskCategory.ImageCollaboration:
        icon = 'coll_image.png';
        break;
      case TaskCategory.OfficeCollaboration:
        icon = 'coll_office.png';
        break;
      case TaskCategory.CadCollaboration:
        icon = 'coll_cad.png';
        break;
      case TaskCategory.ModelCollaboration:
        icon = 'coll_model.png';
        break;
      // case TaskCategory.GlbCollaboration:
      //   icon = 'coll_model.png';
      //   break;
    }

    if (localState.selectedCategory === '') {
      enqueueSnackbar(`${translate('task.category_required')}`, { variant: 'error' });
      return;
    }
    if (selectedFolder === null) {
      enqueueSnackbar(`${translate('task.folder_required')}`, { variant: 'error' });
      return;
    }

    let logo = defaultValues.logo;

    const newCollaborationTaskData: IMainTaskReqCreate = {
      project: user?.project._id,
      name: data.name,
      description: data.description,
      note: data.note,
      color: localState.pickedColor,
      category: localState.selectedCategory as TaskCategory,
      folder: (selectedFolder as IFolder)._id,
      logo: logo,
      attach: icon,
      createdBy: user?.id,
      createdGroup: (user?.group as IGroup)._id,
      updatedName: user?.username,
      updatedId: user?.id,
    }

    if (localState.checkUpload) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, progressShow: true }));
      
      const formData = new FormData(); 
      formData.append("image", localState.logoUrl);
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: ILocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
      };
      const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);

      newCollaborationTaskData.logo = ufileResponse.filename;
      setLocalState((prevState: ILocalState) => ({ ...prevState, progressShow: false }));
    }

    if (isEdit === true) {
      const updateTask = await mainTasksApi.updateById((selectedTask as IMainTask)._id, newCollaborationTaskData);
    } else {
      const newTask = await mainTasksApi.postCreate(newCollaborationTaskData);
    }

    await loadAllTasks();
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
        <DialogTitle> {isEdit ? `${selectedTask?.name}` : `${translate('nav.collaboration')}`} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
            <RHFTextField
              // size='small'
              name="name"
              label={`${translate('task.task_name')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:rename-box" width={24} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name='category'
              // size='small'
              fullWidth
              select
              label={`${translate('common.project_category')}`}
              value={localState.selectedCategory || ''}
              onChange={onChangeCategory}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 260,
                    },
                  },
                },
              }}
              sx={{
                maxWidth: { sm: 240 },
                textTransform: 'capitalize',
              }}
            >
              {subCategories.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    {(option.id === TaskCategory.ImageCollaboration) ?
                      <Avatar alt={TaskCategory.ImageCollaboration} src={process.env.REACT_APP_APIFILE + '/images/coll_image.png'} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                      : null
                    }
                    {(option.id === TaskCategory.OfficeCollaboration) ?
                      <Avatar alt={TaskCategory.OfficeCollaboration} src={process.env.REACT_APP_APIFILE + '/images/coll_office.png'} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                      : null
                    }
                    {(option.id === TaskCategory.CadCollaboration) ?
                      <Avatar alt={TaskCategory.CadCollaboration} src={process.env.REACT_APP_APIFILE + '/images/coll_cad.png'} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                      : null
                    }
                    {(option.id === TaskCategory.ModelCollaboration) ?
                      <Avatar alt={TaskCategory.ModelCollaboration} src={process.env.REACT_APP_APIFILE + '/images/coll_model.png'} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                      : null
                    }
                    {/* {(option.id === TaskCategory.GlbCollaboration) ?
                      <Avatar alt={TaskCategory.GlbCollaboration} src={process.env.REACT_APP_APIFILE + '/images/coll_model.png'} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                      : null
                    } */}
                    {option.name}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 3 }}>
            <Box>
              <Box
                onClick={() => {
                  setLocalState((prevState: ILocalState) => ({
                    ...prevState,
                    displayColorPicker: true,
                  }));
                }}
                sx={{
                  backgroundColor: localState.pickedColor,
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  borderRadius: '7px',
                  display: 'inline-block',
                  cursor: 'pointer',
                  color: localState.pickedColor,
                }}
              />
              {localState.displayColorPicker ? (
                <Box
                  sx={{
                    position: 'absolute',
                    zIndex: '2',
                  }}
                >
                  <Box
                    sx={{
                      position: 'fixed',
                      top: '0px',
                      right: '0px',
                      bottom: '0px',
                      left: '0px',
                    }}
                    onClick={() => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        displayColorPicker: false,
                      }));
                    }}
                  />
                  <TwitterPicker
                    color={localState.pickedColor}
                    onChange={(e: any) => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        pickedColor: e.hex,
                      }));
                    }}
                  />
                </Box>
              ) : (
                <></>
              )}
            </Box>
            <RHFTextField
              size='small'
              name="description"
              label={`${translate('projects.description')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="fluent:text-description-rtl-20-filled" width={24} />
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 2 }} 
            />
          </Stack>

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 3 }}>
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
            <Button color="primary" variant="contained" onClick={handleShowSelectFolder} startIcon={<Iconify icon="mdi:folder-key" />}>
              {`${translate('task.select')}`}
            </Button>
          </Stack>

          <Box sx={{ mt: 1 }} >
            <UploadLandscape
              file={localState.logoUrl}
              onDrop={handleDropLogo}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                  >
                  {`${translate('customers.file_accepted')}`}
                </Typography>
              }
              sx={{ width: '100%', height: 220 }}
            />
            {localState.progressShow ? <LinearProgress variant="determinate" value={localState.progress} color="success" /> : null}
          </Box>

        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon="bxs:edit" />}>
            {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
      <SelectFolderDialog open={localState.displaySelectFolder} onClose={handleCloseSelectFolder} />
    </Dialog>
  );
}
