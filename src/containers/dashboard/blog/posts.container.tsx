import React, { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
//mui
import { SelectChangeEvent } from '@mui/material';
//next
import { TFunctionDetailedResult } from 'i18next';
//locales
import { useLocales } from '../../../locales';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//type
import { AuthUserType } from '../../../auth/types';
import { IBlog } from '../../../shared/types/blog';
import {
  IDocCategory,
  IDocCategoryResGetAll
} from '../../../shared/types/docCategory';
//api
import blogsApi from '../../../api/blogsApi';
import docCategoriesApi from '../../../api/docCategoriesApi';
//store
import useBimBlogDefaultStore from '../../../redux/blogStore/bimBlogDefaultStore';
import useBimBlogStore from '../../../redux/blogStore/bimBlogStore';
import useDocCategory from '../../../redux/docCategoryStore';
//component
import {
  DateRangePickerProps,
  useDateRangePicker
} from '../../../components/date-range-picker';
import { TableProps, useTable } from '../../../components/table';
import PostsComponent from '../../../components/dashboard/blog/posts.component';
//----------------------------------
export type ILocalState = {
  category: string;
  description: string;
  title: string;
  loading: boolean;
  filterCategory: string;
  sortBy: string;
  sortType: string;
  keySearch: string;
  fromDate: string;
};
export type IBlogAttribute = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  user: AuthUserType;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  table: TableProps;
  datePicker: DateRangePickerProps;
  isFiltered: boolean;
  posts: IBlog[];
  setPosts: (bimBlog: IBlog[]) => void;
  setIsMyPostsPage: (value: boolean) => void;
  blogCategories: IDocCategory[];
  setBlogCategories: (blogCategory: IDocCategory[]) => void;
  isNotFound: boolean;
  SORT_OPTIONS: any[];
  CATEGORIES_OPTIONS: any[];
};
export type IBlogFunction = {
  getAllPosts: () => Promise<void>;
  loadAllDocCategories: () => Promise<void>;
  handleChangeSortBy: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterCategory: (event: SelectChangeEvent<string>) => void;
  handleSearchKeyName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getPostsSearch: () => Promise<void>;
  handleResetFilter: () => Promise<void>;
};
const blogAttribute = (): IBlogAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    category: '',
    description: '',
    title: '',
    sortBy: 'createdAt',
    sortType: 'asc',
    filterCategory: '',
    loading: false,
    keySearch: '',
    fromDate: ''
  });

  const table = useTable({ defaultRowsPerPage: 9 });
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const datePicker = useDateRangePicker(null, null);

  const { setIsMyPostsPage } = useBimBlogStore(
    (state) => ({
      setIsMyPostsPage: state.setIsMyPostsPage
    }),
    shallow
  );
  const { posts, setPosts } = useBimBlogDefaultStore(
    (state) => ({
      posts: state.datas,
      setPosts: state.setDatas
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
  const isFiltered =
    localState.keySearch !== '' ||
    !!localState.filterCategory.length ||
    (!!datePicker.startDate && !!datePicker.endDate) ||
    localState.filterCategory !== '' ||
    localState.sortBy !== 'createdAt';
  const isNotFound = !posts.length;
  const SORT_OPTIONS = [
    { value: 'createdAt', label: `${translate('common.latest')}` },
    { value: 'views', label: `${translate('common.most_viewed')}` },
    { value: 'title', label: `${translate('common.sort_title')}` }
  ];
  const CATEGORIES_OPTIONS = blogCategories.map((status) => {
    return { value: `${status._id}`, label: `${status.name}` };
  });
  //-------
  return {
    localState,
    setLocalState,
    user,
    translate,
    table,
    datePicker,
    isFiltered,
    posts,
    setPosts,
    setIsMyPostsPage,
    blogCategories,
    setBlogCategories,
    isNotFound,
    SORT_OPTIONS,
    CATEGORIES_OPTIONS
  };
};
const blogFunction = ({
  props,
  state,
  setState
}: {
  props: IBlogAttribute;
  state: ILocalState;
  setState: Function;
}): IBlogFunction => {
  /* ----------------------HANDLE CALL API ---------------------- */
  //handle get all posts
  const getAllPosts = useCallback(async () => {
    try {
      const response = await blogsApi.getAllBlogs(null);
      const newPosts = response.data.filter((post) => post.isPublish !== null);
      props.setPosts(newPosts);
    } catch (error) {
      console.error(error);
    }
  }, []);
  // handle get all categories
  const loadAllDocCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    props.setBlogCategories(apiRes.data);
  }, []);
  //get posts search
  const getPostsSearch = async () => {
    const params = {
      sortBy: props.localState.sortBy,
      sortType: props.localState.sortType,
      title: props.localState.keySearch,
      category: props.localState.filterCategory,
      fromDate: props.datePicker.startDate,
      toDate: props.datePicker.endDate
    };
    const res = await blogsApi.getAllBlogs(params);
    const newPosts = res.data.filter((post) => post.isPublish !== null);
    props.setPosts(newPosts);
    props.table.setPage(0);
  };
  // handle reset search
  const handleResetFilter = async () => {
    const res = await blogsApi.getAllBlogs(null);
    const newPosts = res.data.filter((post) => post.isPublish !== null);
    props.setPosts(newPosts);
    setState((prevState: ILocalState) => ({
      ...prevState,
      sortBy: 'createdAt',
      keySearch: '',
      filterCategory: ''
    }));
    if (props.datePicker.onReset) {
      props.datePicker.onReset();
    }
    props.table.setPage(0);
  };
  /* ---------------HANDLE LOCAL ---------------- */
  //handle change sort
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
  //filter categories
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
  // handle search name
  const handleSearchKeyName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      keySearch: event.target.value,
      title: event.target.value
    }));
  };
  return {
    getAllPosts,
    loadAllDocCategories,
    handleChangeSortBy,
    handleFilterCategory,
    handleSearchKeyName,
    getPostsSearch,
    handleResetFilter
  };
};
const PostsContainer = () => {
  let props = blogAttribute();
  const { localState, setLocalState } = props;

  let func = blogFunction({
    props,
    state: localState,

    setState: setLocalState
  });
  //render all Post
  useEffect(() => {
    func.getAllPosts();
  }, []);
  //render all categories
  useEffect(() => {
    func.loadAllDocCategories();
  }, []);
  return (
    <>
      <PostsComponent props={props} func={func} />
    </>
  );
};
export default PostsContainer;
