import { useState, useCallback, useMemo, useEffect } from 'react';
import * as Yup from 'yup';
import { shallow } from 'zustand/shallow';
// next
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import FormProvider, {
  RHFSwitch,
  RHFTextField
} from '../../../components/hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Card,
  Stack,
  Typography,
  TextField,
  MenuItem
} from '@mui/material';
import { Box } from '@mui/system';
//locales
import { useLocales } from '../../../locales';
//type
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '../../../shared/types/docCategory';
import { IBlogReqCreate } from '../../../shared/types/blog';
//api
import docCategoriesApi from '../../../api/docCategoriesApi';
import uploadsApi from '../../../api/uploadsApi';
import blogsApi from '../../../api/blogsApi';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//components
import { UploadLandscape } from '../../../components/upload';
import { useSnackbar } from '../../../components/snackbar';
//store
import useDocCategory from '../../../redux/docCategoryStore';
import useBimBlogStore from '../../../redux/blogStore/bimBlogStore';
import useBimBlogDefaultStore from '../../../redux/blogStore/bimBlogDefaultStore';
const RHFSunEditor = dynamic(
  () => import('../../../components/hook-form/RHFSunEditor'),
  { ssr: false }
);
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export type FormValuesProps = {
  title: string;
  category: string;
  description: string;
  cover: string;
  publish: boolean;
  comment: boolean;
};
type ILocalState = {
  avatarUrl: string;
  checkUpload: boolean;
  progress: number;
  progressShow: boolean;
  selectedCategoryId: string;
  contentInput: string;
};
export default function BlogNewPostForm() {
  const router = useRouter();

  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const {
    query: { title }
  } = useRouter();

  const { contentPost, setContentPost } = useBimBlogStore(
    (state) => ({
      contentPost: state.contentPost,
      setContentPost: state.setContentPost
    }),
    shallow
  );
  const { selectedPost, setSelectedPost } = useBimBlogDefaultStore((state) => ({
    selectedPost: state.selectedData,
    setSelectedPost: state.setSelectedData
  }));
  const defaultValues = useMemo(
    () => ({
      title: selectedPost?.title || '',
      description: selectedPost?.description || '',
      avatar: selectedPost?.cover,
      category: selectedPost?.category
        ? (selectedPost?.category as IDocCategory)._id
        : '',
      publish: selectedPost?.isPublish !== null || false,
      comment: selectedPost?.isComment !== null || false
    }),
    [selectedPost]
  );
  const [localState, setLocalState] = useState({
    avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
    selectedCategoryId: '',
    contentInput: ''
  });
  const { blogCategories, setDocCategories } = useDocCategory(
    (state) => ({
      blogCategories: state.datas,
      setDocCategories: state.setDatas
    }),
    shallow
  );
  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedCategoryId: event?.target.value
    }));
    setValue('category', event?.target.value);
  };
  const loadAllDocCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    setDocCategories(apiRes.data);
  }, []);
  useEffect(() => {
    loadAllDocCategories();
    if (selectedPost !== null) {
      if (selectedPost.category !== undefined) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          selectedCategoryId: (selectedPost.category as IDocCategory)._id
        }));
        setValue('category', (selectedPost.category as IDocCategory)._id);
      }
    }
  }, [selectedPost]);
  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required(`${translate('blog.post_title_required')}`),
    description: Yup.string().required(
      `${translate('blog.post_description_required')}`
    )
  });
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewBlogSchema),
    defaultValues
  });
  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid }
  } = methods;
  const onSubmit = async (data: FormValuesProps) => {
    try {
      const newValuesCreate: IBlogReqCreate = {
        title: data.title,
        createdBy: user?.id,
        cover: data.cover,
        content: contentPost,
        description: data.description,
        category: data.category,
        isComment: data.comment === true ? new Date() : null,
        isPublish: data.publish === true ? new Date() : null
      };
      if (localState.checkUpload) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          progressShow: true
        }));
        const formData = new FormData();
        formData.append('image', localState.avatarUrl);
        const onUploadProgress = (e: any) => {
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            progress: Math.round((100 * e.loaded) / e.total)
          }));
        };
        const ufileResponse = await uploadsApi.uploadImage(
          formData,
          onUploadProgress
        );
        newValuesCreate.cover = ufileResponse.filename;
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          progressShow: false
        }));
      }

      const createPost = await blogsApi.postCreate(newValuesCreate);

      reset();
      enqueueSnackbar(`${translate('blog.save_post_success')}`);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: '',
        selectedCategoryId: ''
      }));
      setContentPost('');
      router.push(PATH_DASHBOARD.blog.personal);
      console.log('DATA', newValuesCreate);
    } catch (error) {
      console.error(error);
    }
  };
  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const newAvatar = acceptedFiles[0];
    if (newAvatar) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: Object.assign(newAvatar, {
          preview: URL.createObjectURL(newAvatar)
        }),
        checkUpload: true
      }));
    }
  }, []);
  const handleChangeContent = (value: string) => {
    setContentPost(encodeURIComponent(value));
  };
  return (
    <Box className="blog-create">
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} className="blog-create__container">
          <Grid item xs={12} md={12} className="blog-create__form">
            <Card className="blog-create__form-card">
              <Stack spacing={1} className="create-card__cover">
                <Typography
                  className="create-card__cover-sub"
                  variant="subtitle2">
                  {`${translate('documents.cover')}`}
                </Typography>
                <Box className="create-card__cover-img">
                  <UploadLandscape
                    file={localState.avatarUrl}
                    onDrop={handleDropAvatar}
                    helperText={
                      <Typography
                        className="create-card__cover-caption"
                        variant="caption">
                        {`${translate('customers.file_accepted')}`}
                      </Typography>
                    }
                    sx={{ height: 300 }}
                  />
                </Box>
              </Stack>
              <Stack spacing={3} className="create-card__content">
                <TextField
                  className="create-card__content-category"
                  name="category"
                  fullWidth
                  select
                  label={`${translate('documents.category')}`}
                  value={localState.selectedCategoryId || ''}
                  onChange={onChangeCategory}>
                  {blogCategories.map((option) => (
                    <MenuItem
                      className="category__menu-item"
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
                <RHFTextField
                  className="create-card__content-title"
                  name="title"
                  label={`${translate('documents.title')}`}
                />
                <RHFTextField
                  className="create-card__content-description"
                  name="description"
                  label={`${translate('common.description')}`}
                />
                <Stack spacing={1} className="create-card__content-editor">
                  <Typography className="editor__sub" variant="subtitle2">
                    {`${translate('common.content')}`}
                  </Typography>
                  <RHFSunEditor
                    value={decodeURIComponent(contentPost)}
                    height="300"
                    handleEditorChange={handleChangeContent}
                  />
                </Stack>
                <Card className="create-card__content-switch">
                  <Box className="switch__box">
                    <RHFSwitch
                      className="switch__box-publish"
                      name="publish"
                      label={`${translate('documents.publish')}`}
                      labelPlacement="start"
                    />

                    <RHFSwitch
                      className="switch__box-commemts"
                      name="comment"
                      label={`${translate('documents.is_comments')}`}
                      labelPlacement="start"
                    />
                  </Box>
                </Card>
                <Stack
                  className="create-card__content-button"
                  direction="row"
                  spacing={1.5}>
                  <LoadingButton
                    className="create-button"
                    type="submit"
                    variant="contained"
                    // size="small"
                    loading={isSubmitting}>
                    {`${translate('blog.save_post')}`}
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </Box>
  );
}
