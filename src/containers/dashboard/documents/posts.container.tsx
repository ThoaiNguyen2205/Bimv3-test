import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
//mui
import { SelectChangeEvent } from '@mui/material';
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
//contexts
import { useAuthContext } from '../../../auth/useAuthContext';
//types
import { AuthUserType } from '../../../auth/types';
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import {
  IBimDocument,
  IBimDocumentResGetAll
} from '../../../shared/types/bimDocument';
import { IDocCategory } from '../../../shared/types/docCategory';
//apis
import bimDocumentsApi from '../../../api/bimDocumentsApi';
//stores
import useBimDocument from '../../../redux/bimDocumentStore';
import useDocCategory from '../../../redux/docCategoryStore';
//components
import DocPostsComponent from '../../../components/dashboard/documents/posts.component';
import {
  DateRangePickerProps,
  useDateRangePicker
} from '../../../components/date-range-picker';
import { TableProps, useTable } from '../../../components/table';

//-------------------------------------------------------
export type IDocPostsAttribute = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  documents: IBimDocument[];
  loading: boolean;
  selectedDocument: IBimDocument | null;
  setDocuments: (bimDocuments: IBimDocument[]) => void;
  countDocuments: () => void;
  setSelectedDocument: (bimDocument: IBimDocument | null) => void;
  setLoading: (value: boolean) => void;
  docCategories: IDocCategory[];
  setDocCategories: (docCategories: IDocCategory[]) => void;
  table: TableProps;
  router: NextRouter;
  user: AuthUserType;

  dataInPage: any;
  isNotFound: boolean;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  datePicker: DateRangePickerProps;
  isFiltered: boolean;
  SORT_OPTIONS: any[];
  CATEGORIES_OPTIONS: any[];
};
export type IDocPostsFunction = {
  getAllDocuments: () => Promise<void>;
  handleCategoriesDialog: (value: boolean) => void;
  openEditProjectDialog: (
    data: IBimDocument | null,
    flagOpenDialog: boolean,
    isEditFlag: boolean
  ) => void;
  handleNewDocument: (docId: string | null) => void;
  getDocsSearch: () => Promise<void>;
  handleResetFilter: () => Promise<void>;
  handleChangeSortBy: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterCategory: (event: SelectChangeEvent<string>) => void;
  handleSearchKeyName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void;
  handleClosePopover: () => void;
};
type ILocalState = {
  documents: IBimDocument[];
  openCategoriesDialog: boolean;
  openNewDocumentDialog: boolean;

  openDelete: boolean;
  dataDialog: ConfirmDialogProps;
  sortBy: string;
  sortType: string;
  filterCategory: string;
  keySearch: string;
  loading: boolean;
  openPopover: HTMLElement | null;
};
//----------------------------------------------------
const docPostsAttribute = (): IDocPostsAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    documents: [],
    openCategoriesDialog: false,
    openNewDocumentDialog: false,
    openDelete: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    sortBy: 'createdAt',
    sortType: 'asc',
    filterCategory: '',
    keySearch: '',
    loading: false,
    openPopover: null
  });
  const {
    documents,
    loading,
    selectedDocument,
    setDocuments,
    countDocuments,
    setSelectedDocument,
    setLoading
  } = useBimDocument(
    (state) => ({
      documents: state.datas,
      loading: state.loading,
      selectedDocument: state.selectedData,
      setDocuments: state.setDatas,
      countDocuments: state.countDatas,
      setSelectedDocument: state.setSelectedData,
      setLoading: state.setLoading
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
  const table = useTable({ defaultRowsPerPage: 9 });
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const datePicker = useDateRangePicker(null, null);
  const router = useRouter();
  const { user } = useAuthContext();
  const isFiltered =
    localState.keySearch !== '' ||
    !!localState.filterCategory.length ||
    (!!datePicker.startDate && !!datePicker.endDate) ||
    localState.sortBy !== 'createdAt';

  const dataInPage = localState.documents.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
  const isNotFound = !documents.length;
  const SORT_OPTIONS = [
    { value: 'createdAt', label: `${translate('common.latest')}` },
    { value: 'views', label: `${translate('common.most_viewed')}` },
    { value: 'title', label: `${translate('common.sort_title')}` }
  ];
  const CATEGORIES_OPTIONS = docCategories.map((status, index) => {
    return { value: `${status._id}`, label: `${status.name}` };
  });
  return {
    localState,
    setLocalState,
    documents,
    loading,
    selectedDocument,
    setDocuments,
    countDocuments,
    setSelectedDocument,
    setLoading,
    docCategories,
    setDocCategories,
    table,
    router,
    user,
    dataInPage,
    isNotFound,
    translate,
    enqueueSnackbar,
    isFiltered,
    datePicker,
    SORT_OPTIONS,
    CATEGORIES_OPTIONS
  };
};
const docPostsFunction = ({
  props,
  state,
  setState
}: {
  props: IDocPostsAttribute;
  state: ILocalState;
  setState: Function;
}): IDocPostsFunction => {
  /*-------------------HANDLE API ----------------- */
  // get all document
  const getAllDocuments = useCallback(async () => {
    props.setLoading(true);
    const apiRes: IBimDocumentResGetAll = await bimDocumentsApi.getAllDocuments(
      null
    );
    const postsPulich = apiRes.data.filter((post) => post.isPublish !== null);
    props.setDocuments(postsPulich);

    props.setLoading(false);
  }, []);
  // get document search
  const getDocsSearch = async () => {
    const params = {
      sortBy: props.localState.sortBy,
      sortType: props.localState.sortType,
      title: props.localState.keySearch,
      category: props.localState.filterCategory,
      fromDate: props.datePicker.startDate,
      toDate: props.datePicker.endDate
    };
    const res = await bimDocumentsApi.getAllDocuments(params);
    const postsPulich = res.data.filter((post) => post.isPublish !== null);
    props.setDocuments(postsPulich);
    props.table.setPage(0);
  };
  //handle reset search
  const handleResetFilter = async () => {
    const res = await bimDocumentsApi.getAllDocuments(null);
    const postsPulich = res.data.filter((post) => post.isPublish !== null);
    props.setDocuments(postsPulich);
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
  /* --------------HANDLE LOCAL ---------------- */

  // handle set category dialog
  const handleCategoriesDialog = (value: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openCategoriesDialog: value
    }));
  };
  //handle open edit project dialog
  const openEditProjectDialog = (
    data: IBimDocument | null,
    flagOpenDialog: boolean,
    isEditFlag: boolean
  ) => {
    props.setSelectedDocument(data);

    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewDocumentDialog: flagOpenDialog,
      isEdit: isEditFlag
    }));
  };

  //handle new document
  const handleNewDocument = (docId: string | null) => {
    if (docId == null) {
      return openEditProjectDialog(null, false, false);
    }
    const filterProjects = props.documents.filter(
      (project: any) => project._id === docId
    );
    if (filterProjects.length > 0) {
      openEditProjectDialog(filterProjects[0], true, true);
    }
  };

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
  //handle open/close popover
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: event.currentTarget
    }));
  };
  const handleClosePopover = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: null
    }));
  };
  return {
    getAllDocuments,
    handleCategoriesDialog,
    openEditProjectDialog,
    handleNewDocument,
    getDocsSearch,
    handleResetFilter,
    handleChangeSortBy,
    handleFilterCategory,
    handleSearchKeyName,
    handleOpenPopover,
    handleClosePopover
  };
};
const DocPostsContainer = () => {
  let props = docPostsAttribute();
  const { localState, setLocalState } = props;
  let func = docPostsFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  useEffect(() => {
    func.getAllDocuments();
  }, []);
  return <DocPostsComponent props={props} func={func} />;
};
export default DocPostsContainer;
