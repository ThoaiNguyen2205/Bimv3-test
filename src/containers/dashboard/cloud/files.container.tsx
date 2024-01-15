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
import { IFolder, IFolderNodeData, IFolderResGetAll, IFileOrFolder, IFileAndFolder, IFileAndFolderSearching, IFolderFullData } from 'src/shared/types/folder';
import { IFile, IFileZipReq } from 'src/shared/types/file';
import { IUclass, IUclassReqCreate, IUclassResGetAll } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import { AuthUserType } from 'src/auth/types';
import { TFunctionDetailedResult } from 'i18next';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import FilesComponent from 'src/components/dashboard/cloud/files.component';
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
// --------------------------------------------------------------------------

export type ILocalState = {
  moveMode: string;
  moveFile: IFile | null;
  renameFolder: IFolder | null;
  moveItems: {id: string, type: string}[];
  filterName: string;
  filterType: string[];
  searchMode: boolean;
  //
  fLinks: IFolder[];
  view: string;
  tableData: IFileOrFolder[];
  isLoading: boolean;
  //
  openNewFolderDialog: boolean;
  isEdit: boolean;
  openFolderPermissionDialog: boolean;
  openFolderVersionDialog: boolean;
  openMoveFolderDialog: boolean;
  openUploadFolderDialog: boolean;
  // files
  openUploadFilesDialog: boolean;
  openPreviewFileDialog: boolean;
  previewFileId: string;
  dataDialog: ConfirmDialogProps;
  //
  openSearchAllDialog: boolean;
  searchRes: IFileAndFolderSearching | null;
  //
  openDetails: boolean;
  detailType: string;
  detailItem: IFolder | IFile | null;
  //
  openDeleteItemsDialog: boolean;
  openImportFolderTemplateDialog: boolean;
  openDownloadSelected: boolean;
};

export type IFilesAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  isSelectedValuePicker: boolean | undefined,
  handleFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void,
  startDate: Date | null,
  endDate: Date | null,
  onOpenPicker: VoidFunction | undefined,
  shortLabel: string | undefined,
  handleChangeStartDate: (newValue: Date | null) => void,
  handleChangeEndDate: (newValue: Date | null) => void,
  handleFilterType: (type: string) => void,
  setFilterType: (value: string[]) => void,
  openPicker: boolean,
  onClosePicker: VoidFunction,
  isError: boolean | undefined,
  handleClearAll: () => void,
  handleChangeView: (event: React.MouseEvent<HTMLElement>, newView: string | null) => void,
  table: TableProps,
  dataFiltered: IFileOrFolder[],
  applyFilter: Function,
  dataInPage: IFileOrFolder[],
  isNotFound: boolean,
  isFiltered: boolean,
  // dense: boolean,
  // setDense: (value: boolean) => void,
  page: number,
  // order: 'asc' | 'desc',
  // orderBy: string,
  // rowsPerPage: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  //
  // selected: string[],
  // setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  // onSelectRow: (id: string) => void,
  // onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void,
  //
  // onSort: (id: string) => void,
  // onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void,
  // onChangePage: (event: unknown, newPage: number) => void,
  // onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void,
  //
  folders: IFolder[],
  folderLoading: boolean,
  selectedFolder: IFolder | null,
  setFolders: (folders: IFolder[]) => void,
  countFolders: () => void,
  setSelectedFolder: (folder: IFolder | null) => void,
  setFolderLoading: (value: boolean) => void,
  selectedFather: IFolder | null;
  setSelectedFather: (value: IFolder | null) => void;
  foldersTree: IFolderNodeData[],
  setFoldersTree: (folderNodes: IFolderNodeData[]) => void,
  //
  user: AuthUserType,
  //
  files: IFile[],
  fileLoading: boolean,
  selectedFile: IFile | null,
  setFiles: (files: IFile[]) => void,
  countFiles: () => void,
  setSelectedFile: (file: IFile | null) => void,
  setFileLoading: (value: boolean) => void,
  //
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IFilesFunction = {
  renderFoldersTree: (treeData: IFolderNodeData[]) => ReactNode[],
  getFolderTree: () => Promise<void>,
  treeItemOnClick: (nodeId: string) => void,
  onLinkClick: (event: React.MouseEvent<HTMLElement>) => void,
  handleNewFolderDialog: () => void,
  closeNewFolderDialog: () => void,
  handleEditFolder: (folderId: string) => void,
  handleOpenFolder: (itemId: string, type: string) => void,
  handleSetPermission: (folderId: string | null) => void,
  handleDeleteFolder: (folderId: string | null) => void,
  handleFolderVersion: (folderId: string | null) => void,
  handleMoveFolder: (folderId: string | null) => void,
  handleUploadFolder: (open: boolean) => void,
  //
  handleUploadFiles: (open: boolean) => void,
  handlePreviewFile: (fileId: string | null) => void,
  handleMoveFile: (fileId: string | null) => void,
  handleDeleteFile: (fileId: string | null) => void,
  //
  handleSearchAll: (open: boolean) => void,
  //
  setSearchAllData: (searchRes: IFileAndFolderSearching) => void,
  // handleFilter: (filterGroup: string, event: React.ChangeEvent<HTMLInputElement> | null) => void,
  handleDetailsDialog: (itemId: string, type: string) => void,
  handleCloseDetailsDialog: VoidFunction,
  //
  onDownloadSelected: (selected: string[]) => void,
  handleMoveItems: (selected: string[]) => void,
  handleDeleteItemsDialog: (openDeleteItemsDialog: boolean) => void,
  //
  handleExportFolderTemplate: () => void,
  handleImportFoldetTemplateDialog: (open: boolean) => void,
};

