// react
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// @mui
import {
  Box,
  List,
  Stack,
  Dialog,
  Button,
  LinearProgress,
  TextField,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CategoryItem from './CategoryItem';
import ConfirmDialog from 'src/components/confirm-dialog';
import { UploadAvatar } from 'src/components/upload';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import uploadsApi from 'src/api/uploadsApi';
import groupusersApi from 'src/api/groupusersApi';
import userclassesApi from 'src/api/userclassesApi';
import projectCategoriesApi from 'src/api/projectCategoriesApi'; 
// type
import { IProjectCategory, IProjectCategoryReqCreate, IProjectCategoryResGetAll } from 'src/shared/types/projectCategory';
import { DeleteData } from "src/shared/types/deleteData";
// zustand
import useUclass from 'src/redux/uclassStore';
import useProjectCategory from 'src/redux/projectCategoryStore';
import { shallow } from 'zustand/shallow';
import { IUclass, IUclassResGetAll } from 'src/shared/types/uclass';
import { useSnackbar } from 'notistack';


// ----------------------------------------------------------------------

type LocalState = {
  isEdit: boolean;
  logoUrl: string;
  checkUpload: boolean;
  progressShow: boolean;
  progress: number;
  openConfirm: boolean;
  filterKey: string;
};

type FormValuesProps = {
  name: string,
  description: string,
};

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
};

