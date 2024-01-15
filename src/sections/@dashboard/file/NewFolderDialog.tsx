import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
// apis
import foldersApi from 'src/api/foldersApi';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import logsApi from 'src/api/logsApi';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useSnackbar } from 'src/components/snackbar';
// enums
import { LogType } from 'src/shared/enums';
// type
import { IFolder, IFolderReqCreate } from 'src/shared/types/folder';
import { IGroupInFolderReqCreate } from 'src/shared/types/groupInFolder';
import { ISystemLogReqCreate } from 'src/shared/types/systemlog';
// helper
import { removeAccents } from 'src/shared/helpers/stringHelpers';
import { IGroup } from 'src/shared/types/group';
// ----------------------------------------------------------------------

type ILocalState = {
  copyPermit: boolean,
  isSubmitting: boolean,
}

type FormValuesProps = {
  foldername: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  isEdit: boolean;
  renameFolder: IFolder | null;
  onClose: VoidFunction;
  getFolderTree: VoidFunction;
  // onLoadFolders: (folderId: string) => void;
}

export default function NewFolderDialog({
  open,
  isEdit,
  renameFolder,
  onClose,
  getFolderTree,
  // onLoadFolders,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  
  const [localState, setLocalState] = useState<ILocalState>({
    copyPermit: true,
    isSubmitting: false,
  });

  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const newFolderSchema = Yup.object().shape({
    foldername: Yup.string().required(translate('projects.name_required')),
  });

  const defaultValues = useMemo(() => ({
    foldername: renameFolder?.displayName || '',
  }), [renameFolder]);

  const handleCopy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      copyPermit: event.target.checked,
    }));
  };

  useEffect(() => {
    if (isEdit && renameFolder) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }    
  }, [isEdit, renameFolder]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newFolderSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    if (selectedFolder === null) {
      enqueueSnackbar(`${translate('cloud.select_root_folder_required')}`, {
        variant: 'info',
      });
      return;
    }
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));

    const path = selectedFolder.path + selectedFolder.storeName + '/';
    const randomTag = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const uniqueDate = Date.now().toString(36);
    const newFolder: IFolderReqCreate = {
      customer: user?.customer._id,
      project: user?.project._id,
      path: path,
      displayName: data.foldername,
      storeName: removeAccents(data.foldername) + `-${randomTag + uniqueDate}`,
      createdBy: user?.id,
      updatedName: user?.username,
    }

    const renameFolderData: IFolderReqCreate = {
      displayName: data.foldername,
      createdBy: user?.id,
      updatedName: user?.username,
      updatedId: user?.id,
    }
    
    if (isEdit) {
      if (renameFolder !== null) {
        const updateResponse = await foldersApi.updateById(renameFolder._id, renameFolderData);
        enqueueSnackbar(`${translate('cloud.updated_folder_successfull')}`, {
          variant: 'info',
        })
      }
    } else {
      const createResponse = await foldersApi.postCreate(newFolder);
      if (createResponse) {
        if (localState.copyPermit === true) {
          // copy phân quyền từ cha
          const param = {
            folder: selectedFolder._id,
          }
          const folderGroups = await groupInFoldersApi.getGroupsInFolder(param);
          for (const group of folderGroups.data) {
            const newGroupInProjectData: IGroupInFolderReqCreate = {
              folder: createResponse._id,
              group: (group.group as IGroup)._id,
              isEdit: group.isEdit,
              isUpdate: group.isUpdate,
              isDownload: group.isDownload,
              isApprove: group.isApprove,
              isConfirm: group.isConfirm,
            }
            await groupInFoldersApi.postCreate(newGroupInProjectData);
          }
          
          const pathSplit = path.split('/');
          const lastFolder = pathSplit[pathSplit.length - 2];
          
          if (lastFolder === 'bn_wip' || lastFolder === 'bn_shared' || lastFolder === 'bn_public' || lastFolder === 'bn_archived') {
            // Tạo phân quyền cho nhóm người dùng tạo thư mục
            const newGroupInProjectData: IGroupInFolderReqCreate = {
              folder: createResponse._id,
              group: user?.group._id,
              isEdit: true,
              isUpdate: true,
              isDownload: true,
              isApprove: true,
              isConfirm: true,
            }
            await groupInFoldersApi.postCreate(newGroupInProjectData);
          }
        } else {
          // Tạo phân quyền cho nhóm người dùng tạo thư mục
          const newGroupInProjectData: IGroupInFolderReqCreate = {
            folder: createResponse._id,
            group: user?.group._id,
            isEdit: true,
            isUpdate: true,
            isDownload: true,
            isApprove: true,
            isConfirm: true,
          }
          await groupInFoldersApi.postCreate(newGroupInProjectData);
        }

        enqueueSnackbar(`${translate('cloud.created_folder_successfull')}`, {
          variant: 'info',
        })
      }
      
    }
    getFolderTree();
    // onLoadFolders(selectedFolder._id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
    onCancel();
  };

  const onCancel = () => {
    reset({foldername: ''});
    onClose();
    reset();
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onCancel} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {isEdit ? `${translate('cloud.folder')} ${renameFolder?.displayName}` : `${translate('cloud.new_folder')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <RHFTextField size='small' name="foldername" label={`${translate('cloud.folder_name')}`} />
          </Stack>

          {!isEdit ?
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <FormControlLabel
                control={<Checkbox defaultChecked onChange={handleCopy} />}
                label={`${translate('cloud.copy_father_permit')}`}
              />
            </Stack>
            : null
          }

        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={localState.isSubmitting}
            startIcon={!isEdit ? <Iconify icon="material-symbols:create-new-folder-rounded" /> : <Iconify icon="gg:rename" />}>
            {isEdit ? `${translate('cloud.rename')}` : `${translate('cloud.create')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}
