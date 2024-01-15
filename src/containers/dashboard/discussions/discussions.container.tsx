import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
// next
import Head from 'next/head';
// components
import {
  useTable,
  getComparator,
  TableProps,
} from '../../../components/table';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
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
import useFolder from 'src/redux/foldersStore';
import useFile from 'src/redux/filesStore';
import useTask from 'src/redux/taskStore';
import { shallow } from 'zustand/shallow';

import _ from 'lodash';

import { AuthUserType } from 'src/auth/types';
import { TFunctionDetailedResult } from 'i18next';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import DiscussionsComponent from 'src/components/dashboard/discussions/discussions.component';
// enums
import { DataTableEnum, TaskCategory } from 'src/shared/enums';
import { UserClassEnum } from 'src/shared/enums';
import { DeleteData } from 'src/shared/types/deleteData';
// apis
import mainTasksApi from 'src/api/mainTasksApi';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// type
import { IDiscussionTask, IMainTask } from 'src/shared/types/mainTask';
import useForgeViewState from 'src/redux/forgeViewStore';
import { IForgeObject, IMarkupSettings } from 'src/shared/types/forgeObject';
import foldersApi from 'src/api/foldersApi';
import { IFolder } from 'src/shared/types/folder';
import discussionsApi from 'src/api/discussionsApi';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
// --------------------------------------------------------------------------

export type ILocalState = {
  isEdit: boolean;
  openNewGeneralDiscussionDialog: boolean;
  //
  filterName: string;
  view: string;
  //
  openTaskPermissionDialog: boolean;
  dataDialog: ConfirmDialogProps;
  openReply: boolean;
  replyItem: IDiscussionTask | null;
  groupsInFolder: IGroupInFolder[];
  openTaskFilesDialog: boolean;
  openTaskInfoDialog: boolean;
};

export type IDiscussionsAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  handleChangeView: (event: React.MouseEvent<HTMLElement>, newView: string | null) => void,
  table: TableProps,
  dataFiltered: IDiscussionTask[],
  applyFilter: Function,
  dataInPage: IDiscussionTask[],
  isNotFound: boolean,
  isFiltered: boolean,
  handleFilter: (filterName: string, event: React.ChangeEvent<HTMLInputElement> | null) => void,
  //
  page: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  //
  user: AuthUserType,
  //
  tasks: IMainTask[],
  taskLoading: boolean,
  selectedTask: IMainTask | null,
  setTasks: (files: IMainTask[]) => void,
  countTasks: () => void,
  setSelectedTask: (file: IMainTask | null) => void,
  setTaskLoading: (value: boolean) => void,
  discussionTask: IDiscussionTask | null;
  setDiscussionTask: (task: IDiscussionTask) => void;
  discussionTasks: IDiscussionTask[],
  setDiscussionTasks: (tasks: IDiscussionTask[]) => void,
  //
  setIsSplit: (value: boolean) => void,
  setFirstObject: (obj: IForgeObject | null) => void,
  setFirstSubObject: (obj: IForgeObject | null) => void,
  setMarkupSettings: (obj: IMarkupSettings | null) => void,
  //
  setSelectedFolder: (file: IFolder | null) => void,
  //
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IDiscussionsFunction = {
  LoadTasks: () => Promise<void>;
  //
  handleNewGeneralDiscussionDialog: () => void;
  closeNewGeneralDiscussionDialog: () => void;
  handleEditGeneralDiscussion: (taskId: string) => void;
  handleSetPermission: (taskId: string | null) => void;
  handleDeleteRow: (taskId: string | null) => void;
  //
  handleReplyDialog: (taskId: string) => void;
  handleCloseReplyDialog: VoidFunction;
  //
  handleOpenInfoDialog: (tid: string, open: boolean) => void,
  handleOpenFilesDialog: (tid: string, open: boolean) => void,
};