export default function CategoriesDialog({
  open,
  onClose,
  ...other
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const isDesktop = useResponsive('up', 'lg');

  const {
    projectCategories,
    selectedProjectCategory,
    setProjectCategories,
    setSelectedProjectCategory,
  } = useProjectCategory(
    (state) => ({ 
      projectCategories: state.datas,
      selectedProjectCategory: state.selectedData,
      setProjectCategories: state.setDatas,
      setSelectedProjectCategory: state.setSelectedData,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState> ({
    isEdit: false,
    logoUrl: process.env.REACT_APP_APIFILE + 'images/project-type.gif',
    checkUpload: false,
    progressShow: false,
    progress: 0,
    openConfirm: false,
    filterKey: '',
  });

  const dataFiltered = applyFilter({
    inputData: projectCategories,
    filterKey: localState.filterKey,
  });

  const onSearchGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, filterKey: event.target.value }));
  };

  const loadAllCategories = async () => {
    const param = {
      customerId: user?.customer._id,
    }
    const apiRes: IProjectCategoryResGetAll = await projectCategoriesApi.getProjectCategories(param);
    setProjectCategories(apiRes.data);
  };

  useEffect(() => {
    if (selectedProjectCategory !== null && localState.isEdit === true) {
      setLocalState((prevState: LocalState) => ({ ...prevState, logoUrl: process.env.REACT_APP_APIFILE + 'images/' + selectedProjectCategory.logo }));
    } else {
      setLocalState((prevState: LocalState) => ({ ...prevState, logoUrl: process.env.REACT_APP_APIFILE + 'images/project-type.gif' }));
    }
  }, [localState.isEdit, selectedProjectCategory]);

  const editGroupSchema = Yup.object().shape({
    name: Yup.string().max(20, translate('projects.category_name_maxlength')).required(translate('projects.category_name_required')),
    description: Yup.string().max(20, translate('projects.category_description_maxlength')).required(translate('projects.category_description_required')),
  });

  const defaultValues = useMemo(() => ({
    name: selectedProjectCategory?.name || '',
    description: selectedProjectCategory?.description || '',
  }), [selectedProjectCategory]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(editGroupSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (selectedProjectCategory !== null) {
      reset(defaultValues);
    }
  }, [selectedProjectCategory]);

  const cancelEdit = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: false, checkUpload: false }));
    setSelectedProjectCategory(null);
    setValue('name', '');
    setValue('description', '');
  }

  const onSubmit = async (data: any) => {
    
    let logo = 'project-type.gif';
    if (localState.isEdit && selectedProjectCategory !== null) {
      logo = selectedProjectCategory.logo;
    }
    
    if (localState.checkUpload) {
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: true }));
      const formData = new FormData(); 
      formData.append("image", localState.logoUrl);        
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: LocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
      };
      const ufileResponse = await uploadsApi.uploadImage(formData, onUploadProgress);
      logo = ufileResponse.filename;
      setLocalState((prevState: LocalState) => ({ ...prevState, progressShow: false }));
    }

    const newCategoryReq: IProjectCategoryReqCreate = {
      customer: user?.customer._id,
      name: data.name,
      logo: logo,
      description: data.description,
      createdBy: user?.id,
      updatedName: user?.username,
      updatedId: user?.id,
    }    

    if (localState.isEdit && selectedProjectCategory !== null) {
      await projectCategoriesApi.updateById(selectedProjectCategory._id, newCategoryReq);
    } else {
      await projectCategoriesApi.postCreate(newCategoryReq);
    }

    loadAllCategories();
    setLocalState((prevState: LocalState) => ({ 
      ...prevState,
      logoUrl: process.env.REACT_APP_APIFILE + 'images/project-type.gif',
      checkUpload: false,
      isEdit: false,
    }));
    setSelectedProjectCategory(null);
    reset(defaultValues);
    setValue('name', '');
    setValue('description', '');
  }

  const handleEditProjectCategory = (category: IProjectCategory) => {
    setSelectedProjectCategory(category);
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: true }));
  };

  const handleOpenConfirm = (category: IProjectCategory) => {
    setSelectedProjectCategory(category);
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirm: true }));
  };

  const handleCloseConfirm = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirm: false }));
    setValue('name', '');
    setValue('description', '');
  };

  const onDeleteGroup = async () => {
    if (selectedProjectCategory) {
      const deleteData: DeleteData = {
        deletedById: user?.id,
        deletedByName: user?.username,
      }
      const deleteGroup = await projectCategoriesApi.deleteById(selectedProjectCategory._id, deleteData);
      if (deleteGroup) {
        loadAllCategories();
        handleCloseConfirm();
        setSelectedProjectCategory(null);
        setValue('name', '');
        setValue('description', '');
      }
    }
  }

  const handleDropAvatar = useCallback((acceptedFiles : any) => {
    const file = acceptedFiles[0];
    const name = file.name;
    const ext = name.slice(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'webp') {
      if (file) {
        setLocalState((prevState: LocalState) => ({
          ...prevState,
          logoUrl: Object.assign(file, {
            preview: URL.createObjectURL(file),
            }),
          checkUpload: true,
        }));
      }
    } else {
      enqueueSnackbar(`${translate('helps.accepted_image')}`, {variant: "warning"});
    }
  }, []);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('common.project_category')}`} </DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <RHFTextField
              size='small'
              name="name"
              variant='outlined'
              fullWidth
              label={`${translate('customers.name')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:rename-box" width={24} />
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              size='small'
              name="description"
              variant='outlined'
              fullWidth
              label={`${translate('common.description')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="fluent:text-description-rtl-20-filled" width={24} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack sx={{ mb: 1 }} >
            <UploadAvatar
              maxSize={3145728}
              file={localState.logoUrl}
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
            />
            {localState.progressShow ? <LinearProgress variant="determinate" value={localState.progress} color="success" /> : null}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Box sx={{ flexGrow: 1 }} />

            {localState.isEdit ? 
              <Button 
                size='small'
                variant='outlined'
                color="error"
                startIcon={<Iconify icon='ooui:cancel' />}
                onClick={cancelEdit}
                sx={{ minWidth: 120, minHeight: 36 }}
              >
                {`${translate('common.cancel')}`}
              </Button>
              :
              <TextField
                size='small'
                fullWidth
                onChange={onSearchGroup}
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            }            

            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon='clarity:employee-group-solid' />}
              sx={{ minWidth: 140 }}
              loading={isSubmitting}
            >
              {localState.isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
            </LoadingButton>

          </Stack>

          <Scrollbar sx={{ mt: 1, height: 74 * 3 }}>
            <List disablePadding>
              {dataFiltered.map((category) => (
                <CategoryItem key={category._id} category={category} onEdit={() => {handleEditProjectCategory(category);}} onDelete={() => {handleOpenConfirm(category);}} />
              ))}
            </List>
          </Scrollbar>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }} />
          {onClose && (
            <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:exit-to-app" />} onClick={onClose}>
              {`${translate('common.close')}`}
            </Button>
          )}
        </DialogActions>

        {(selectedProjectCategory !== null) ?
          <ConfirmDialog
            open={localState.openConfirm}
            onClose={handleCloseConfirm}
            title={`${translate('common.type')} ${selectedProjectCategory.name}`}
            content={`${translate('common.delete_confirm')}`}
            action={
              <Button variant="contained" color="error" onClick={onDeleteGroup}>
                {`${translate('common.delete')}`}
              </Button>
            }
          />
          :
          null
        }
      </FormProvider>

    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  filterKey,
}: {
  inputData: IProjectCategory[];
  filterKey: string;
}) {

  if (filterKey) {
    inputData = inputData.filter(
      (category) => category.name.toLowerCase().indexOf(filterKey.toLowerCase()) !== -1
    );
  }

  return inputData;
}