const filesAttribute = (): IFilesAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    moveMode: '',
    moveFile: null,
    renameFolder: null, // Dùng chung cho rename - folder version - move folder
    moveItems: [],
    filterName: '',
    filterType: [],
    searchMode: false,

    fLinks: [],
    view: 'list',
    tableData: [],
    isLoading: true,
    openNewFolderDialog: false,
    isEdit: false,
    openFolderPermissionDialog: false,
    openFolderVersionDialog: false,
    openMoveFolderDialog: false,
    openUploadFolderDialog: false,
    // files
    openUploadFilesDialog: false,
    openPreviewFileDialog: false,
    previewFileId: '',
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    openSearchAllDialog: false,
    searchRes: null,
    //
    openDetails: false,
    detailType: 'folder',
    detailItem: null,
    //
    openDeleteItemsDialog: false,
    openImportFolderTemplateDialog: false,
    openDownloadSelected: false,
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
    // dense,
    // setDense,
    page,
    // order,
    // orderBy,
    // rowsPerPage,
    setPage,
    //
    // selected,
    // setSelected,
    // onSelectRow,
    // onSelectAllRows,
    //
    // onSort,
    // onChangeDense,
    // onChangePage,
    // onChangeRowsPerPage,
  } = useTable();

  const table = useTable({ defaultRowsPerPage: 10 });

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

  const handleFilterType = (type: string) => {
    const checked = localState.filterType.includes(type)
      ? localState.filterType.filter((value) => value !== type)
      : [...localState.filterType, type];

    table.setPage(0);
    setLocalState((prevState: ILocalState) => ({ ...prevState, filterType: checked }));
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

  function applyFilter({
    inputData,
    comparator,
    filterName,
    filterType,
    filterStartDate,
    filterEndDate,
    isError,
  }: {
    inputData: IFileOrFolder[];
    comparator: (a: any, b: any) => number;
    filterName: string;
    filterType: string[];
    filterStartDate: Date | null;
    filterEndDate: Date | null;
    isError: boolean;
  }) {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
  
    inputData = stabilizedThis.map((el) => el[0]);
  
    if (filterName) {
      const filterByName: IFileOrFolder[] = [];
      for (const item of inputData) {
        if (item.data.displayName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1) {
          filterByName.push(item);
        }
      }
      inputData = filterByName;

    }
  
    if (filterType.length) {
      const filterByType: IFileOrFolder[] = [];
      for (const item of inputData) {
        let dataType = 'folder';
        if (item.type === 'file') {
          const fi = item.data as IFile;
          const storeFile = fi.storeFile;
          const dotIndex = storeFile.lastIndexOf('.');
          dataType = storeFile.substring(dotIndex + 1);
        }
        if (filterType.includes(fileFormat(dataType))) {
          filterByType.push(item);
        }
      }
      inputData = filterByType;
    }
  
    if (filterStartDate && filterEndDate && !isError) {
      inputData = inputData.filter(
        (file) =>
          fTimestamp(file.data.createdAt) >= fTimestamp(filterStartDate) &&
          fTimestamp(file.data.createdAt) <= fTimestamp(filterEndDate)
      );
    }
  
    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: localState.tableData,
    comparator: getComparator(table.order, table.orderBy),
    filterName: localState.filterName,
    filterType: localState.filterType,
    filterStartDate: startDate,
    filterEndDate: endDate,
    isError: !!isError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound =
    (!dataFiltered.length && !!localState.filterName) ||
    (!dataFiltered.length && !!localState.filterType) ||
    (!dataFiltered.length && !!endDate && !!startDate);

  const isFiltered = !!localState.filterName || !!localState.filterType.length || (!!startDate && !!endDate);

  return {
    localState, 
    setLocalState,
    //
    isSelectedValuePicker,
    handleFilterName,
    startDate,
    endDate,
    onOpenPicker,
    shortLabel,
    handleChangeStartDate,
    handleChangeEndDate,
    handleFilterType,
    setFilterType,
    openPicker,
    onClosePicker,
    isError,
    handleClearAll,
    handleChangeView,
    table,
    dataFiltered,
    applyFilter,
    dataInPage,
    isNotFound,
    isFiltered,
    //
    // dense,
    // setDense,
    page,
    // order,
    // orderBy,
    // rowsPerPage,
    setPage,
    //
    // selected,
    // setSelected,
    // onSelectRow,
    // onSelectAllRows,
    //
    // onSort,
    // onChangeDense,
    // onChangePage,
    // onChangeRowsPerPage,
    //
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
    //
    user,
    files,
    fileLoading,
    selectedFile,
    setFiles,
    countFiles,
    setSelectedFile,
    setFileLoading,
    //
    translate,
  }
};

const filesFunction = ({
  props, 
  state, 
  setState
}: {props: IFilesAttribute, state: ILocalState, setState: Function}): IFilesFunction => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const onLinkClick = async (event: React.MouseEvent<HTMLElement>) => {
    // props.table.setPage(0);
    // props.table.setSelected([]);
    const nodeId = (event.target as Element).id;
    treeItemOnClick(nodeId);
  }

  const treeItemOnClick = async (nodeId: string) => {
    setState((prevState: ILocalState) => ({  
      ...prevState,
      isLoading: true,
    }));
    props.table.setPage(0);
    props.table.setSelected([]);
    try 
    {
      let uRole = props.user?.class.uclass;
      if (props.user?.projectrole === UserClassEnum.Admin) {
        uRole = props.user?.projectrole;
      }
      const folderFullData: IFolderFullData = await filesApi.getFullFolderData(nodeId, props.user?.id, uRole);

      const selFolderResponse = folderFullData.folder;
      if (!selFolderResponse.isView) {
        enqueueSnackbar(`${props.translate('cloud.no_access_folder')}`, {variant: "error"});
        return;
      }
      
      // Chọn thư mục hiện hành
      props.setSelectedFolder(selFolderResponse);

      const linkList: IFolder[] = folderFullData.linkList;

      const subFolders = folderFullData.subFolders;
      props.setFolders(subFolders);
      
      const files = folderFullData.files;
      props.setFiles(files);

      const joinFolderFiles: IFileOrFolder[] = [];
      for (const folderi of subFolders) {
        joinFolderFiles.push({
          type: 'folder',
          data: folderi,
        })
      }
      for (const fili of files) {
        joinFolderFiles.push({
          type: 'file',
          data: fili,
        })
      }

      setState((prevState: ILocalState) => ({  
        ...prevState,
        fLinks: linkList,
        tableData: joinFolderFiles,
        searchMode: false,
      }));
      
      // 
      let params = new URLSearchParams(window.location.search);
      let selParam = params.get('sel');
      if (!selParam) {
        window.history.replaceState(null, '', `?folder=${nodeId}`);
      } else {
        const renameFolder = subFolders.filter(e => e._id === selParam);
        const renameFile = files.filter(e => e._id === selParam);
        
        if (renameFolder.length > 0) {
          setState((prevState: ILocalState) => ({
            ...prevState,
            openDetails: true,
            detailType: 'folder',
            detailItem: renameFolder[0],
          }));
        }
        if (renameFile.length > 0) {
          setState((prevState: ILocalState) => ({
            ...prevState,
            openDetails: true,
            detailType: 'file',
            detailItem: renameFile[0],
          }));
        }
      }

    } catch {
      enqueueSnackbar(`${props.translate('cloud.no_existing_folder')}`, {variant: "error"});
      return;
    }
    setState((prevState: ILocalState) => ({  
      ...prevState,
      isLoading: false,
    }));
  };

  const setSearchAllData = async (searchRes: IFileAndFolderSearching) => {
    const folders = searchRes.folders.map((e) => e.folder);
    const files = searchRes.files.map((e) => e.file)
    
    props.setFiles(files);
    props.setFolders(folders);
    const allFolderFiles: IFileOrFolder[] = [];
    for (const folderi of folders) {
      allFolderFiles.push({
        type: 'folder',
        data: folderi,
      })
    }
    for (const fili of files) {
      allFolderFiles.push({
        type: 'file',
        data: fili,
      })
    }
    props.setLocalState((prevState: ILocalState) => ({  
      ...prevState,
      tableData: allFolderFiles,
      searchRes: searchRes,
    }));
  }

  // Render folder tree
  const renderFoldersTree = (treeData: IFolderNodeData[]) => (
    treeData.map((folder) => (
      <StyledTreeFolder
        key={folder.nodeId}
        nodeId={folder.nodeId}
        labelText={folder.label}
        color={'#00AB55'}
        bgColor="#3be79036"
        colorForDarkMode={'#00AB55'}
        bgColorForDarkMode="#3be79036"
        onClick={() => (treeItemOnClick(folder.nodeId))}
      >
        {(folder.children.length > 0) ?
          <>
            {renderFoldersTree(folder.children)}
          </>
          : null
        }
      </StyledTreeFolder>
    ))
  );

  // Load folder tree data base on current user and project
  const getFolderTree = useCallback(async () => {
    if (props.user === null) return;
    
    if (props.user.project === null) {
      enqueueSnackbar(`${props.translate('cloud.select_project_require')}`, {variant: "error"});
      router.push(PATH_DASHBOARD.projects.list);
      return;
    }
    let userRole = UserClassEnum.User;
    if (props.user.class.uclass === UserClassEnum.Admin || props.user.projectrole === UserClassEnum.Admin) {
      userRole = UserClassEnum.Admin;
    }
    const projectFolderData: IFolderNodeData[] = await foldersApi.getProjectFolderTree(
      props.user.customer._id,
      props.user.project._id,
      props.user.id,
      userRole
    );
    props.setFoldersTree(projectFolderData);

    let params = new URLSearchParams(window.location.search);
    let searchParam = params.get('search');
    let folderParam = params.get('folder');
    let selParam = params.get('sel');
    
    if (searchParam === null && folderParam === null) {
      if (props.selectedFolder === null) {
        if (projectFolderData[0] !== undefined) {
          const folder = await foldersApi.getReadByIdWithUser(projectFolderData[0].nodeId, props.user?.id);
          treeItemOnClick(folder._id);
        }
      } else {
        treeItemOnClick(props.selectedFolder._id);
      }
    } else if (searchParam) {
      const param = {
        project: props.user?.project._id,
        searchKey: searchParam,
      }
      const searchRes: IFileAndFolderSearching = await filesApi.getSearchAllFolder(props.user?.id, props.user?.class.uclass, param);
      setSearchAllData(searchRes);
      setState((prevState: ILocalState) => ({
        ...prevState,
        searchMode: true,
        isLoading: false,
      }));
    } else if (folderParam) {
      treeItemOnClick(folderParam);
    }

  }, [
    props.user,
    props.selectedFolder,
  ]);

  // Edit folder
  const closeNewFolderDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewFolderDialog: false,
      isEdit: false,
    }));
  }

  const handleEditFolder = (folderId: string) => {
    const renameFolder = props.folders.filter(e => e._id === folderId);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewFolderDialog: true,
      isEdit: true,
      renameFolder: renameFolder[0],
    }));
  }

  // new project
  const handleNewFolderDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewFolderDialog: true,
      isEdit: false,
    }));
  }

  const handleOpenFolder = async (itemId: string, type: string) => {
    if (type === 'folder') {
      // Phải call api để dùng cho cả trường hợp search từ all dữ liệu
      // const selectFolder = props.folders.filter(e => e._id === folderId);
      const selectFolder = await foldersApi.getReadByIdWithUser(itemId, props.user?.id);
      if (selectFolder) {
        treeItemOnClick(selectFolder._id);
      }
    } else {
      handlePreviewFile(itemId);
    }
    props.table.setSelected([]);
  }

  const handleSetPermission = (folderId: string | null) => {
    const openFolderPermissionDialog = (data: IFolder | null, flagOpenDialog: boolean) => {
      props.setSelectedFather(props.selectedFolder);
      props.setSelectedFolder(data);
  
      setState((prevState: ILocalState) => ({
        ...prevState,
        openFolderPermissionDialog: flagOpenDialog,
      }));
    }

    if (folderId === null) {
      return openFolderPermissionDialog(null, false);
    }
    const filterFolders = props.folders.filter((project: any) => project._id === folderId);
    if (filterFolders.length > 0) {
      openFolderPermissionDialog(filterFolders[0], true);
    }
  }

  // Delete folder
  const handleDeleteFolder = (folderId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteFolder(null),
    }

    if (folderId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterFolder = props.folders.filter(ui => ui._id === folderId);
    if (filterFolder.length > 0) {
      const deleteFolder = filterFolder[0]
      dataDialog = {
        open: true,
        onClose: () => handleDeleteFolder(null),
        title: `${props.translate('common.delete')}`,
        content: deleteFolder ? deleteFolder.displayName : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteFolder(deleteFolder)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteFolder = async (deleteFolder: IFolder) => {
    if (deleteFolder !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      // Kiểm tra thư mục có liên kết công viêc?!
      const checkRes = await foldersApi.checkLinkFolderById(deleteFolder?._id, props.user?.id, props.user?.class.uclass);
      
      if (checkRes !== '00000') {
        const tach: string[] = checkRes.split('$');
        for (const stri of tach) {
          if (stri.length > 2) {
            enqueueSnackbar(stri, {
              variant: "error",
              autoHideDuration: 10000,
              anchorOrigin: { vertical: "top", horizontal: "right" }
            });
          }
        }
      } else {
        const deletedFolder = await foldersApi.deleteById(deleteFolder?._id ?? '', deleteData);
        if (deletedFolder) {
          getFolderTree();
          if (props.selectedFolder !== null) treeItemOnClick(props.selectedFolder._id);
          if (props.page > 0) {
            if (props.dataInPage.length < 2) {
              props.setPage(props.page - 1);
            }
          }
        }
      }
    }
    handleDeleteFolder(null);
  };

  const handleFolderVersion = (folderId: string | null) => {
    if (folderId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openFolderVersionDialog: false,
        renameFolder: null,
      }));
    } else {
      const renameFolder = props.folders.filter(e => e._id === folderId);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openFolderVersionDialog: true,
        renameFolder: renameFolder[0],
      }));
    }
  }

  const handleMoveFolder = (folderId: string | null) => {
    if (folderId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: false,
        moveMode: '',
        renameFolder: null,
        moveFile: null,
      }));
    } else {
      const renameFolder = props.folders.filter(e => e._id === folderId);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: true,
        moveMode: 'folder',
        renameFolder: renameFolder[0],
        moveFile: null,
      }));
    }
  }

  const handleMoveFile = (fileId: string | null) => {
    if (fileId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: false,
        moveMode: '',
        renameFolder: null,
        moveFile: null,
      }));
    } else {
      const moveFile = props.files.filter(e => e._id === fileId);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: true,
        moveMode: 'file',
        renameFolder: null,
        moveFile: moveFile[0],
      }));
    }
  }

  const handleMoveItems = (selected: string[]) => {
    if (selected.length === 0) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: false,
        moveMode: '',
        renameFolder: null,
        moveFile: null,
        moveItems: null,
      }));
    } else {
      const dataToMove: {id: string, type: string}[] = [];
      for (const id of selected)
      {
        const filterType = props.dataFiltered.filter((e) => e.data._id === id);
        dataToMove.push({
          id: filterType[0].data._id,
          type: filterType[0].type,
        });
      }

      props.table.setSelected([]);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openMoveFolderDialog: true,
        moveMode: 'items',
        renameFolder: null,
        moveFile: null,
        moveItems: dataToMove,
      }));
    }
  }

  // upload Folder
  const handleUploadFolder = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openUploadFolderDialog: open,
    }));
  }

  // Files
  const handleUploadFiles = (open: boolean) => {
  
    if (props.selectedFolder?.storeName.includes('bn_wip') ||
      props.selectedFolder?.storeName.includes('bn_shared') ||
      props.selectedFolder?.storeName.includes('bn_public') ||
      props.selectedFolder?.storeName.includes('bn_archived')
    ) {
      enqueueSnackbar(`${props.translate('cloud.root_deny_upload')}`, {variant: "error"});
      return;
    }
    
    setState((prevState: ILocalState) => ({
      ...prevState,
      openUploadFilesDialog: open,
    }));
  }

  const handlePreviewFile = (fileId: string | null) => {
    if (fileId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openPreviewFileDialog: false,
      }));
    } else {
      setState((prevState: ILocalState) => ({
        ...prevState,
        previewFileId: fileId,
        openPreviewFileDialog: true,
      }));
    }
  }

  // Search All
  const handleSearchAll = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      searchMode: true,
      openSearchAllDialog: open,
    }));
  }

  // Delete File
  const handleDeleteFile = (fileId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteFile(null),
    }

    if (fileId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    
    const filterFiles = props.files.filter(ui => ui._id === fileId);
    if (filterFiles.length > 0) {
      const deleteFile = filterFiles[0];
      dataDialog = {
        open: true,
        onClose: () => handleDeleteFile(null),
        title: `${props.translate('common.delete')}`,
        content: deleteFile ? deleteFile.displayName : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteFile(deleteFile)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteFile = async (deleteFile: IFile) => {
    if (deleteFile !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateProject = await filesApi.deleteById(deleteFile?._id ?? '', deleteData);
      if (updateProject) {
        getFolderTree();
        if (props.selectedFolder !== null) treeItemOnClick(props.selectedFolder._id);
        if (props.page > 0) {
          if (props.dataInPage.length < 2) {
            props.setPage(props.page - 1);
          }
        }
      }
    }
    handleDeleteFile(null);  
  };

  // Details Dialog
  const handleDetailsDialog = (itemId: string, type: string) => {
    let params = new URLSearchParams(window.location.search);
    let searchParam = params.get('search');
    let folderParam = params.get('folder');
    
    if (searchParam) {
      window.history.pushState({}, ``, `?search=${searchParam}&sel=${itemId}`);
    } 
    if (folderParam) {
      window.history.pushState({}, ``, `?folder=${folderParam}&sel=${itemId}`);
    }
    
    if (type === 'folder') {
      const renameFolder = props.folders.filter(e => e._id === itemId);
      
      setState((prevState: ILocalState) => ({
        ...prevState,
        openDetails: true,
        detailType: type,
        detailItem: renameFolder[0],
      }));
    } else {
      const renameFile = props.files.filter(e => e._id === itemId);
      setState((prevState: ILocalState) => ({
        ...prevState,
        openDetails: true,
        detailType: type,
        detailItem: renameFile[0],
      }));
    }
  }

  const handleCloseDetailsDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: false,
      detailItem: null,
    }));
    let params = new URLSearchParams(window.location.search);
    let searchParam = params.get('search');
    let folderParam = params.get('folder');
    
    if (searchParam) {
      window.history.pushState({}, '', `?search=${searchParam}`);
    } 
    if (folderParam) {
      window.history.pushState({}, '', `?folder=${folderParam}`);
    }
  }

  const onDownloadSelected = async (selected: string[]) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDownloadSelected: true,
    }));
    props.table.setSelected([]);
    const dataToZip: {id: string, type: string}[] = [];
    for (const id of selected)
    {
      const filterType = props.dataFiltered.filter((e) => e.data._id === id);
      dataToZip.push({
        id: filterType[0].data._id,
        type: filterType[0].type,
      });
    }
    const downloadZip: IFileZipReq = {
      files: JSON.stringify(dataToZip),
      userId: props.user?._id,
      role: props.user?.class.uclass,
    }
    const uniqueDate = new Date().toString();    
    await filesApi.zipDownloadFile(uniqueDate, downloadZip);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDownloadSelected: false,
    }));
  }

  const handleDeleteItemsDialog = (openDeleteItemsDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openDeleteItemsDialog }));
    if (!openDeleteItemsDialog) {
      getFolderTree();
      if (props.selectedFolder !== null) treeItemOnClick(props.selectedFolder._id);
      if (props.page > 0) {
        if (props.dataInPage.length < 2) {
          props.setPage(props.page - 1);
        }
      }
      props.table.setSelected([]);
    }
  }

  const handleExportFolderTemplate = async () => {
    const subNodes = await foldersApi.getSubFolderTemplate((props.selectedFolder as IFolder)._id, props.user?.id, props.user?.class.uclass);
    // convert the user object to a JSON string
    const data = JSON.stringify(subNodes);
    // create a blob object from the data
    const blob = new Blob([data], { type: "text/plain" });
    // create a URL for the blob object
    const url = URL.createObjectURL(blob);
    // create a link element
    const link = document.createElement("a");
    // set the href attribute to the URL
    link.href = url;
    // set the download attribute to the file name
    link.download = `${(props.selectedFolder as IFolder).displayName}.json`;
    // append the link to the document body
    document.body.appendChild(link);
    // click the link to download the file
    link.click();
    // remove the link from the document body
    document.body.removeChild(link);
  }

  const handleImportFoldetTemplateDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openImportFolderTemplateDialog: open,
      isEdit: false,
    }));
  }

  return {
    renderFoldersTree,
    getFolderTree,
    treeItemOnClick,
    onLinkClick,
    handleNewFolderDialog,
    closeNewFolderDialog,
    handleEditFolder,
    handleOpenFolder,
    handleSetPermission,
    handleDeleteFolder,
    handleFolderVersion,
    handleMoveFolder,
    handleUploadFolder,
    //
    handleUploadFiles,
    handlePreviewFile,
    handleMoveFile,
    handleDeleteFile,
    handleSearchAll,
    setSearchAllData,
    //
    handleDetailsDialog,
    handleCloseDetailsDialog,
    //
    onDownloadSelected,
    handleMoveItems,
    handleDeleteItemsDialog,
    //
    handleExportFolderTemplate,
    handleImportFoldetTemplateDialog,
  }
};

const FilesContainer = () => {
  
  let props = filesAttribute();
  const { localState, setLocalState, user } = props;

  let func = filesFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    if (user !== null) {
      if (user.dataMode === DataTableEnum.Table) {
        setLocalState((prevState: ILocalState) => ({ ...prevState, view: 'list' }));
      } else {
        setLocalState((prevState: ILocalState) => ({ ...prevState, view: 'grid' }));
      }
    }
    func.getFolderTree();
  }, [user]);

  return (
    <FilesComponent props={props} func={func}/>
  )
}

export default FilesContainer;