const discussionsAttribute = (): IDiscussionsAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    isEdit: false,
    openNewGeneralDiscussionDialog: false,
    //
    filterName: '',
    view: 'list',
    openTaskPermissionDialog: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    //
    openReply: false,
    replyItem: null,
    groupsInFolder: [],
    openTaskFilesDialog: false,
    openTaskInfoDialog: false,
  });

  const { user } = useAuthContext();
  const { translate } = useLocales();
  
  const {
    page,
    setPage,
  } = useTable();

  const table = useTable({ defaultRowsPerPage: 10 });

  const {
    setIsSplit,
    setFirstObject,
    setFirstSubObject,
    setMarkupSettings,
  } = useForgeViewState(
    (state) => ({
      setIsSplit: state.setIsSplit,
      setFirstObject: state.setFirstObject,
      setFirstSubObject: state.setFirstSubObject,
      setMarkupSettings: state.setMarkupSettings,
    }),
    shallow
  );

  const {
    folders,
    folderLoading,
    selectedFolder,
    setFolders,
    countFolders,
    setSelectedFolder,
    setFolderLoading,
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
      foldersTree: state.dataTree,
      setFoldersTree: state.setDataTree,
    }),
    shallow
  );

  const {
    tasks,
    taskLoading,
    selectedTask,
    setTasks,
    countTasks,
    setSelectedTask,
    setTaskLoading,
    discussionTask,
    setDiscussionTask,
    discussionTasks,
    setDiscussionTasks,
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      taskLoading: state.loading,
      selectedTask: state.selectedData,
      setTasks: state.setDatas,
      countTasks: state.countDatas,
      setSelectedTask: state.setSelectedData,
      setTaskLoading: state.setLoading,
      discussionTask: state.discussionTask,
      setDiscussionTask: state.setDiscussionTask,
      discussionTasks: state.discussionTasks,
      setDiscussionTasks: state.setDiscussionTasks,
    }),
    shallow
  );

  const handleChangeView = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, view: newView }));
    }
  };

  function applyFilter({
    inputData,
    comparator,
    filterName,
  }: {
    inputData: IDiscussionTask[];
    comparator: (a: any, b: any) => number;
    filterName: string;
  }) {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
  
    inputData = stabilizedThis.map((el) => el[0]);
  
    if (filterName) {
      const byName = inputData.filter(
        (task) => task.mainTask.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byDescription = inputData.filter(
        (task) => task.mainTask.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byNote = inputData.filter(
        (task) => task.mainTask.note.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      
      inputData = _.union(byName, byDescription, byNote );
    }
  
    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: discussionTasks,
    comparator: getComparator(table.order, table.orderBy),
    filterName: localState.filterName,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound = (!dataFiltered.length && !!localState.filterName);

  const isFiltered = !!localState.filterName;

  const handleFilter = (filterName: string, event: React.ChangeEvent<HTMLInputElement> | null) => {
    var filterData: any = null;
    if (filterName === 'filterName')
    {
      filterData = { filterName: event?.target.value };
    } else {
      filterData = { filterName: '' };
    }
    if (filterData != null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, ...filterData }));
    }
  };

  return {
    localState, 
    setLocalState,
    //
    handleChangeView,
    table,
    dataFiltered,
    applyFilter,
    dataInPage,
    isNotFound,
    isFiltered,
    handleFilter,
    //
    page,
    setPage,
    //
    user,
    //
    tasks,
    taskLoading,
    selectedTask,
    setTasks,
    countTasks,
    setSelectedTask,
    setTaskLoading,
    discussionTask,
    setDiscussionTask,
    discussionTasks,
    setDiscussionTasks,
    //
    setSelectedFolder,
    //
    setIsSplit,
    setFirstObject,
    setFirstSubObject,
    setMarkupSettings,
    //
    translate,
  }
};

