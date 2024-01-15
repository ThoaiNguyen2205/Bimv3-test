import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
//mui
import { Button, SelectChangeEvent } from '@mui/material';
//next
import { NextRouter, useRouter } from 'next/router';
import { TFunctionDetailedResult } from 'i18next';
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar
} from 'notistack';
//locales
import { useLocales } from '../../../locales';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//types
import { AuthUserType } from '../../../auth/types';
import {
  IBimDocument,
  IBimDocumentResGetAll
} from '../../../shared/types/bimDocument';
import { IDocCategory } from '../../../shared/types/docCategory';
import { ITreeItem } from '../../../shared/types/docContent';
//apis
import bimDocumentsApi from '../../../api/bimDocumentsApi';
//stores
import useBimDocument from '../../../redux/bimDocumentStore';
import useDocCategory from '../../../redux/docCategoryStore';
import useDocEditor from '../../../redux/docEditorStore/docEditorStore';
//components
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import DocPersonalComponent from '../../../components/dashboard/documents/personal.component';
import {
  DateRangePickerProps,
  useDateRangePicker
} from '../../../components/date-range-picker';
import { TableProps, useTable } from '../../../components/table';
//sections
import { IDialogCoverProps } from '../../../sections/@dashboard/share/dialog/BoxInfoCover';

