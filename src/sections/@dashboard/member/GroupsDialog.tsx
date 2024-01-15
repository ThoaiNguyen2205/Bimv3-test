// react
import { useState, useEffect, useCallback, useMemo, ChangeEventHandler } from 'react';
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
import GroupItem from './GroupItem';
import ConfirmDialog from 'src/components/confirm-dialog';
import { UploadAvatar } from 'src/components/upload';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import groupsApi from 'src/api/groupsApi';
import uploadsApi from 'src/api/uploadsApi';
import groupusersApi from 'src/api/groupusersApi';
import userclassesApi from 'src/api/userclassesApi';
// type
import { IGroupResGetAll, IGroup, IGroupReqCreate } from 'src/shared/types/group';
import { DeleteData } from "src/shared/types/deleteData";
// zustand
import useUclass from 'src/redux/uclassStore';
import useGroup from 'src/redux/groupStore';
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
  groupname: string,
  title: string,
};

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
};

export default function GroupsDialog({
  open,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const isDesktop = useResponsive('up', 'lg');

  const {
    groups,
    selectedGroup,
    setGroups,
    setSelectedGroup,
  } = useGroup(
    (state) => ({ 
      groups: state.datas,
      selectedGroup: state.selectedData,
      setGroups: state.setDatas,
      setSelectedGroup: state.setSelectedData,
    }),
    shallow
  );

  const {
    setUclasses,
  } = useUclass(
    (state) => ({ 
      setUclasses: state.setDatas,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState> ({
    isEdit: false,
    logoUrl: process.env.REACT_APP_APIFILE + 'images/group.png',
    checkUpload: false,
    progressShow: false,
    progress: 0,
    openConfirm: false,
    filterKey: '',
  });

  const dataFiltered = applyFilter({
    inputData: groups,
    filterKey: localState.filterKey,
  });

  const onSearchGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, filterKey: event.target.value }));
  };

  const loadAllGroup = useCallback(async () => {
    const apiRes: IGroupResGetAll = await groupsApi.getByCustomer(user?.customer._id);
    setGroups(apiRes.data);
  }, []);

  useEffect(() => {
    loadAllGroup();
  }, []); 

  useEffect(() => {
    if (selectedGroup !== null && localState.isEdit === true) {
      setLocalState((prevState: LocalState) => ({ ...prevState, logoUrl: process.env.REACT_APP_APIFILE + 'images/' + selectedGroup.logo }));
    } else {
      setLocalState((prevState: LocalState) => ({ ...prevState, logoUrl: process.env.REACT_APP_APIFILE + 'images/group.png' }));
    }
  }, [localState.isEdit, selectedGroup]);

  const editGroupSchema = Yup.object().shape({
    groupname: Yup.string().max(20, translate('common.groupname_maxlength')).required(translate('customers.name_required')),
    title: Yup.string().max(50, translate('common.grouptitle_maxlength')).required(translate('customers.shortname_required')),
  });

  const defaultValues = useMemo(() => ({
    groupname: selectedGroup?.groupname || '',
    title: selectedGroup?.title || '',
  }), [selectedGroup]);

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
    if (selectedGroup !== null) {
      reset(defaultValues);
    }
  }, [selectedGroup]);

  const cancelEdit = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: false, checkUpload: false }));
    setSelectedGroup(null);
    setValue('groupname', '');
    setValue('title', '');
  }

  const onSubmit = async (data: any) => {
    let logo = 'group.png';
    if (localState.isEdit && selectedGroup !== null) {
      logo = selectedGroup.logo;
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

    const newGroupReq: IGroupReqCreate = {
      customer: user?.customer._id,
      groupname: data.groupname,
      logo: logo,
      title: data.title,
      createdBy: user?.id,
      updatedId: user?.id,
      updatedName: user?.username,
    }    

    if (localState.isEdit && selectedGroup !== null) {
      await groupsApi.updateById(selectedGroup._id, newGroupReq);
    } else {
      await groupsApi.postCreate(newGroupReq);
    }

    loadAllGroup();
    setLocalState((prevState: LocalState) => ({ 
      ...prevState,
      logoUrl: process.env.REACT_APP_APIFILE + 'images/group.png',
      checkUpload: false,
      isEdit: false,
    }));
    setSelectedGroup(null);
    reset(defaultValues);
    setValue('groupname', '');
    setValue('title', '');
  }  

  const handleEditGroup = (group: IGroup) => {
    setSelectedGroup(group);
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: true }));
  };

  const handleOpenConfirm = (group: IGroup) => {
    setSelectedGroup(group);
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirm: true }));
  };

  const handleCloseConfirm = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openConfirm: false }));
    setValue('groupname', '');
    setValue('title', '');
  };

  const onDeleteGroup = async () => {
    if (selectedGroup) {
      const deleteData: DeleteData = {
        deletedById: user?.id,
        deletedByName: user?.username,
      }
      const deleteGroup = await groupsApi.deleteById(selectedGroup._id, deleteData);
      if (deleteGroup) {
        loadAllGroup();
        handleCloseConfirm();
        setSelectedGroup(null);
        setValue('groupname', '');
        setValue('title', '');
      }
    }
  }

  // Groups
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

  // ========================== SYNC FROM V2
  const [syncLoading, setSyncLoading] = useState(false);

  const syncGroup = async () => {
    setSyncLoading(true);
    for (const gri of groups) {
      const usersInGroupi = await groupusersApi.getByGroup(gri._id);
      if (usersInGroupi.data.length > 0) {
        for (const gruser of usersInGroupi.data) {
          // Tìm userClass của người dùng tương ứng với customer hiện hành
          const params = { customerId: user?.customer._id, userId: gruser.user._id };
          const userclassiRes: IUclassResGetAll = await userclassesApi.getUserClass(params);
          if (userclassiRes.data.length > 0) {
            const usi: IUclass = userclassiRes.data[0];
            await userclassesApi.updateById(usi._id, { 
              groupId: gri._id,
              groupName: gri.groupname,
              groupTitle: gri.title,
              isKey: gruser.isKey,
              updatedById: user?.id,
              updatedByName: user?.username,
            });
          }

        }
      }
      
    }

    const params = { customerId: user?.customer._id };
    const apiRes: IUclassResGetAll = await userclassesApi.getUserClass(params);    
    setUclasses(apiRes.data);
    
    setSyncLoading(false);
    onClose();
  }
  // =======================================

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('nav.groups')}`} </DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <RHFTextField
              size='small'
              name="groupname"
              variant='outlined'
              fullWidth
              label={`${translate('common.group_name')}`}
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
              name="title"
              variant='outlined'
              fullWidth
              label={`${translate('common.group_title')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:tag-outline" width={24} />
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
              <Button size='small' variant='outlined' color="error" startIcon={<Iconify icon='ooui:cancel' />} onClick={cancelEdit} sx={{ minWidth: 120, minHeight: 40 }} >
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
              {dataFiltered.map((group) => (
                <GroupItem key={group._id} group={group} onEdit={() => {handleEditGroup(group);}} onDelete={() => {handleOpenConfirm(group);}} />
              ))}
            </List>
          </Scrollbar>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {/* <LoadingButton
            variant="contained"
            color="info"
            startIcon={<Iconify icon="prime:sync" />}
            onClick={syncGroup}
            loading={syncLoading}
          >
            {`${translate('common.v2_sync')}`}
          </LoadingButton> */}
          <Box sx={{ flexGrow: 1 }} />
          {onClose && (
            <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:exit-to-app" />} onClick={onClose}>
              {`${translate('common.close')}`}
            </Button>
          )}
        </DialogActions>

        {(selectedGroup !== null) ?
          <ConfirmDialog
            open={localState.openConfirm}
            onClose={handleCloseConfirm}
            title={`${translate('nav.group')} ${selectedGroup.groupname}`}
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
  inputData: IGroup[];
  filterKey: string;
}) {

  if (filterKey) {
    inputData = inputData.filter(
      (group) => group.groupname.toLowerCase().indexOf(filterKey.toLowerCase()) !== -1
    );
  }

  return inputData;
}