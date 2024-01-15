import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
//mui
import { Button, SelectChangeEvent } from '@mui/material';
//next
import { TFunctionDetailedResult } from 'i18next';
import { NextRouter, useRouter } from 'next/router';
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar
} from 'notistack';
//locales
import { useLocales } from '../../../locales';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//type
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import { AuthUserType } from '../../../auth/types';
import { IBlog, IBlogResGetAll } from '../../../shared/types/blog';
import { IDialogCoverProps } from '../../../sections/@dashboard/share/dialog/BoxInfoCover';
import { IBlogShareDialog } from '../../../sections/@dashboard/blog/dialog/CopyLinkDialog';
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '../../../shared/types/docCategory';
//store
import useBimBlogDefaultStore from '../../../redux/blogStore/bimBlogDefaultStore';
import useBimBlogStore from '../../../redux/blogStore/bimBlogStore';
import useDocCategory from '../../../redux/docCategoryStore';
//api
import blogsApi from '../../../api/blogsApi';
import docCategoriesApi from '../../../api/docCategoriesApi';
//component
import BlogPersonalComponent from '../../../components/dashboard/blog/personal.component';
import {
  DateRangePickerProps,
  useDateRangePicker
} from '../../../components/date-range-picker';
import { TableProps, useTable } from '../../../components/table';

