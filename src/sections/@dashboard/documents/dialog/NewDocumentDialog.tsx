import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Box,
  Stack,
  Button,
  Dialog,
  LinearProgress,
  MenuItem,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  TextField
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
//next
import { useRouter } from 'next/router';
//router
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/iconify';
import FormProvider, {
  RHFTextField,
  RHFSwitch
} from '../../../../components/hook-form';
import { UploadLandscape } from '../../../../components/upload';
import { useSnackbar } from '../../../../components/snackbar';
// AuthContext
import { useAuthContext } from '../../../../auth/useAuthContext';
// Locales
import { useLocales } from '../../../../locales';
// apis
import uploadsApi from '../../../../api/uploadsApi';
import bimDocumentsApi from '../../../../api/bimDocumentsApi';
import docCategoriesApi from '../../../../api/docCategoriesApi';
// zustand store
import useDocCategory from '../../../../redux/docCategoryStore';
import useBimDocument from '../../../../redux/bimDocumentStore';
import { shallow } from 'zustand/shallow';
// type
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '../../../../shared/types/docCategory';
import {
  IBimDocument,
  IBimDocumentReqCreate,
  IBimDocumentResGetAll
} from '../../../../shared/types/bimDocument';

// ----------------------------------------------------------------------

type LocalState = {
  avatarUrl: string;
  checkUpload: boolean;
  progress: number;
  progressShow: boolean;
  selectedCategoryId: string;
};

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string;
  category: string;
  description: string;
  avatar: string;
  publish: boolean;
  comment: boolean;
  afterSubmit: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  isEdit?: boolean;
  onClose: VoidFunction;
}

