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
import TasksComponent from 'src/components/dashboard/tasks/tasks.component';
// enums
import { DataTableEnum, TaskCategory } from 'src/shared/enums';
import { UserClassEnum } from 'src/shared/enums';
import { DeleteData } from 'src/shared/types/deleteData';
// apis
import mainTasksApi from 'src/api/mainTasksApi';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// type
import { IMainTask } from 'src/shared/types/mainTask';
import useForgeViewState from 'src/redux/forgeViewStore';
import { IForgeObject, IMarkupSettings } from 'src/shared/types/forgeObject';
import requestsApi from 'src/api/requestsApi';
// --------------------------------------------------------------------------

export type ILocalState = {
  pageTitle: string;
  taskCategory: TaskCategory;
  //
  isEdit: boolean;
  openNewRequestDialog: boolean;
  openNewCollaborationDialog: boolean;
  openNewPointCloudDialog: boolean;
  openNewScheduleReportDialog: boolean;
  //
  filterName: string;
  view: string;
  //
  openTaskPermissionDialog: boolean;
  dataDialog: ConfirmDialogProps;
  openDetails: boolean;
  detailItem: IMainTask | null;
};

export type ITasksAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  handleChangeView: (event: React.MouseEvent<HTMLElement>, newView: string | null) => void,
  table: TableProps,
  dataFiltered: IMainTask[],
  applyFilter: Function,
  dataInPage: IMainTask[],
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
  //
  setIsSplit: (value: boolean) => void,
  setFirstObject: (obj: IForgeObject | null) => void,
  setFirstSubObject: (obj: IForgeObject | null) => void,
  setMarkupSettings: (obj: IMarkupSettings | null) => void,
  //
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type ITasksFunction = {
  LoadTasks: () => Promise<void>;
  //
  handleNewTask: (newCategory: TaskCategory) => void;
  closeNewDialog: () => void;
  handleOpenRow: (taskId: string) => void;
  handleEditRow: (taskId: string) => void;
  handleSetPermission: (taskId: string | null) => void;
  handleDeleteRow: (taskId: string | null) => void;
  //
  handleDetailsDialog: (taskId: string) => void;
  handleCloseDetailsDialog: VoidFunction;
};

