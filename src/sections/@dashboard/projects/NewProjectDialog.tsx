import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Avatar,
  Box,
  Stack,
  Button,
  Dialog,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { IProject, IProjectReqCreate, IProjectResGetAll } from 'src/shared/types/project';
import { IProjectCategory } from 'src/shared/types/projectCategory';
import { UploadLandscape } from 'src/components/upload';

import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
// apis
import uploadsApi from 'src/api/uploadsApi';
import projectsApi from 'src/api/projectsApi';
import projectCategoriesApi from 'src/api/projectCategoriesApi';
// zustand store
import useProject from 'src/redux/projectStore';
import useProjectCategory from 'src/redux/projectCategoryStore';
import { shallow } from 'zustand/shallow';

import { useSnackbar } from 'src/components/snackbar';
// enums
import { UserClassEnum } from 'src/shared/enums';
// type
import { IProjectCategoryResGetAll } from 'src/shared/types/projectCategory';
// ----------------------------------------------------------------------

type LocalState = {
  avatarUrl: string;
  checkUpload: boolean;
  progress: number;
  progressShow: boolean;
  selectedCategoryId: string;
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string,
  category: string,
  address: string,
  description: string,
  avatar: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewProjectDialog({ open, isEdit, onClose, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { 
    setProjects,
    selectedProject,
    setSelectedProject,
  } = useProject(
    (state) => ({ 
      setProjects: state.setDatas,
      selectedProject: state.selectedData,
      setSelectedProject: state.setSelectedData,
    }),
    shallow
  );

  const {
    projectCategories,
    setProjectCategories,
  } = useProjectCategory(
    (state) => ({ 
      projectCategories: state.datas,
      setProjectCategories: state.setDatas,
    }),
    shallow
  );

  // Load all project categories
  const loadAllProjectCategories = useCallback(async () => {
    const groupNames: string[] = [];
    groupNames.push('all');
    const param = {
      customerId: user?.customer?._id,
    }
    const apiRes: IProjectCategoryResGetAll = await projectCategoriesApi.getProjectCategories(param);
    setProjectCategories(apiRes.data);
  }, []);

  useEffect(() => {
    loadAllProjectCategories();
    if (selectedProject !== null) {
      if (selectedProject.category !== undefined) {
        setLocalState((prevState: LocalState) => ({ ...prevState, selectedCategoryId: (selectedProject.category as IProjectCategory)._id }));
        setValue('category', (selectedProject.category as IProjectCategory)._id);
      }
    }
      
  }, [selectedProject]); 

  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, selectedCategoryId: event?.target.value }));
    setValue('category', event?.target.value);
  }

  const newCustomerSchema = Yup.object().shape({
    name: Yup.string().required(translate('projects.name_required')),
    address: Yup.string().required(translate('projects.address_required')),
  });

  const defaultValues = useMemo(() => ({
    name: selectedProject?.name || '',
    category: selectedProject?.category ? (selectedProject?.category as IProjectCategory).name : '',
    address: selectedProject?.address || '',
    avatar: selectedProject?.avatar || `project_${Math.floor(Math.random() * 10)}.jpg`,
    description: selectedProject?.description || '',
  }), [isEdit, selectedProject]);

  const [localState, setLocalState] = useState<LocalState>({
    avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
    selectedCategoryId: '',
  });

  useEffect(() => {
    if (isEdit && selectedProject) {
      reset(defaultValues);
      setLocalState((prevState: LocalState) => ({ ...prevState, avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}` }));
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    setValue('avatar', `project_${Math.floor(Math.random() * 10)}.jpg`);
  }, [open, isEdit, selectedProject]);

  const handleResetFormData = () => {
    setSelectedProject(null);
    setLocalState((prevState: LocalState) => ({ 
      ...prevState,
      isEdit: false,
      avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    }));
  }

  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const newAvatar = acceptedFiles[0];
    const name = newAvatar.name;
    const ext = name.slice(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'webp') {
      if (newAvatar) {
        setLocalState((prevState: LocalState) => ({ 
          ...prevState,
          avatarUrl: Object.assign(newAvatar, { preview: URL.createObjectURL(newAvatar), }),
          checkUpload: true,
        }));
      } else {
        enqueueSnackbar(`${translate('helps.accepted_image')}`, {variant: "warning"});
      }
    }
    
  }, []);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newCustomerSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const loadAllProject = async () => {
    if (user?.customer !== null) {
      let apiRes: IProjectResGetAll;
      if (user?.class.uclass === UserClassEnum.Admin) {
        const params = { customerId: user?.customer._id };
        apiRes = await projectsApi.getProjects(params); 
      } else {
        apiRes = await projectsApi.getByUser(user?.id, user?.customer._id);
      }
      setProjects(apiRes.data);
    }
  };

  const onSubmit = async (data: FormValuesProps) => {
    if (data.category === '') {
      enqueueSnackbar(`${translate('projects.category_required')}`, { variant: 'error' });
      return;
    }

    let cate = data.category;
    const filter = projectCategories.filter((e) => e.name === data.category)
    if (filter.length > 0) {
      cate = filter[0]._id;
    }

    const newProjectData: IProjectReqCreate = {
      customer: user?.customer._id,
      name: data.name,
      address: data.address,
      category: cate,
      description: data.description,
      avatar: data.avatar,
      createdBy: user?.id,
      updatedName: user?.username,
      updatedId: user?.id,
    }
    
    if (localState.checkUpload) {
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: true }));
      
      const formData = new FormData(); 
      formData.append("image", localState.avatarUrl);
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: LocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
      };
      const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);

      newProjectData.avatar = ufileResponse.filename;
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: false }));
    }

    if (isEdit === true) {
      await projectsApi.updateById((selectedProject as IProject)._id, newProjectData);
    } else {
      await projectsApi.postCreate(newProjectData);
    }

    loadAllProject();
    handleResetFormData();
    onCancel();
  };

  const onCancel = () => {
    onClose();
    reset();
    setValue('category', '');
    setLocalState((prevState: LocalState) => ({ ...prevState, selectedCategoryId: '' }));
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {isEdit ? `${translate('nav.project')} ${selectedProject?.name}` : `${translate('projects.new_project')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <RHFTextField
              name="name"
              label={`${translate('projects.project_name')}`}
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
              fullWidth
              select
              label={`${translate('common.project_category')}`}
              value={localState.selectedCategoryId || ''}
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
              {projectCategories.map((option) => (
                <MenuItem
                  key={option._id}
                  value={option._id}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <Avatar alt={option.name} src={process.env.REACT_APP_APIFILE + `/images/${option.logo}`} sx={{ width: 22, height: 22, cursor: 'pointer', mr: 2 }} />
                    {option.name}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <RHFTextField
            size='small'
            name="address"
            label={`${translate('projects.address')}`}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="tabler:address-book" width={24} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <RHFTextField
              size='small'
              name="description"
              label={`${translate('projects.description')}`}
              multiline={true}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="fluent:text-description-rtl-20-filled" width={24} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box sx={{ mt: 1 }} >
            <UploadLandscape
              file={localState.avatarUrl}
              onDrop={handleDropAvatar}
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
              sx={{ height: 300 }}
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
    </Dialog>
  );
}
