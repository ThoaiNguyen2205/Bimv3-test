import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
// components
import {
  useTable,
  getComparator,
  TableProps,
} from '../../../components/table';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import DateRangePicker, { useDateRangePicker } from '../../../components/date-range-picker';
import { fileFormat } from '../../../components/file-thumbnail';
// locales
import { useLocales } from 'src/locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
// @mui
import {
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// zustand
import useUclass from 'src/redux/uclassStore';
import useGroup from 'src/redux/groupStore';
import useProjectCategory from 'src/redux/projectCategoryStore';
import useFolder from 'src/redux/foldersStore';
import useFile from 'src/redux/filesStore';
import { shallow } from 'zustand/shallow';

import _ from 'lodash';
import groupsApi from 'src/api/groupsApi';
import projectsApi from 'src/api/projectsApi';
import projectCategoriesApi from 'src/api/projectCategoriesApi';
import userclassesApi from 'src/api/userclassesApi';
import { IGroup, IGroupResGetAll } from 'src/shared/types/group';
import { IProjectCategoryResGetAll, IProjectCategory } from 'src/shared/types/projectCategory';
import { IProject, IProjectResGetAll } from 'src/shared/types/project';
import { IFolder, IFolderNodeData, IFolderResGetAll, IFileOrFolder, IFileAndFolder, IFileAndFolderSearching, IFileOrFolderResGetAll } from 'src/shared/types/folder';
import { IFile, IFileResGetAll, IFileZipReq } from 'src/shared/types/file';
import { IUclass, IUclassReqCreate, IUclassResGetAll } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import { AuthUserType } from 'src/auth/types';
import { TFunctionDetailedResult } from 'i18next';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import TrashComponent from 'src/components/dashboard/cloud/trash.component';
// enums
import { DenseEnum, DataTableEnum } from 'src/shared/enums';
import { UserClassEnum } from 'src/shared/enums';
import { DeleteData } from 'src/shared/types/deleteData';
// type
// sections
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
// apis
import foldersApi from 'src/api/foldersApi';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// utils
import { fTimestamp } from '../../../utils/formatTime';
import filesApi from 'src/api/filesApi';
import { ISearchBy } from 'src/shared/types/searchBy';
import { formatISO, parse } from 'date-fns';
// --------------------------------------------------------------------------

export type ILocalState = {
  isLoading: boolean;
  filterName: string;
  userRole: UserClassEnum;
  //
  view: string;
  tableData: IFileOrFolder[],
  pageCount: number;
  //
  dataDialog: ConfirmDialogProps;
  openDeleteTrashesDialog: boolean;
  openRestoreTrashesDialog: boolean;
  openEmptyTrashDialog: boolean;
  //
  openDetails: boolean;
  detailType: string;
  detailItem: IFolder | IFile | null;
};

export type ITrashAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  // selected: string[],
  // setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  //
  isSelectedValuePicker: boolean | undefined,
  handleFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void,
  startDate: Date | null,
  endDate: Date | null,
  onOpenPicker: VoidFunction | undefined,
  shortLabel: string | undefined,
  handleChangeStartDate: (newValue: Date | null) => void,
  handleChangeEndDate: (newValue: Date | null) => void,
  setFilterType: (value: string[]) => void,
  openPicker: boolean,
  onClosePicker: VoidFunction,
  isError: boolean | undefined,
  handleClearAll: () => void,
  table: TableProps,
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  rowsPerPage: number,
  // //
  // folders: IFolder[],
  // folderLoading: boolean,
  // selectedFolder: IFolder | null,
  // setFolders: (folders: IFolder[]) => void,
  // countFolders: () => void,
  // setSelectedFolder: (folder: IFolder | null) => void,
  // setFolderLoading: (value: boolean) => void,
  // selectedFather: IFolder | null;
  // setSelectedFather: (value: IFolder | null) => void;
  // foldersTree: IFolderNodeData[],
  // setFoldersTree: (folderNodes: IFolderNodeData[]) => void,
  //
  user: AuthUserType,
  // //
  // files: IFile[],
  // fileLoading: boolean,
  // selectedFile: IFile | null,
  // setFiles: (files: IFile[]) => void,
  // countFiles: () => void,
  // setSelectedFile: (file: IFile | null) => void,
  // setFileLoading: (value: boolean) => void,
  //
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type ITrashFunction = {
  loadTrashData: (page: number, rowPerPage: number, start: Date | null, end: Date | null) => Promise<void>,
  handleDetailsDialog: (itemId: string, type: string) => void,
  handleCloseDetailsDialog: VoidFunction,
  handleDeleteTrash: (id: string, type: string) => Promise<void>,
  handleDeleteTrashesDialog: (openDeleteTrashesDialog: boolean) => void,
  handleRestoreTrash: (id: string, type: string) => Promise<void>,
  handleRestoreTrashesDialog: (openRestoreTrashesDialog: boolean) => void,
  handleEmptyTrashDialog: (openEmptyTrashDialog: boolean) => void,
};

const trashAttribute = (): ITrashAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    isLoading: false,
    filterName: '',
    //
    userRole: UserClassEnum.User,
    //
    view: 'list',
    tableData: [],
    pageCount: 0,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    openDeleteTrashesDialog: false,
    openRestoreTrashesDialog: false,
    openEmptyTrashDialog: false,
    //
    openDetails: false,
    detailType: 'folder',
    detailItem: null,
  });

  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    onReset: onResetPicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);
  
  const {
    page,
    setPage,
    rowsPerPage,
    // selected,
    // setSelected,
  } = useTable();

  const table = useTable({ defaultRowsPerPage: 50 });

  const {
    folders,
    folderLoading,
    selectedFolder,
    setFolders,
    countFolders,
    setSelectedFolder,
    setFolderLoading,
    selectedFather,
    setSelectedFather,
    foldersTree,
    setFoldersTree,
  } = useFolder(
    (state) => ({ 
      folders: state.datas,
      folderLoading: state.loading,
      selectedFolder: state.selectedData,
      setFolders: state.setDatas,
      countFolders: state.countDatas,
      setSelectedFolder: state.setSelectedData,
      setFolderLoading: state.setLoading,
      selectedFather: state.selectedFather,
      setSelectedFather: state.setSelectedFather,
      foldersTree: state.dataTree,
      setFoldersTree: state.setDataTree,
    }),
    shallow
  );

  const {
    files,
    fileLoading,
    selectedFile,
    setFiles,
    countFiles,
    setSelectedFile,
    setFileLoading,
  } = useFile(
    (state) => ({ 
      files: state.datas,
      fileLoading: state.loading,
      selectedFile: state.selectedData,
      setFiles: state.setDatas,
      countFiles: state.countDatas,
      setSelectedFile: state.setSelectedData,
      setFileLoading: state.setLoading,
    }),
    shallow
  );

  const handleChangeView = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, view: newView }));
    }
  };

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.setPage(0);
    setLocalState((prevState: ILocalState) => ({ ...prevState, filterName: event.target.value }));
  };

  const handleChangeStartDate = (newValue: Date | null) => {
    table.setPage(0);
    onChangeStartDate(newValue);
  };

  const handleChangeEndDate = (newValue: Date | null) => {
    table.setPage(0);
    onChangeEndDate(newValue);
  };

  const setFilterType = (value: string[]) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, filterType: value }));
  }

  const handleClearAll = () => {
    if (onResetPicker) {
      onResetPicker();
    }
    setLocalState((prevState: ILocalState) => ({ ...prevState, filterName: '', filterType: [] }));
  };

  // function applyFilter({
  //   inputData,
  //   comparator,
  //   filterName,
  //   filterStartDate,
  //   filterEndDate,
  //   isError,
  // }: {
  //   inputData: IFileOrFolder[];
  //   comparator: (a: any, b: any) => number;
  //   filterName: string;
  //   filterStartDate: Date | null;
  //   filterEndDate: Date | null;
  //   isError: boolean;
  // }) {
  //   const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  
  //   stabilizedThis.sort((a, b) => {
  //     const order = comparator(a[0], b[0]);
  //     if (order !== 0) return order;
  //     return a[1] - b[1];
  //   });
  
  //   inputData = stabilizedThis.map((el) => el[0]);
  
  //   if (filterName) {
  //     const filterByName: IFileOrFolder[] = [];
  //     for (const item of inputData) {
  //       if (item.data.displayName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1) {
  //         filterByName.push(item);
  //       }
  //     }
  //     inputData = filterByName;

  //   }
  
  //   if (filterStartDate && filterEndDate && !isError) {
  //     inputData = inputData.filter(
  //       (file) =>
  //         fTimestamp(file.data.createdAt) >= fTimestamp(filterStartDate) &&
  //         fTimestamp(file.data.createdAt) <= fTimestamp(filterEndDate)
  //     );
  //   }
  
  //   return inputData;
  // }

  // const dataFiltered = applyFilter({
  //   inputData: localState.tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filterName: localState.filterName,
  //   filterStartDate: startDate,
  //   filterEndDate: endDate,
  //   isError: !!isError,
  // });

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  // const isNotFound =
  //   (!dataFiltered.length && !!localState.filterName) ||
  //   (!dataFiltered.length && !!endDate && !!startDate);

  // const isFiltered = !!localState.filterName || (!!startDate && !!endDate);

  return {
    localState, 
    setLocalState,
    // selected,
    // setSelected,
    //
    isSelectedValuePicker,
    handleFilterName,
    startDate,
    endDate,
    onOpenPicker,
    shortLabel,
    handleChangeStartDate,
    handleChangeEndDate,
    setFilterType,
    openPicker,
    onClosePicker,
    isError,
    handleClearAll,
    // handleChangeView,
    table,
    // dataFiltered,
    // applyFilter,
    // dataInPage,
    // isNotFound,
    // isFiltered,
    page,
    setPage,
    rowsPerPage,
    //
    // folders,
    // folderLoading,
    // selectedFolder,
    // setFolders,
    // countFolders,
    // setSelectedFolder,
    // setFolderLoading,
    // selectedFather,
    // setSelectedFather,
    // foldersTree,
    // setFoldersTree,
    //
    user,
    // files,
    // fileLoading,
    // selectedFile,
    // setFiles,
    // countFiles,
    // setSelectedFile,
    // setFileLoading,
    //
    translate,
  }
};