const tasksAttribute = (category: TaskCategory): ITasksAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    pageTitle: '',
    taskCategory: category,
    //
    isEdit: false,
    openNewRequestDialog: false,
    openNewCollaborationDialog: false,
    openNewPointCloudDialog: false,
    openNewScheduleReportDialog: false,
    //
    filterName: '',
    view: 'list',
    openTaskPermissionDialog: false,
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    //
    openDetails: false,
    detailItem: null,
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
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      taskLoading: state.loading,
      selectedTask: state.selectedData,
      setTasks: state.setDatas,
      countTasks: state.countDatas,
      setSelectedTask: state.setSelectedData,
      setTaskLoading: state.setLoading,
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
    inputData: IMainTask[];
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
        (task) => task.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byDescription = inputData.filter(
        (task) => task.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byNote = inputData.filter(
        (task) => task.note.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      
      inputData = _.union(byName, byDescription, byNote );
    }
  
    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: tasks,
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
  category,
  props, 
  state, 
  setState
}: {category: TaskCategory, props: ITasksAttribute, state: ILocalState, setState: Function}): ITasksFunction => {
  
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Mở / Đóng các hộp thoại tạo task mới
  const handleNewRequestDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewRequestDialog: true,
      isEdit: false,
    }));
  }

  const handleEditRequest = (taskId: string) => {
    const filterTask = props.tasks.filter(e => e._id === taskId);
    props.setSelectedTask(filterTask[0]);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewRequestDialog: true,
      isEdit: true,
    }));
  }

  const closeNewRequestDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewRequestDialog: false,
      isEdit: false,
    }));
  }

  const handleEditCollaboration = (taskId: string) => {
    const filterTask = props.tasks.filter(e => e._id === taskId);
    props.setSelectedTask(filterTask[0]);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewCollaborationDialog: true,
      isEdit: true,
    }));
  }

  const handleNewCollaborationDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewCollaborationDialog: true,
      isEdit: false,
    }));
  }

  const closeNewCollaborationDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewCollaborationDialog: false,
      isEdit: false,
    }));
  }

  const handleNewScheduleReportDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewScheduleReportDialog: true,
      isEdit: false,
    }));
  }

  const handleEditScheduleReport = (taskId: string) => {
    const filterTask = props.tasks.filter(e => e._id === taskId);
    props.setSelectedTask(filterTask[0]);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewScheduleReportDialog: true,
      isEdit: true,
    }));
  }

  const closeNewScheduleReportDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewScheduleReportDialog: false,
      isEdit: false,
    }));
  }

  const handleNewPointCloudDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewPointCloudDialog: true,
      isEdit: false,
    }));
  }

  const handleEditPointCloud = (taskId: string) => {
    const filterTask = props.tasks.filter(e => e._id === taskId);
    props.setSelectedTask(filterTask[0]);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewPointCloudDialog: true,
      isEdit: true,
    }));
  }

  const closeNewPointCloudDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewPointCloudDialog: false,
      isEdit: false,
    }));
  }

  const closeNewDialog = () => {
    switch (category)
    {
      case TaskCategory.FileRequestCloud:
        closeNewRequestDialog();
        break;
      case TaskCategory.Collaboration:
        closeNewCollaborationDialog();
        break;
      case TaskCategory.ScheduleReport:
        closeNewScheduleReportDialog();
        break;
      case TaskCategory.PointCloud:
        closeNewPointCloudDialog();
        break;
    }
  }

  // Load all tasks
  const LoadTasks = useCallback(async () => {
    if (props.user === null) return;
    if (props.user.group === null) {
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
        category: TaskCategory.Collaboration,
      };

      if (!category.toString().includes('Collaboration'))
      {
        params.category = category;
      }

      let apiRes: IMainTask[] = [];
      if (category !== TaskCategory.FileRequestCloud) {
        apiRes = await mainTasksApi.getAllByUser(params, props.user?.id, uRole, props.user?.customer._id) as IMainTask[];
      } else {
        if (uRole === UserClassEnum.Admin) {
          apiRes = await mainTasksApi.getAllByUser(params, props.user?.id, uRole, props.user?.customer._id) as IMainTask[];
        } else {
          apiRes = await requestsApi.getRequestTasksByUser(params, props.user?.group._id);
        }
      }

      props.setTasks(apiRes);

      let urlParams = new URLSearchParams(window.location.search);
      let selParam = urlParams.get('sel');
      if (selParam) {
        const taskFilter = apiRes.filter(e => e._id === selParam);
        setState((prevState: ILocalState) => ({
          ...prevState,
          openDetails: true,
          detailItem: taskFilter[0],
        }));
      }

    } else {
      enqueueSnackbar(`${props.translate('cloud.select_project_require')}`, {variant: "info"});
      router.push(PATH_DASHBOARD.projects.list);
    }
  }, [props.user]);

  const handleOpenRow = async (itemId: string) => {
    props.setIsSplit(false);
    props.setFirstObject(null);
    props.setFirstSubObject(null);
    props.setMarkupSettings(null);
    switch (category)
    {
      case TaskCategory.FileRequestCloud:
        router.push(`${PATH_DASHBOARD.cloud.requestDetails}?task=${itemId}`);
        break;
      case TaskCategory.Collaboration:
        router.push(`${PATH_DASHBOARD.coordinator.collaborationDetails}?task=${itemId}`);
        break;
      case TaskCategory.ScheduleReport:
        router.push(`${PATH_DASHBOARD.schedules.planningDetails}?task=${itemId}`);
        break;
      case TaskCategory.PointCloud:
        router.push(`${PATH_DASHBOARD.site.pointCloudDetails}?task=${itemId}`);
        break;
    }
  }

  const handleNewTask = (newCategory: TaskCategory) => {
    switch (newCategory)
    {
      case TaskCategory.FileRequestCloud:
        handleNewRequestDialog();
        break;
      case TaskCategory.Collaboration:
        handleNewCollaborationDialog();
        break;
      case TaskCategory.ScheduleReport:
        handleNewScheduleReportDialog();
        break;
      case TaskCategory.PointCloud:
        handleNewPointCloudDialog();
        break;
    }
  }

  const handleEditRow = (itemId: string) => {
    switch (category)
    {
      case TaskCategory.FileRequestCloud:
        handleEditRequest(itemId);
        break;
      case TaskCategory.Collaboration:
        handleEditCollaboration(itemId);
        break;
      case TaskCategory.ScheduleReport:
        handleEditScheduleReport(itemId);
        break;
      case TaskCategory.PointCloud:
        handleEditPointCloud(itemId);
        break;
    }
  }

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
    const filterTasks = props.tasks.filter((task: any) => task._id === taskId);
    if (filterTasks.length > 0) {
      openTaskPermissionDialog(filterTasks[0], true);
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
    const filterTask = props.tasks.filter(ui => ui._id === taskId);
    if (filterTask.length > 0) {
      const deleteTask = filterTask[0]
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

  // Details Dialog
  const handleDetailsDialog = (itemId: string) => {
    window.history.pushState({}, ``, `?sel=${itemId}`);

    const taskFilter = props.tasks.filter(e => e._id === itemId);
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: true,
      detailItem: taskFilter[0],
    }));
  }

  const handleCloseDetailsDialog = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDetails: false,
      detailItem: null,
    }));
    window.history.pushState({}, '', window.location.pathname);
  }

  return {
    LoadTasks,
    //
    handleNewTask,
    closeNewDialog,
    handleOpenRow,
    handleEditRow,
    handleSetPermission,
    handleDeleteRow,
    //
    handleDetailsDialog,
    handleCloseDetailsDialog,
  }
};

const TasksContainer = (category: TaskCategory) => {
  
  let props = tasksAttribute(category);
  const { localState, setLocalState, user } = props;

  let func = tasksFunction({category, props, state: localState, setState: setLocalState});

  // Xác định page title cho từng loại
  useEffect(() => {
    switch (category)
    {
      case TaskCategory.FileRequestCloud:
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          pageTitle: `${props.translate('nav.request')}`
        }));
        break;
      case TaskCategory.Collaboration:
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          pageTitle: `${props.translate('nav.collaboration')}`,
        }));
        break;
      case TaskCategory.PointCloud:
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          pageTitle: `${props.translate('nav.point_cloud')}`,
        }));
        break;
      case TaskCategory.RFIs:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.rfi_reports')}` }));
        break;
      case TaskCategory.Clashing:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.clashing')}` }));
        break;
      case TaskCategory.TakeOff:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.take_off')}` }));
        break;
      case TaskCategory.ScheduleReport:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.schedule')}` }));
        break;
      case TaskCategory.MethodStatement:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.method_statement')}` }));
        break;
      case TaskCategory.Sheets:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.sheets')}` }));
        break;
      case TaskCategory.Report360:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.reports360')}` }));
        break;
      case TaskCategory.CombineData:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.combine_data')}` }));
        break;
      case TaskCategory.ProjectHistory:
        setLocalState((prevState: ILocalState) => ({ ...prevState, pageTitle: `${props.translate('nav.project_histories')}` }));
        break;
    }
  }, [user]);

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
        <title> {props.localState.pageTitle} </title>
      </Head>
      <TasksComponent props={props} func={func} />
    </>
  )
}

export default TasksContainer;