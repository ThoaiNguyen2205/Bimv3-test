import * as Yup from 'yup';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
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
// next
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
//locales
import { useLocales } from '../../../locales';
//type
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '../../../shared/types/docCategory';
import { IBlog, IBlogReqCreate } from '../../../shared/types/blog';
import { IUser } from '../../../shared/types/user';
//api
import docCategoriesApi from '../../../api/docCategoriesApi';
import uploadsApi from '../../../api/uploadsApi';
import blogsApi from '../../../api/blogsApi';
//hook
import FormProvider, {
  RHFSwitch,
  RHFTextField
} from '../../../components/hook-form';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//store
import useDocCategory from '../../../redux/docCategoryStore';
import useBimBlogStore from '../../../redux/blogStore/bimBlogStore';
//components
import { UploadLandscape } from '../../../components/upload';
import { useSnackbar } from '../../../components/snackbar';
import { Page404 } from '../share/error';
//sections

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
  createdBy: string;
};
export default function BlogEditPostForm() {
  const router = useRouter();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [post, setPost] = useState<IBlog | null>(null);
  const {
    query: { title }
  } = useRouter();
  const { contentEdit, setContentEdit } = useBimBlogStore(
    (state) => ({
      contentEdit: state.contentEdit,
      setContentEdit: state.setContentEdit
    }),
    shallow
  );
  const { blogCategories, setBlogCategories } = useDocCategory(
    (state) => ({
      blogCategories: state.datas,
      setBlogCategories: state.setDatas
    }),
    shallow
  );
  const defaultValues = useMemo(
    () => ({
      title: post?.title || '',
      description: post?.description || '',
      avatar: post?.cover || '',
      category: post?.category ? (post?.category as IDocCategory)._id : '',
      publish: post?.isPublish !== null || false,
      comment: post?.isComment !== null || false
    }),
    []
  );
  const [localState, setLocalState] = useState({
    avatarUrl: `${process.env.REACT_APP_APIFILE}images/${defaultValues.avatar}`,
    checkUpload: false,
    progress: 0,
    progressShow: false,
    selectedCategoryId: '',
    createdBy: ''
  });
  const isOwner = user?.id === localState.createdBy;
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
  //* --------------------HANDLE API-------------------- */
  //handle categories
  const handleCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    setBlogCategories(apiRes.data);
  }, []);
  // handle get detail post
  const getDetailPost = useCallback(async () => {
    const response = await blogsApi.getReadById(title as string);
    setPost(response);
    setContentEdit(response.content as string);
  }, [post]);
  //handle submit
  const onSubmit = async (data: FormValuesProps) => {
    try {
      const newValuesCreate: IBlogReqCreate = {
        title: data.title,
        createdBy: user?.id,
        cover: data.cover,
        content: contentEdit,
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

      await blogsApi.updateById(title as string, newValuesCreate);

      reset();
      // handleClosePreview();
      enqueueSnackbar(`${translate('blog.save_post_success')}`);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: '',
        selectedCategoryId: ''
      }));
      setContentEdit('');
      router.push(PATH_DASHBOARD.blog.personal);
    } catch (error) {
      console.error(error);
    }
  };
  //* ------------------HANDLE LOCAL------------------- */
  //handle change category
  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedCategoryId: event?.target.value
    }));
    setValue('category', event?.target.value);
  };
  //handle drop avatar
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
  //handle change content
  const handleChangeContent = (value: string) => {
    setContentEdit(encodeURIComponent(value));
  };
  // handle render categories
  useEffect(() => {
    handleCategories();
    if (post !== null) {
      if (post.category !== undefined) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          selectedCategoryId: (post.category as IDocCategory)._id
        }));
        setValue('category', (post.category as IDocCategory)._id);
      }
    }
  }, [post]);
  //handle render detail post
  useEffect(() => {
    getDetailPost();
  }, []);
  useEffect(() => {
    if (post) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: `${process.env.REACT_APP_APIFILE}images/${post.cover}`,
        createdBy: (post.createdBy as IUser).id
      }));

      setValue('title', post.title);
      setValue('description', post.description);
      setValue('publish', post.isPublish !== null || false);
      setValue('comment', post.isComment !== null || false);
    }
  }, [post]);

  if (isOwner) {
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
                      value={decodeURIComponent(contentEdit)}
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
  return (
    <Page404
      linkTo={PATH_DASHBOARD.blog.root}
      title={`${translate('blog.page_not_found')}`}
      description={`${translate('blog.owner_error')}`}
      button={`${translate('blog.go_to_blog')}`}
    />
  );
}