//----------------------------------
export type IPersonalAttribure = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  posts: IBlog[];
  setPosts: (bimBlog: IBlog[]) => void;
  selectedPost: IBlog | null;
  setSelectedPost: (bimBlog: IBlog | null) => void;
  isMyPostsPage: boolean;
  setIsMyPostsPage: (value: boolean) => void;
  blogCategories: IDocCategory[];
  setBlogCategories: (blogCategory: IDocCategory[]) => void;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  user: AuthUserType;
  table: TableProps;
  datePicker: DateRangePickerProps;
  isFiltered: boolean;
  isNotFound: boolean;
  SORT_OPTIONS: any[];
  CATEGORIES_OPTIONS: any[];
  setContentPost: (newValue: string) => void;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  router: NextRouter;
};
export type IPersonalFunction = {
  getAllMyPosts: () => Promise<void>;
  loadAllDocCategories: () => Promise<void>;
  handleDeletePost: (id: string) => Promise<void>;
  handleChangeSortBy: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterCategory: (event: SelectChangeEvent<string>) => void;
  handleSearchKeyName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getPostsSearchByUser: () => Promise<void>;
  handleResetFilter: () => Promise<void>;
  handleOpenShareForm: (blog: IBlog | null) => Promise<void>;
  handleEditPost: (id: string) => void;
  handleDeletePostConfirm: (postId: string | null) => void;
  handlePreview: (postId: string) => void;
  handleOpenViewCover: (coverString: string | null) => void;
};
type ILocalState = {
  category: string;
  description: string;
  title: string;
  loading: boolean;
  filterCategory: string;
  sortBy: string;
  sortType: string;
  keySearch: string;
  fromDate: string;
  dataDialog: ConfirmDialogProps;
  dataDialogView: IDialogCoverProps;
  dataDialogShare: IBlogShareDialog;
  openDeletePost: boolean;
  openPermission: boolean;
};
//---------------------------------------
const personalAttribute = (): IPersonalAttribure => {
  const [localState, setLocalState] = useState<ILocalState>({
    openPermission: false,
    openDeletePost: false,
    loading: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    dataDialogView: {
      open: false,
      onClose: () => {},
      cover: ''
    },
    dataDialogShare: {
      open: false,
      onClose: () => {},
      blog: null
    },
    category: '',
    description: '',
    title: '',
    sortBy: 'createdAt',
    sortType: 'asc',
    filterCategory: '',
    keySearch: '',
    fromDate: ''
  });
  const { posts, setPosts, selectedPost, setSelectedPost } =
    useBimBlogDefaultStore((state) => ({
      posts: state.datas,
      selectedPost: state.selectedData,
      setPosts: state.setDatas,
      setSelectedPost: state.setSelectedData
    }));
  const { isMyPostsPage, setIsMyPostsPage, setContentPost } = useBimBlogStore(
    (state) => ({
      isMyPostsPage: state.isMyPostsPage,
      setIsMyPostsPage: state.setIsMyPostsPage,
      setContentPost: state.setContentPost
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
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 10 });
  const datePicker = useDateRangePicker(null, null);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const isFiltered =
    localState.keySearch !== '' ||
    !!localState.filterCategory.length ||
    (!!datePicker.startDate && !!datePicker.endDate) ||
    localState.sortBy !== 'createdAt';
  const isNotFound = !posts.length;
  const SORT_OPTIONS = [
    { value: 'createdAt', label: `${translate('common.latest')}` },
    { value: 'views', label: `${translate('common.most_viewed')}` },
    { value: 'title', label: `${translate('common.sort_title')}` }
  ];
  const CATEGORIES_OPTIONS = blogCategories.map((status, index) => {
    return { value: `${status._id}`, label: `${status.name}` };
  });
  return {
    localState,
    setLocalState,
    posts,
    setPosts,
    selectedPost,
    setSelectedPost,
    isMyPostsPage,
    setIsMyPostsPage,
    blogCategories,
    setBlogCategories,
    translate,
    user,
    table,
    datePicker,
    isFiltered,
    isNotFound,
    SORT_OPTIONS,
    CATEGORIES_OPTIONS,
    setContentPost,
    enqueueSnackbar,
    router
  };
};
const personalFunction = ({
  props,
  state,
  setState
}: {
  props: IPersonalAttribure;
  state: ILocalState;
  setState: Function;
}): IPersonalFunction => {
  /* ======================= CALL API ==========================*/
  //hanlde get myPosst
  const getAllMyPosts = useCallback(async () => {
    try {
      const params = {
        createdBy: props.user?.id
      };
      const response: IBlogResGetAll = await blogsApi.getAllBlogs(params);
      props.setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [props.user]);
  //handle get all categories
  const loadAllDocCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    props.setBlogCategories(apiRes.data);
  }, []);
  // handle delete post
  const handleDeletePost = async (postId: string) => {
    await blogsApi.deleteById(postId);
    getAllMyPosts();
    handleDeletePostConfirm(null);
  };
  //handle get posts search
  const getPostsSearchByUser = async () => {
    const params = {
      sortBy: props.localState.sortBy,
      sortType: props.localState.sortType,
      title: props.localState.keySearch,
      category: props.localState.filterCategory,
      createdBy: props.user?.id,
      fromDate: props.datePicker.startDate,
      toDate: props.datePicker.endDate
    };
    const res = await blogsApi.getAllBlogs(params);
    props.setPosts(res.data);
    props.table.setPage(0);
  };
  //handle reset search
  const handleResetFilter = async () => {
    const params = {
      createdBy: props.user?.id
    };
    const res = await blogsApi.getAllBlogs(params);
    props.setPosts(res.data);
    setState((prevState: ILocalState) => ({
      ...prevState,
      sortBy: 'createdAt',
      keySearch: '',
      filterCategory: ''
    }));
    if (props.datePicker.onReset) {
      props.datePicker.onReset();
    }
  };

  /* ====================HANDLE LOCAL=======================*/
  // handle sort
  const handleChangeSortBy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      sortBy: event.target.value
    }));
    if (event.target.value === 'title') {
      setState((prevState: ILocalState) => ({
        ...prevState,
        sortType: 'desc'
      }));
    } else {
      setState((prevState: ILocalState) => ({
        ...prevState,
        sortType: 'asc'
      }));
    }
  };
  //handle filter category
  const handleFilterCategory = (event: SelectChangeEvent<string>) => {
    const {
      target: { value: value }
    } = event;
    if (value === 'all') {
      setState((prevState: ILocalState) => ({
        ...prevState,
        // filterCategory: typeof value === 'string' ? value.split(',') : value,
        filterCategory: ''
      }));
      return;
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      // filterCategory: typeof value === 'string' ? value.split(',') : value,
      filterCategory: value
    }));
  };
  //handle key name
  const handleSearchKeyName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      keySearch: event.target.value,
      title: event.target.value
    }));
  };

  // handle open share
  const handleOpenShareForm = async (blog: IBlog | null) => {
    let dataDialog = {
      open: false,
      onClose: () => handleOpenShareForm(null),
      blog: blog
    };
    if (blog === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialogShare: dataDialog
      }));
      return;
    }

    const filterBlog = props.posts.filter(
      (project: any) => project._id === blog._id
    );
    const selDoc = filterBlog[0];
    props.setSelectedPost(selDoc);
    dataDialog = {
      open: true,
      onClose: () => handleOpenShareForm(null),
      blog: blog
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialogShare: dataDialog
    }));
  };
  //handle edit post
  const handleEditPost = (id: string) => {
    const postFind = props.posts.find((post) => post._id === id);
    if (postFind) {
      props.setSelectedPost(postFind);
    }
    props.router.push(PATH_DASHBOARD.blog.title(id));
  };

  //handle delete dialog
  const handleDeletePostConfirm = (postId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeletePostConfirm(null)
    };
    if (postId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog: dataDialog
      }));
      return;
    }
    const filterPosts = props.posts.filter((post) => post._id === postId);
    if (filterPosts.length > 0) {
      const selectedPost = filterPosts[0];
      dataDialog = {
        open: true,
        onClose: () => handleDeletePostConfirm(null),
        title: `${props.translate('blog.posts')}: ${selectedPost.title}`,
        content: `${props.translate('common.delete_confirm')}`,
        action: (
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (selectedPost._id !== null) {
                await handleDeletePost(postId);
                props.enqueueSnackbar(
                  `${props.translate('documents.delete_success')}`,
                  {
                    variant: 'success'
                  }
                );
              }
            }}>
            {`${props.translate('common.delete')}`}
          </Button>
        )
      };
    }

    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog: dataDialog
    }));
  };
  //handle preview
  const handlePreview = (postId: string) => {
    props.router.push(PATH_DASHBOARD.blog.view(postId));
  };
  //handle view cover
  const handleOpenViewCover = (coverString: string | null) => {
    let dataDialogView: IDialogCoverProps = {
      open: false,
      onClose: () => handleOpenViewCover(null),
      cover: ''
    };
    if (coverString === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialogView
      }));
      return;
    }
    dataDialogView = {
      open: true,
      onClose: () => handleOpenViewCover(null),
      cover: coverString
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialogView
    }));
  };

  return {
    getAllMyPosts,
    loadAllDocCategories,
    handleDeletePost,
    handleChangeSortBy,
    handleFilterCategory,
    handleSearchKeyName,
    getPostsSearchByUser,
    handleResetFilter,
    handleOpenShareForm,
    handleEditPost,
    handleDeletePostConfirm,
    handlePreview,
    handleOpenViewCover
  };
};
const BlogPersonalContainer = () => {
  let props = personalAttribute();
  const { localState, setLocalState } = props;
  let func = personalFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  //render all post
  useEffect(() => {
    func.getAllMyPosts();
  }, [props.user]);
  //render all categories
  useEffect(() => {
    func.loadAllDocCategories();
  }, []);
  return (
    <>
      <BlogPersonalComponent props={props} func={func} />
    </>
  );
};
export default BlogPersonalContainer;
