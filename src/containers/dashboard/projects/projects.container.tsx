import React, { useState, useEffect, useCallback } from 'react';
// components
import {
  useTable,
  getComparator,
} from '../../../components/table';
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
// @mui
import {
  Button,
} from '@mui/material';
// zustand
import useProjectCategory from 'src/redux/projectCategoryStore';
import useProject from 'src/redux/projectStore';
import { shallow } from 'zustand/shallow';

import _ from 'lodash';
import groupsApi from 'src/api/groupsApi';
import projectsApi from 'src/api/projectsApi';
import projectCategoriesApi from 'src/api/projectCategoriesApi';
import userclassesApi from 'src/api/userclassesApi';
import { IGroup, IGroupResGetAll } from 'src/shared/types/group';
import { IProjectCategoryResGetAll, IProjectCategory } from 'src/shared/types/projectCategory';
import { IProject, IProjectResGetAll } from 'src/shared/types/project';
import { IUclass, IUclassReqCreate, IUclassResGetAll } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import { AuthUserType } from 'src/auth/types';
import { TFunctionDetailedResult } from 'i18next';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import ProjectsComponent from 'src/components/dashboard/projects/projects.component';
// enums
import { DenseEnum, DataTableEnum } from 'src/shared/enums';
import { UserClassEnum } from 'src/shared/enums';
import { DeleteData } from 'src/shared/types/deleteData';
import groupInProjectsApi from 'src/api/groupInProjectsApi';
import usersApi from 'src/api/usersApi';
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from '../../../components/snackbar';
import useFolder from 'src/redux/foldersStore';
import { IFolder } from 'src/shared/types/folder';

// --------------------------------------------------------------------------

export type ILocalState = {
  filterName: string;
  filterGroup: string;
  view: string;
  openNewProjectDialog: boolean;
  openCategoriesDialog: boolean;
  groupOptions: string[];
  openProjectInfoDialog: boolean;
  isEdit: boolean;
  openProjectPermissionDialog: boolean;
  openClonePermissionDialog: boolean;
  dataDialog: ConfirmDialogProps;
  showWaiting: boolean;
};

export type IProjectAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  dense: boolean,
  setDense: (value: boolean) => void,
  page: number,
  order: 'asc' | 'desc',
  orderBy: string,
  rowsPerPage: number,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  //
  selected: string[],
  setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  onSelectRow: (id: string) => void,
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void,
  //
  onSort: (id: string) => void,
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void,
  onChangePage: (event: unknown, newPage: number) => void,
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void,
  //
  projects: IProject[],
  loading: boolean,
  selectedProject: IProject | null,
  setProjects: (uclasses: IProject[]) => void,
  countProjects: () => void,
  setSelectedProject: (uclass: IProject | null) => void,
  setLoading: (value: boolean) => void,
  //
  user: AuthUserType,
  refresh: (id: string) => Promise<void>,
  //
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject | undefined) => SnackbarKey,
  //
  projectCategories: IProjectCategory[],
  selectedProjectCategory?: IProjectCategory | null,
  setProjectCategories: (groups: IProjectCategory[]) => void,
  countProjectCategories: () => void,
  setSelectedProjectCategory: (group: IProjectCategory | null) => void,
  //
  setSelectedFolder: (folder: IFolder | null) => void,
  //
  TABLE_HEAD: any[],
  SHORT_TABLE_HEAD: any[],
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IProjectFunction = {
  loadAllProject: () => Promise<void>,
  handleNewProjectDialog: () => void,
  loadAllProjectCategories: () => Promise<void>,
  handleCategoriesDialog: (openCategoriesDialog: boolean) => void,
  handleFilter: (filterGroup: string, event: React.ChangeEvent<HTMLInputElement> | null) => void,
  handleOpenProjectInfoDialog: (projectId: string | null) => void,
  handleEditProject: (projectId: string | null) => void,
  handleSetPermission: (projectId: string | null) => void,
  handleClonePermissionDialog: (openClonePermissionDialog: boolean) => void,
  handleBlockProjectConfirm: (projectId: string | null) => void,
  handleDeleteProjectConfirm: (userId: string | null) => void,
  setDefaultProject: (_id: string) => Promise<void>,
  dataFiltered: IProject[],
  applyFilter: Function,
};

