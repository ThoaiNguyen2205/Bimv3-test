import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
// type
import { IFileAndFolderSearching, IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// apis
import filesApi from 'src/api/filesApi';
// ----------------------------------------------------------------------

type FormValuesProps = {
  key: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  searchKey: string;
  onClose: VoidFunction;
  onLoadFolders: (folderId: string) => void;
  setSearchAllData: (searchRes: IFileAndFolderSearching) => void;
}

export default function SearchAllDialog({
  open,
  searchKey,
  onClose,
  onLoadFolders,
  setSearchAllData,
  ...other 
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const newFolderSchema = Yup.object().shape({
    key: Yup.string().required(translate('projects.name_required')),
  });

  const defaultValues = useMemo(() => ({
    key: searchKey || '',
  }), [searchKey]);


  useEffect(() => {
    if (searchKey) {
      reset(defaultValues);
    } 
  }, [searchKey]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newFolderSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    const param = {
      project: user?.project._id,
      searchKey: data.key,
    }
    const searchRes: IFileAndFolderSearching = await filesApi.getSearchAllFolder(user?.id, user?.class.uclass, param);
    window.history.replaceState(null, '', `?search=${data.key}`);
    setSearchAllData(searchRes);
    reset();
    onClose();
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('cloud.search_all')}`} </DialogTitle>

        <DialogContent>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <RHFTextField name="key" label={`${translate('cloud.key')}`} />
          </Stack>

        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="icon-park-outline:search" />}>
            {`${translate('common.search')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}