const trashFunction = ({
  props, 
  state, 
  setState
}: {props: ITrashAttribute, state: ILocalState, setState: Function}): ITrashFunction => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Load trash data
  const loadTrashData = useCallback(async (page: number, rowParPage: number, start: Date | null, end: Date | null) => { 
    if (props.user === null) return;
    
    if (props.user.project === null) {
      enqueueSnackbar(`${props.translate('cloud.select_project_require')}`, {variant: "info"});
      router.push(PATH_DASHBOARD.projects.list);
      return;
    }

    let userRole = UserClassEnum.User;
    if (props.user.class.uclass === UserClassEnum.Admin || props.user.projectrole === UserClassEnum.Admin) {
      userRole = UserClassEnum.Admin;
    }
    setState((prevState: ILocalState) => ({ ...prevState, userRole: userRole }));

    const param: ISearchBy = {
      project: props.user?.project._id,
      pageNumber: page,
      itemPerPage: rowParPage,
      fromDate: null,
      toDate: null,
    }
    if (start !== null && start !== undefined) {
      param.fromDate = start;
    }
    if (end !== null && end !== undefined) {
      param.toDate = end;
    }
    
    const trashRes: IFileOrFolderResGetAll = await filesApi.getAllTrashFilesAndFolders(param);
     
    setState((prevState: ILocalState) => ({  
      ...prevState,
      tableData: trashRes.data,
      pageCount: trashRes.total.count,
    }));
  }, [
    props.user
  ]);

  // Details Dialog
  const handleDetailsDialog = async (itemId: string, type: string) => {
    if (type === 'folder') {
      const renameFolder = await foldersApi.getReadById(itemId);
      
      setState((prevState: ILocalState) => ({
        ...prevState,
        openDetails: true,
        detailType: type,
        detailItem: renameFolder,
      }));
    } else {
      const renameFile = await filesApi.getReadById(itemId);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openDetails: true,
        detailType: type,
        detailItem: renameFile,
      }));
    }
  }

  const handleCloseDetailsDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: false,
      detailItem: null,
    }));
  }

  // Delete trash
  const handleDeleteTrash = async (id: string, type: string) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteTrash('', ''),
    }

    if (id === '') {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    let displayName = '';
    if (type === 'folder') {
      const folderRes = await foldersApi.getReadById(id);
      displayName = folderRes.displayName; 
    }
    if (type === 'file') {
      const fileRes = await filesApi.getReadById(id);
      displayName = fileRes.displayName;
    }
    
    if (displayName !== '') {
      dataDialog = {
        open: true,
        onClose: () => handleDeleteTrash('', ''),
        title: (type === 'folder') ? `${props.translate('cloud.delete_trash')} ${displayName}` : `${props.translate('cloud.delete_trash')}`,
        content: (type === 'folder') ? `${props.translate('cloud.delete_trash_folder_not')}` : displayName,
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteTrash(id, type)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  }

  const onDeleteTrash = async (id: string, type: string) => {
    const deleteData: DeleteData = {
      deletedByName: props.user?.username,
      deletedById: props.user?.id,
    }
    if (type === 'folder') {
      await filesApi.deleteTrashFolderById(id, deleteData);
    }
    if (type === 'file') {
      await filesApi.deleteTrashById(id, deleteData);
    }
    loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);
    handleDeleteTrash('', '');
  };

  const handleDeleteTrashesDialog = (openDeleteTrashesDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openDeleteTrashesDialog }));
    if (!openDeleteTrashesDialog) {
      loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);  
      props.table.setSelected([]);
    }
  }

  // Restore
  const handleRestoreTrash = async (id: string, type: string) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleRestoreTrash('', ''),
    }

    if (id === '') {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    let displayName = '';
    if (type === 'folder') {
      const folderRes = await foldersApi.getReadById(id);
      displayName = folderRes.displayName; 
    }
    if (type === 'file') {
      const fileRes = await filesApi.getReadById(id);
      displayName = fileRes.displayName;
    }
    
    if (displayName !== '') {
      dataDialog = {
        open: true,
        onClose: () => handleRestoreTrash('', ''),
        title: `${props.translate('cloud.restore')}`,
        content: displayName,
        action: (
          <Button variant="contained" color="error" onClick={() => onRestoreTrash(id, type)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  }

  const onRestoreTrash = async (id: string, type: string) => {
    const deleteData: DeleteData = {
      deletedByName: props.user?.username,
      deletedById: props.user?.id,
    }
    if (type === 'folder') {
      await foldersApi.restoreById(id, deleteData);
    }
    if (type === 'file') {
      await filesApi.restoreById(id, deleteData);
    }
    loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);
    handleRestoreTrash('', '');
  };

  const handleRestoreTrashesDialog = (openRestoreTrashesDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openRestoreTrashesDialog }));
    if (!openRestoreTrashesDialog) {
      loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);  
      props.table.setSelected([]);
    }
  }

  const handleEmptyTrashDialog = (openEmptyTrashDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openEmptyTrashDialog }));
    if (!openEmptyTrashDialog) {
      loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);  
      props.table.setSelected([]);
    }
  }

  return {
    loadTrashData,
    handleDetailsDialog,
    handleCloseDetailsDialog,
    handleDeleteTrash,
    handleDeleteTrashesDialog,
    handleRestoreTrash,
    handleRestoreTrashesDialog,
    handleEmptyTrashDialog,
  }
};