const projectAttribute = (): IProjectAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
    filterGroup: '',
    view: 'list',

    openNewProjectDialog: false,
    openCategoriesDialog: false,
    groupOptions: [],

    openProjectInfoDialog: false,
    isEdit: false,
    openProjectPermissionDialog: false,
    openClonePermissionDialog: false,

    dataDialog: {
      open: false,
      onClose: () => {}
    },
    showWaiting: false,
  });

  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const {
    dense,
    setDense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const TABLE_HEAD = [
    { id: 'default', label: `${translate('common.default')}`, align: 'center', width: 120 },
    { id: 'name', label: `${translate('projects.project_name')}`, align: 'left', width: 300 },
    { id: 'category', label: `${translate('common.type')}`, align: 'center', width: 120 },
    { id: 'address', label: `${translate('customers.address')}`, align: 'left', width: 500 },
    { id: 'createdby', label: `${translate('common.createdby')}`, align: 'center', width: 150 },
    { id: 'block', label: `${translate('common.block')}`, align: 'center', width: 110 },
    { id: '' },
  ];

  const SHORT_TABLE_HEAD = [
    { id: 'default', label: `${translate('common.default')}`, align: 'center' },
    { id: 'name', label: `${translate('projects.project_name')}`, align: 'left' },
    { id: 'category', label: `${translate('common.project_category')}`, align: 'left' },
    { id: 'block', label: `${translate('common.block')}`, align: 'center', width: 110 },
    { id: '' },
  ];

  const {
    projects,
    loading,
    selectedProject,
    setProjects,
    countProjects,
    setSelectedProject,
    setLoading,
  } = useProject(
    (state) => ({ 
      projects: state.datas,
      loading: state.loading,
      selectedProject: state.selectedData,
      setProjects: state.setDatas,
      countProjects: state.countDatas,
      setSelectedProject: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const {
    projectCategories,
    selectedProjectCategory,
    setProjectCategories,
    countProjectCategories,
    setSelectedProjectCategory,
  } = useProjectCategory(
    (state) => ({ 
      projectCategories: state.datas,
      selectedProjectCategory: state.selectedData,
      setProjectCategories: state.setDatas,
      countProjectCategories: state.countDatas,
      setSelectedProjectCategory: state.setSelectedData,
    }),
    shallow
  );

  const {
    setSelectedFolder,
  } = useFolder(
    (state) => ({ 
      setSelectedFolder: state.setSelectedData,
    }),
    shallow
  );

  return {
    localState, 
    setLocalState,
    //
    dense,
    setDense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
    //
    projects,
    loading,
    selectedProject,
    setProjects,
    countProjects,
    setSelectedProject,
    setLoading,
    //
    user,
    refresh,
    //
    enqueueSnackbar,
    //
    projectCategories,
    selectedProjectCategory,
    setProjectCategories,
    countProjectCategories,
    setSelectedProjectCategory,
    //
    setSelectedFolder,
    //
    TABLE_HEAD,
    SHORT_TABLE_HEAD,
    translate,
  }
};

const projectFunction = ({
  props, 
  state, 
  setState
}: {props: IProjectAttribute, state: ILocalState, setState: Function}): IProjectFunction => {

  // Load all project base on current user
  const loadAllProject = useCallback(async () => {
    if (props.user?.customer !== null) {
      props.setLoading(true);
      let apiRes: IProjectResGetAll;
      if (props.user?.class.uclass === UserClassEnum.Admin) {
        const params = { customerId: props?.user?.customer._id };
        apiRes = await projectsApi.getProjects(params);
      } else {
        apiRes = await projectsApi.getByUser(props.user?.id, props.user?.customer._id);
      }
      props.setProjects(apiRes.data);
    }
    props.setLoading(false);
  }, [props?.user]);

  // Edit project
  const openEditProjectDialog = (data: IProject | null, flagOpenDialog: boolean, isEditFlag: boolean) => {
    props.setSelectedProject(data);

    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewProjectDialog: flagOpenDialog,
      isEdit: isEditFlag,
    }));
  }

  const handleEditProject = (projectId: string | null) => {
    if (projectId === null) {
      return openEditProjectDialog(null, false, false);
    }
    const filterProjects = props.projects.filter((project: any) => project._id === projectId);
    if (filterProjects.length > 0) {
      openEditProjectDialog(filterProjects[0], true, true);
    }
  }

  // new project
  const handleNewProjectDialog = () => {
    openEditProjectDialog(null, true, false);
  }

  // Load all project categories
  const loadAllProjectCategories = useCallback(async () => {
    const groupNames: string[] = [];
    groupNames.push('all');
    const param = {
      customerId: props.user?.customer?._id,
    }
    const apiRes: IProjectCategoryResGetAll = await projectCategoriesApi.getProjectCategories(param);
    for (const gi of apiRes.data) {
      groupNames.push(gi.name);
    }

    setState((prevState: ILocalState) => ({ ...prevState, groupOptions: groupNames }));
    handleFilter('reset', null);
  }, [props.projectCategories]);

  const handleCategoriesDialog = (openCategoriesDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openCategoriesDialog }));
  }

  const handleFilter = (filterGroup: string, event: React.ChangeEvent<HTMLInputElement> | null) => {
    var filterData: any = null;
    switch (filterGroup) {
      case 'filterName':
        filterData = { filterName: event?.target.value };
        break;
      case 'filterGroup':
        filterData = { filterGroup: event?.target.value };
        break;
      default:
        filterData = { filterName: '', filterGroup: 'all' };
        break;
    }
    if (filterData != null) {
      setState((prevState: ILocalState) => ({ ...prevState, ...filterData }));
    }
  };

  const handleOpenProjectInfoDialog = (projectId: string | null) => {
    const openProjectInfoDialog = (data: IProject | null, flagOpenDialog: boolean) => {
      props.setSelectedProject(data);
  
      setState((prevState: ILocalState) => ({
        ...prevState,
        openProjectInfoDialog: flagOpenDialog,
      }));
    }

    if (projectId === null) {
      return openProjectInfoDialog(null, false);
    }
    const filterProjects = props.projects.filter((project: any) => project._id === projectId);
    if (filterProjects.length > 0) {
      openProjectInfoDialog(filterProjects[0], true);
    }
  }

  const handleSetPermission = (projectId: string | null) => {
    const openProjectPermissionDialog = (data: IProject | null, flagOpenDialog: boolean) => {
      props.setSelectedProject(data);
  
      setState((prevState: ILocalState) => ({
        ...prevState,
        openProjectPermissionDialog: flagOpenDialog,
      }));
    }

    if (projectId === null) {
      return openProjectPermissionDialog(null, false);
    }
    const filterProjects = props.projects.filter((project: any) => project._id === projectId);
    if (filterProjects.length > 0) {
      openProjectPermissionDialog(filterProjects[0], true);
    }
  }

  // block user
  const handleBlockProjectConfirm = (projectId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleBlockProjectConfirm(null),
    }

    if (projectId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterProject = props.projects.filter(ui => ui._id === projectId);
    if (filterProject.length > 0) {
      const selectedProject = filterProject[0];

      dataDialog = {
        open: true,
        onClose: () => handleBlockProjectConfirm(null),
        title: `${props.translate('common.block')} | ${props.translate('common.unblock')}`,
        content: selectedProject ? selectedProject.name : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onBlockProject(selectedProject)}>
            Ok
          </Button>
        )
      };
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onBlockProject = async (selectedProject: IProject) => {
    if (selectedProject !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateProject = await projectsApi.blockById(selectedProject?._id ?? '', deleteData);
      if (updateProject) {
        loadAllProject();
      }
    }
    handleBlockProjectConfirm(null);
  };

  // Delete project
  const handleDeleteProjectConfirm = (projectId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteProjectConfirm(null),
    }

    if (projectId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterProject = props.projects.filter(ui => ui._id === projectId);
    if (filterProject.length > 0) {
      const selectedProject = filterProject[0]
      dataDialog = {
        open: true,
        onClose: () => handleDeleteProjectConfirm(null),
        title: `${props.translate('common.delete')}`,
        content: selectedProject ? selectedProject.name : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteProject(selectedProject)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteProject = async (selectedProject: IProject) => {
    if (selectedProject !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateProject = await projectsApi.deleteById(selectedProject?._id ?? '', deleteData);
      if (updateProject) {
        loadAllProject();
        if (props.page > 0) {
          if (dataInPage.length < 2) {
            props.setPage(props.page - 1);
          }
        }
      }
    }
    handleDeleteProjectConfirm(null);  
  };

  const handleClonePermissionDialog = (value: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openClonePermissionDialog: value }));
  }

  const setDefaultProject = async (_id: string) => {
    if (_id === '') return;
    props.setLocalState((prevState: ILocalState) => ({
      ...prevState,
      showWaiting: true,
    }));
    // Kiểm tra dự án có bị block hay không?
    const projectRes = await projectsApi.getReadById(_id);
    if (projectRes.blockedAt === undefined || projectRes.blockedAt === null) {
      // Đọc dữ liệu user là quản trị hay thành viên?
      const projectAdmin = await groupInProjectsApi.userIsProjectAdmin(props.user?.id, _id);
      await usersApi.updateById(props.user?.id, {project: _id, projectrole: projectAdmin});    
      props.refresh(props.user?.id);
      props.setSelectedFolder(null);
    } else {
      props.enqueueSnackbar(`${props.translate('projects.blocked_project')}`, {variant: "warning"});
    }
    props.setLocalState((prevState: ILocalState) => ({
      ...prevState,
      showWaiting: false,
    }));
  }

  const applyFilter = ({
    inputData,
    comparator,
    filterName,
    filterGroup,
  }: {
    inputData: IProject[];
    comparator: (a: any, b: any) => number;
    filterName: string;
    filterGroup: string;
  }) => {
  
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    
    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
      const byName = inputData.filter(
        (project) => project.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byAddress = inputData.filter(
        (project) => project.address.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byDescription = inputData.filter(
        (project) => project.description.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      const byNote = inputData.filter(
        (project) => project.note.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      
      inputData = _.union(byName, byAddress, byDescription, byNote );
    }
    
    // if (filterGroup !== 'all') {
    //   inputData = inputData.filter((project) => (
    //     (project.category as IProjectCategory).name === filterGroup)
    //   );
    // }
    if (filterGroup !== 'all') {
      inputData = inputData.filter((project) => (
        (project.category !== undefined) ? (project.category as IProjectCategory).name === filterGroup : project)
      );
    }

    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: props.projects,
    comparator: getComparator(props.order, props.orderBy),
    filterName: state.filterName,
    filterGroup: state.filterGroup,
  });

  const dataInPage = dataFiltered.slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage);

  return {
    loadAllProject,
    handleNewProjectDialog,
    loadAllProjectCategories,
    handleCategoriesDialog,
    handleFilter,
    handleOpenProjectInfoDialog,
    handleEditProject,
    handleSetPermission,
    handleClonePermissionDialog,
    handleBlockProjectConfirm,
    handleDeleteProjectConfirm,
    setDefaultProject,
    dataFiltered,
    applyFilter,
  }
};

const ProjectsContainer = () => {
  
  let props = projectAttribute();
  const { localState, setLocalState, user } = props;

  let func = projectFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.loadAllProject();
  }, [user]);

  useEffect(() => {
    func.loadAllProjectCategories();
  }, [user, props.projectCategories]);


  useEffect(() => {
    if (user !== null) {
      if (user.denseMode === DenseEnum.Dense) {
        props.setDense(true);
      } else {
        props.setDense(false);
      }
    }
  }, [user]);

  return (
    <>
      <ProjectsComponent props={props} func={func}/>
    </>
  )
}

export default ProjectsContainer;