export default function NewDocumentDialog({
  open,
  isEdit,
  onClose,
  ...other
}: Props) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { documents, setDocuments, selectedDocument, setSelectedDocument } =
    useBimDocument(
      (state) => ({
        documents: state.datas,
        setDocuments: state.setDatas,
        selectedDocument: state.selectedData,
        setSelectedDocument: state.setSelectedData
      }),
      shallow
    );

  const { docCategories, setDocCategories } = useDocCategory(
    (state) => ({
      docCategories: state.datas,
      setDocCategories: state.setDatas
    }),
    shallow
  );

  const newCustomerSchema = Yup.object().shape({
    name: Yup.string().required(translate('documents.document_name_required')),
    description: Yup.string().required(
      translate('documents.description_required')
    )
  });
  const defaultValues = useMemo(
    () => ({
      name: selectedDocument?.title || '',
      description: selectedDocument?.description || '',
      category: selectedDocument?.category
        ? (selectedDocument?.category as IDocCategory)._id
        : '',
      avatar: selectedDocument?.cover || 'document.jpg',
      publish: (selectedDocument?.isPublish === null ? false : true) || false,
      comment: (selectedDocument?.isComment === null ? false : true) || false
    }),
    [selectedDocument]
  );

  const [localState, setLocalState] = useState<LocalState>({
    avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
    selectedCategoryId: ''
  });
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newCustomerSchema),
    defaultValues
  });
  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = methods;

  /*==================HANDLE API================== */
  // Load all document categories
  const loadAllDocCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    setDocCategories(apiRes.data);
  }, []);
  // handle get document
  const loadAllDocuments = async () => {
    const params = {
      createdBy: user?.id
    };
    const apiRes: IBimDocumentResGetAll = await bimDocumentsApi.getAllDocuments(
      params
    );
    setDocuments(apiRes.data);
  };
  //handle submit
  const onSubmit = async (data: FormValuesProps) => {
    if (data.category === '') {
      enqueueSnackbar(`${translate('documents.category_required')}`, {
        variant: 'error'
      });

      return;
    }

    const newDocumentData: IBimDocumentReqCreate = {
      title: data.name,
      category: data.category,
      description: data.description,
      cover: data.avatar,
      createdBy: user?.id,
      isPublish: data.publish === true ? new Date() : null,
      isComment: data.comment === true ? new Date() : null
    };

    if (localState.checkUpload) {
      setLocalState((prevState: LocalState) => ({
        ...prevState,
        progressShow: true
      }));

      const formData = new FormData();
      formData.append('image', localState.avatarUrl);
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: LocalState) => ({
          ...prevState,
          progress: Math.round((100 * e.loaded) / e.total)
        }));
      };
      const ufileResponse = await uploadsApi.uploadImage(
        formData,
        onUploadProgress
      );

      newDocumentData.cover = ufileResponse.filename;
      setLocalState((prevState: LocalState) => ({
        ...prevState,
        progressShow: false
      }));
    }

    if (isEdit === true) {
      const updateDocument = await bimDocumentsApi.updateById(
        (selectedDocument as IBimDocument)._id,
        newDocumentData
      );
      enqueueSnackbar(`${translate('documents.modify_success')}`, {
        variant: 'success'
      });
    } else {
      // kiểm tra tiêu đề trùng trong chuyên mục
      const findTitle = documents.find(
        (docs: any) =>
          docs.category._id === newDocumentData.category &&
          docs.title === newDocumentData.title
      );
      if (findTitle) {
        enqueueSnackbar(`${translate('documents.similar_category_title')}`, {
          variant: 'warning'
        });
        return;
      }
      const newDocument = await bimDocumentsApi.postCreate(newDocumentData);
      enqueueSnackbar(`${translate('documents.add_success')}`, {
        variant: 'success'
      });
    }

    loadAllDocuments();
    handleResetFormData();
    onClose();
    reset();
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      avatarUrl: ''
    }));
    if (router.pathname !== PATH_DASHBOARD.document.personal) {
      router.push(PATH_DASHBOARD.document.personal);
    }
  };

  /*===========HANDLE LOCAL=========== */
  //handle change category
  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      selectedCategoryId: event?.target.value
    }));
    setValue('category', event?.target.value);
  };

  //handle reset reset form
  const handleResetFormData = () => {
    setSelectedDocument(null);
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      isEdit: false,
      avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
      selectedCategoryId: ''
    }));
  };
  //handle drop avatar
  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const newAvatar = acceptedFiles[0];
    if (newAvatar) {
      setLocalState((prevState: LocalState) => ({
        ...prevState,
        avatarUrl: Object.assign(newAvatar, {
          preview: URL.createObjectURL(newAvatar)
        }),
        checkUpload: true
      }));
    }
  }, []);
  //handle cancel
  const onCancel = () => {
    onClose();
    reset();
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      selectedCategoryId: '',
      avatarUrl: ''
    }));
  };
  useEffect(() => {
    loadAllDocCategories();
    if (selectedDocument !== null) {
      if (selectedDocument.category !== undefined) {
        setLocalState((prevState: LocalState) => ({
          ...prevState,
          selectedCategoryId: (selectedDocument.category as IDocCategory)._id
        }));
        setValue('category', (selectedDocument.category as IDocCategory)._id);
      }
    }
  }, [selectedDocument]);
  useEffect(() => {
    if (isEdit && selectedDocument) {
      reset(defaultValues);
      setLocalState((prevState: LocalState) => ({
        ...prevState,
        avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`
      }));
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, selectedDocument]);
  return (
    <Dialog
      className="document-dialog"
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle className="document-dialog__title">
          {isEdit
            ? `${translate('nav.project')} ${selectedDocument?.title}`
            : `${translate('documents.new_doc')}`}
        </DialogTitle>

        <DialogContent className="document-dialog__content">
          {!!errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit.message}</Alert>
          )}

          <Box className="content__upload">
            <UploadLandscape
              file={localState.avatarUrl}
              onDrop={handleDropAvatar}
              helperText={
                <Typography className="content__upload-note" variant="caption">
                  {`${translate('customers.file_accepted')}`}
                </Typography>
              }
              sx={{ height: 250 }}
            />
            {localState.progressShow ? (
              <LinearProgress
                variant="determinate"
                value={localState.progress}
                color="success"
              />
            ) : null}
          </Box>

          <Stack className="content__input">
            <RHFTextField
              className="content__input-title"
              size="small"
              name="name"
              label={`${translate('documents.document_name')}`}
            />
            <TextField
              className="content__input-category"
              size="small"
              name="category"
              fullWidth
              select
              label={`${translate('documents.category')}`}
              value={localState.selectedCategoryId || ''}
              onChange={onChangeCategory}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 260
                    }
                  }
                }
              }}>
              {docCategories.map((option) => (
                <MenuItem
                  className="category__item"
                  key={option._id}
                  value={option._id}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize'
                  }}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack className="content__description">
            <RHFTextField
              size="small"
              name="description"
              label={`${translate('projects.description')}`}
              multiline={true}
            />
          </Stack>

          <Stack className="content__settings">
            <RHFSwitch
              className="content__settings-publish"
              name="publish"
              label={`${translate('documents.publish')}`}
              labelPlacement="start"
            />

            <RHFSwitch
              className="content__settings-comment"
              name="comment"
              label={`${translate('documents.is_comments')}`}
              labelPlacement="start"
            />
          </Stack>
        </DialogContent>

        <DialogActions className="document-dialog__action">
          <Button
            className="document-dialog__action-button"
            color="inherit"
            variant="outlined"
            onClick={onCancel}
            startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton
            className="document-dialog__action-button"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="bxs:edit" />}>
            {isEdit
              ? `${translate('common.modify')}`
              : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