//-------------------------------------------------------
export type IProDocumentsAttribute = {
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
  setItemTreeClick: (item: ITreeItem) => void;
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
  isNotFoundShare: boolean;
};
export type IProDocumentsFunction = {
  getAllDocuments: () => Promise<void>;
  getAllDocumentsShare: () => Promise<void>;
  handleDeleteDocument: (docId: string) => Promise<void>;
  handleChangeView: (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null
  ) => void;
  onSearchDocuments: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoriesDialog: (value: boolean) => void;
  openEditProjectDialog: (
    data: IBimDocument | null,
    flagOpenDialog: boolean,
    isEditFlag: boolean
  ) => void;
  handleEditDocument: (docId: string) => void;
  handleNewDocument: (docId: string | null) => void;
  // handleOpenDelete: (docId: string) => Promise<void>;
  // handleCloseDelete: () => void;
  handleOpenShareForm: (docId: string) => Promise<void>;
  handleCloseShareForm: () => void;
  handleOpenPermitForm: (docId: string) => Promise<void>;
  handleClosePermitForm: () => void;
  handleDeleteConfirm: (docId: string | null) => void;
  getDocsSearchByUser: () => Promise<void>;
  handleResetFilter: () => Promise<void>;
  handleChangeSortBy: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterCategory: (event: SelectChangeEvent<string>) => void;
  handleSearchKeyName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenViewCover: (coverString: string | null) => void;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void;
  handleClosePopover: () => void;
  resetFormEditor: () => void;
};
type ILocalState = {
  documents: IBimDocument[];
  documentsShare: IBimDocument[];

  openCategoriesDialog: boolean;
  openNewDocumentDialog: boolean;
  isEdit: boolean;
  //
  openDelete: boolean;
  openShare: boolean;
  openPermission: boolean;
  dataDialog: ConfirmDialogProps;
  dataDialogView: IDialogCoverProps;
  sortBy: string;
  sortType: string;
  filterCategory: string;
  keySearch: string;
  openPopover: HTMLElement | null;
  valueReset: ITreeItem;
};
//----------------------------------------------------
const docPersonalAttribute = (): IProDocumentsAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    documents: [],
    documentsShare: [],
    openCategoriesDialog: false,
    openNewDocumentDialog: false,
    isEdit: false,
    //
    openDelete: false,
    openShare: false,
    openPermission: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    dataDialogView: {
      open: false,
      onClose: () => {},
      cover: ''
    },
    sortBy: 'createdAt',
    sortType: 'asc',
    filterCategory: '',
    keySearch: '',
    openPopover: null,
    valueReset: {
      index: '',
      order: '',
      content: '',
      versionNotes: ''
    }
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
  const { setItemTreeClick } = useDocEditor(
    (state) => ({
      setItemTreeClick: state.setItemTreeClick
    }),
    shallow
  );
  const table = useTable({ defaultRowsPerPage: 10 });
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

  const dataInPage = documents.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
  const isNotFound = !documents.length;
  const isNotFoundShare = !localState.documentsShare.length;
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
    setItemTreeClick,
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
    CATEGORIES_OPTIONS,
    isNotFoundShare
  };
};
const docPersonalFunction = ({
  props,
  state,
  setState
}: {
  props: IProDocumentsAttribute;
  state: ILocalState;
  setState: Function;
}): IProDocumentsFunction => {
  /*-------------------HANDLE API ----------------- */
  // get all document
  const getAllDocuments = useCallback(async () => {
    const params = {
      createdBy: props.user?.id
    };
    props.setLoading(true);
    const apiRes: IBimDocumentResGetAll = await bimDocumentsApi.getAllDocuments(
      params
    );
    props.setDocuments(apiRes.data);
    props.setLoading(false);
  }, []);
  //get all document share
  const getAllDocumentsShare = useCallback(async () => {
    props.setLoading(true);
    const apiRes: IBimDocument[] = await bimDocumentsApi.getForUser(
      props.user?.id
    );
    // const result = apiRes.filter((item) => {
    //   return !props.documents.includes(item);
    // });
    setState((prevState: ILocalState) => ({
      ...prevState,
      documentsShare: apiRes
    }));

    props.setLoading(false);
  }, []);
  //handle delete document
  const handleDeleteDocument = async (docId: string) => {
    const deleteDocument: IBimDocument = await bimDocumentsApi.deleteById(
      docId
    );
    if (deleteDocument) {
      getAllDocuments();
      const { page, setPage } = props.table;
      if (page > 0) {
        if (props.dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    }
    handleDeleteConfirm(null);
  };
  // get document search
  const getDocsSearchByUser = async () => {
    const params = {
      sortBy: props.localState.sortBy,
      sortType: props.localState.sortType,
      title: props.localState.keySearch,
      category: props.localState.filterCategory,
      createdBy: props.user?.id,
      fromDate: props.datePicker.startDate,
      toDate: props.datePicker.endDate
    };
    const res = await bimDocumentsApi.getAllDocuments(params);
    props.setDocuments(res.data);
    props.table.setPage(0);
  };
  //handle reset search
  const handleResetFilter = async () => {
    const params = {
      createdBy: props.user?.id
    };
    const res = await bimDocumentsApi.getAllDocuments(params);
    props.setDocuments(res.data);
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
  //handle chang view
  const handleChangeView = (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null
  ) => {
    if (newView !== null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        view: newView
      }));
    }
  };
  // handle search documnet
  const onSearchDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.table.setPage(0);
    setState((prevState: ILocalState) => ({
      ...prevState,
      searchDocuments: event.target.value
    }));
  };
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
  //handle edit document
  const handleEditDocument = (docId: string) => {
    const filterDocuments = props.documents.filter(
      (project: any) => project._id === docId
    );
    const selDoc = filterDocuments[0];
    props.setSelectedDocument(selDoc);

    props.router.push(PATH_DASHBOARD.document.edit(selDoc._id));
  };

  //handle new document
  const handleNewDocument = (docId: string | null) => {
    if (docId === null) {
      return openEditProjectDialog(null, false, false);
    }
    const filterProjects = props.documents.filter(
      (project: any) => project._id === docId
    );
    if (filterProjects.length > 0) {
      openEditProjectDialog(filterProjects[0], true, true);
    }
  };

  const handleDeleteConfirm = (docId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteConfirm(null)
    };
    if (docId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleDeleteConfirm(null),
      title: `${props.translate('documents.document')} ${
        props.selectedDocument?.title
      }`,
      content: `${props.translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDeleteDocument(docId)}>
          {`${props.translate('common.delete')}`}
        </Button>
      )
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };
  // handle share form dialog
  const handleOpenShareForm = async (docId: string) => {
    const filterDocuments = props.documents.filter(
      (project: any) => project._id === docId
    );
    const selDoc = filterDocuments[0];
    props.setSelectedDocument(selDoc);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openShare: true
    }));
  };
  const handleCloseShareForm = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openShare: false
    }));
  };
  //handle permit form
  const handleOpenPermitForm = async (docId: string) => {
    const filterDocuments = props.documents.filter(
      (project: any) => project._id === docId
    );
    const selDoc = filterDocuments[0];
    props.setSelectedDocument(selDoc);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openPermission: true
    }));
  };
  const handleClosePermitForm = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openPermission: false
    }));
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
  const resetFormEditor = () => {
    props.setItemTreeClick(props.localState.valueReset);
  };
  return {
    getAllDocuments,
    handleDeleteDocument,
    handleChangeView,
    onSearchDocuments,
    handleCategoriesDialog,
    openEditProjectDialog,
    handleNewDocument,
    handleEditDocument,
    handleDeleteConfirm,
    handleOpenShareForm,
    handleCloseShareForm,
    handleOpenPermitForm,
    handleClosePermitForm,
    getDocsSearchByUser,
    handleResetFilter,
    handleChangeSortBy,
    handleFilterCategory,
    handleSearchKeyName,
    handleOpenViewCover,
    getAllDocumentsShare,
    handleOpenPopover,
    handleClosePopover,
    resetFormEditor
  };
};
const DocPersonalContainer = () => {
  let props = docPersonalAttribute();
  const { localState, setLocalState, user } = props;
  let func = docPersonalFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  useEffect(() => {
    func.getAllDocuments();
    func.getAllDocumentsShare();
  }, []);

  return <DocPersonalComponent props={props} func={func} />;
};
export default DocPersonalContainer;