const tasksFunction = ({
  props, 
  state, 
  setState
}: {props: IDiscussionsAttribute, state: ILocalState, setState: Function}): IDiscussionsFunction => {
  
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Mở / Đóng các hộp thoại tạo task mới
  const handleNewGeneralDiscussionDialog = () => {
    if (props.user?.group !== null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openNewGeneralDiscussionDialog: true,
        isEdit: false,
      }));
    } else {
      enqueueSnackbar(`${props.translate('helps.no_group_alert')}`, {variant: "info"});
    }
  }

  const handleEditGeneralDiscussion = (taskId: string) => {
    const filterTask = props.discussionTasks.filter((e: IDiscussionTask) => e.mainTask._id === taskId);
    props.setDiscussionTask(filterTask[0]);
    props.setSelectedTask(filterTask[0].mainTask);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewGeneralDiscussionDialog: true,
      isEdit: true,
    }));
  }

  const closeNewGeneralDiscussionDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewGeneralDiscussionDialog: false,
      isEdit: false,
    }));
  }

  // Load all tasks
  const LoadTasks = useCallback(async () => {
    if (props.user === null) return;
    if (props.user?.group === null) {
      enqueueSnackbar(`${props.translate('helps.no_group_alert')}`, {variant: "info"});
      router.push(PATH_DASHBOARD.member.users);
      return;
    }

    if (props.user.project !== null) {
      let uRole = props.user?.class.uclass;
      if (props.user?.projectrole === UserClassEnum.Admin) {
        uRole = props.user?.projectrole;
      }

      const params = { 
        project: props.user?.project._id,
        category: TaskCategory.GeneralDiscussion,
      };

      const apiRes: IDiscussionTask[] = await discussionsApi.getAllDiscussionTasks(params, props.user?.id, uRole, props.user?.customer._id) as IDiscussionTask[];
      props.setDiscussionTasks(apiRes);

      let urlParams = new URLSearchParams(window.location.search);
      let selParam = urlParams.get('sel');
      if (selParam) {
        const taskFilter = apiRes.filter(e => e.mainTask._id === selParam);
        setState((prevState: ILocalState) => ({
          ...prevState,
          replyItem: taskFilter[0],
        }));
      }

    } else {
      enqueueSnackbar(`${props.translate('cloud.select_project_require')}`, {variant: "info"});
      router.push(PATH_DASHBOARD.projects.list);
    }
  }, [props.user]);

  // const handleOpenRow = async (itemId: string) => {
  //   props.setIsSplit(false);
  //   props.setFirstObject(null);
  //   props.setFirstSubObject(null);
  //   props.setMarkupSettings(null);
  //   router.push(`${PATH_DASHBOARD.information.discussions}?task=${itemId}`);
  // }

  const handleSetPermission = (taskId: string | null) => {
    const openTaskPermissionDialog = (data: IMainTask | null, flagOpenDialog: boolean) => {
      props.setSelectedTask(data);
  
      setState((prevState: ILocalState) => ({
        ...prevState,
        openTaskPermissionDialog: flagOpenDialog,
      }));
    }

    if (taskId === null) {
      return openTaskPermissionDialog(null, false);
    }
    const filterTasks = props.discussionTasks.filter((task: IDiscussionTask) => task.mainTask._id === taskId);
    if (filterTasks.length > 0) {
      openTaskPermissionDialog(filterTasks[0].mainTask, true);
    }
  }

  // Delete Task: Share Func
  const handleDeleteRow = (taskId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteRow(null),
    }

    if (taskId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterTask = props.discussionTasks.filter((ui: IDiscussionTask) => ui.mainTask._id === taskId);
    if (filterTask.length > 0) {
      const deleteTask = filterTask[0].mainTask;
      dataDialog = {
        open: true,
        onClose: () => handleDeleteRow(null),
        title: `${props.translate('common.delete')}`,
        content: deleteTask ? deleteTask.name : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteTask(deleteTask)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteTask = async (deleteTask: IMainTask) => {
    if (deleteTask !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateTask = await mainTasksApi.deleteById(deleteTask?._id ?? '', deleteData);
      if (updateTask) {
        LoadTasks();
        if (props.page > 0) {
          if (props.dataInPage.length < 2) {
            props.setPage(props.page - 1);
          }
        }
      }
    }
    handleDeleteRow(null);  
  };

  // Reply Dialog
  const handleReplyDialog = (itemId: string) => {
    window.history.pushState({}, ``, `?sel=${itemId}`);

    const taskFilter = props.discussionTasks.filter((e: IDiscussionTask) => e.mainTask._id === itemId);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openReply: true,
      replyItem: taskFilter[0],
      groupsInFolder: taskFilter[0].groups,
    }));
  }

  const handleCloseReplyDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openReply: false,
      replyItem: null,
      groupsInFolder: [],
    }));
    window.history.pushState({}, '', window.location.pathname);
    LoadTasks();
  }

  const handleOpenFilesDialog = async (tid: string, open: boolean) => {
    if (open === true) {
      const taskFilter = props.discussionTasks.filter((e: IDiscussionTask) => e.mainTask._id === tid);
      if (taskFilter.length > 0) {
        props.setDiscussionTask(taskFilter[0]);
        props.setSelectedTask(taskFilter[0].mainTask);
        const folderRes = await foldersApi.getReadByIdWithUser((taskFilter[0].mainTask.folder as IFolder)._id, props.user?.id);
        props.setSelectedFolder(folderRes);
      }
    } else {
      props.setSelectedFolder(null);
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskFilesDialog: open,
    }));
  }

  // handle mở hộp thoại thông tin công việc
  const handleOpenInfoDialog = (tid: string, open: boolean) => {
    const taskFilter = props.discussionTasks.filter((e: IDiscussionTask) => e.mainTask._id === tid);
    if (taskFilter.length > 0) {
      props.setDiscussionTask(taskFilter[0]);
      props.setSelectedTask(taskFilter[0].mainTask);
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskInfoDialog: open,
    }));
  }

  return {
    LoadTasks,
    //
    handleNewGeneralDiscussionDialog,
    handleEditGeneralDiscussion,
    closeNewGeneralDiscussionDialog,
    handleSetPermission,
    handleDeleteRow,
    //
    handleReplyDialog,
    handleCloseReplyDialog,
    //
    handleOpenFilesDialog,
    handleOpenInfoDialog,
  }
};

const DiscussionsContainer = () => {
  
  let props = discussionsAttribute();
  const { localState, setLocalState, user } = props;

  let func = tasksFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.LoadTasks();
  }, [user]);

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
      <Head>
        <title> {`${props.translate('nav.discussion')}`} </title>
      </Head>
      <DiscussionsComponent props={props} func={func} />
    </>
  )
}

export default DiscussionsContainer;