const TrashContainer = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  let props = trashAttribute();
  const { localState, setLocalState, user } = props;

  let func = trashFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    let qlda = UserClassEnum.User;
    if (user?.class.uclass === UserClassEnum.Admin) {
      qlda = UserClassEnum.Admin;
    }
    if (user?.projectrole === UserClassEnum.Admin) {
      qlda = UserClassEnum.Admin;
    }
    
    if (qlda === UserClassEnum.User) {
      enqueueSnackbar(`${props.translate('common.deny_link')}`, {variant: "warning"});
      router.push(PATH_DASHBOARD.cloud.filesManager);
      return;
    }
  }, [user]);

  useEffect(() => {
    func.loadTrashData(props.table.page, props.table.rowsPerPage, props.startDate, props.endDate);
  }, [user, props.table.page, props.table.rowsPerPage, props.startDate, props.endDate]);

  useEffect(() => {
    if (user !== null) {
      if (user.dataMode === DataTableEnum.Table) {
        setLocalState((prevState: ILocalState) => ({ ...prevState, view: 'list' }));
      } else {
        setLocalState((prevState: ILocalState) => ({ ...prevState, view: 'grid' }));
      }
    }
  }, [user]);

  return (
    <>
      <TrashComponent props={props} func={func}/>
    </>
  )
}

export default TrashContainer;