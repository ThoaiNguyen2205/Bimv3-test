import React, { useState, useEffect, useCallback } from 'react';
// components
import {
  useTable,
  getComparator
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
// import { LoadingButton } from '@mui/lab';
// zustand
import useUclass from 'src/redux/uclassStore';
import useGroup from 'src/redux/groupStore';
import useContract from 'src/redux/contractStore';
import { shallow } from 'zustand/shallow';

import _ from 'lodash';
import groupsApi from 'src/api/groupsApi';
import userclassesApi from 'src/api/userclassesApi';
import { IGroup, IGroupResGetAll } from 'src/shared/types/group';
import { IUclass, IUclassReqCreate, IUclassResGetAll } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import { AuthUserType } from 'src/auth/types';
import { TFunctionDetailedResult } from 'i18next';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import UserComponent from 'src/components/dashboard/member/user.component';
// enums
import { DenseEnum, UserClassEnum } from 'src/shared/enums';
import { DeleteData } from 'src/shared/types/deleteData';
import { IContract } from 'src/shared/types/contract';
import contractsApi from 'src/api/contractsApi';
import usersApi from 'src/api/usersApi';


// --------------------------------------------------------------------------

export type ILocalState = {
  filterName: string;
  filterGroup: string;
  openInvitationsDialog: boolean;
  openGroupsDialog: boolean;
  groupOptions: string[];

  openAddUserToGroupDialog: boolean;
  openAddUsersToGroupDialog: boolean;
  openCreateGroupConfirm: boolean;
  // selectedGroupId: string;

  dataDialog: ConfirmDialogProps;
};

export type IUserAttribute = {
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
  uclasses: IUclass[],
  loading: boolean,
  selectedUclass: IUclass | null,
  setUclasses: (uclasses: IUclass[]) => void,
  countUclasses: () => void,
  setSelectedUclass: (uclass: IUclass | null) => void,
  setLoading: (value: boolean) => void,
  //
  selectedContract: IContract | null;
  setSelectedContract: (contract: IContract | null) => void;
  //
  user: AuthUserType,
  groups: IGroup[],
  selectedGroup?: IGroup | null,
  setGroups: (groups: IGroup[]) => void,
  countGroups: () => void,
  setSelectedGroup: (group: IGroup | null) => void,
  //
  TABLE_HEAD: any[],
  SHORT_TABLE_HEAD: any[],
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IUserFunction = {
  loadAllUser: () => Promise<void>,
  handleInvitationsDialog: (openInvitationsDialog: boolean) => void,
  loadAllGroup: () => Promise<void>,
  handleGroupsDialog: (openGroupsDialog: boolean) => void,
  handleFilter: (filterGroup: string, event: React.ChangeEvent<HTMLInputElement> | null) => void,
  handleAddUserToGroupDialog: (userId: string | null) => void,
  // setUserToGroup: (data: IUclass | null, flagOpenDialog: boolean) => void,
  // addUserToGroup: () => Promise<void>,
  handleAddUsersToGroupDialog: (openAddUsersToGroupDialog: boolean) => void,
  handleRemoveFromGroupConfirm: (userId: string | null) => void,
  handleRemoveSelectedFromGroupConfirm: (openRemoveSelectedFromGroupConfirm: boolean) => void,
  onRemoveSelectedFromGroupConfirm: () => Promise<void>,
  handleCreateGroupConfirm: (userId: string | null) => void,
  handleSetKeyConfirm: (userId: string | null) => void,
  handleSetUsersKeyConfirm: (openSetUsersKeyConfirm: boolean) => void,
  onSetUsersKeyConfirm: () => Promise<void>,
  handleBlockUserConfirm: (userId: string | null) => void,
  handleBlockUsersConfirm: (openBlockUsersConfirm: boolean) => void,
  onBlockUsers: () => Promise<void>,
  handleStopUserConfirm: (userId: string | null) => void,
  dataFiltered: IUclass[],
  applyFilter: Function,
  handleStopUsersConfirm: (openStopUsersConfirm: boolean) => void,
  onStopUsers: () => Promise<void>,
};

const userAttribute = (): IUserAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
    filterGroup: '',
    
    openInvitationsDialog: false,
    openGroupsDialog: false,
    groupOptions: [],

    openAddUserToGroupDialog: false,
    openAddUsersToGroupDialog: false,
    openCreateGroupConfirm: false,

    dataDialog: {
      open: false,
      onClose: () => {}
    },
  });

  const { user } = useAuthContext();
  const { translate } = useLocales();

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
    { id: 'username', label: `${translate('common.user')}`, align: 'center', width: 100 },
    { id: 'fullname', label: `${translate('auth.fullname')}`, align: 'left', width: 200 },
    { id: 'role', label: `${translate('common.role')}`, align: 'center', width: 150 },
    { id: 'groups', label: `${translate('nav.groups')}`, align: 'center' },
    { id: 'title', label: `${translate('common.group_title')}`, align: 'center' },
    { id: 'key', label: `${translate('common.key_person')}`, align: 'center' },
    { id: 'status', label: `${translate('common.status')}`, align: 'center' },
    { id: '' },
  ];

  const SHORT_TABLE_HEAD = [
    { id: 'username', label: `${translate('common.user')}`, align: 'center' },
    { id: 'groups', label: `${translate('nav.groups')}`, align: 'center' },
    { id: 'key', label: `${translate('common.key_person')}`, align: 'center' },
    { id: 'status', label: `${translate('common.status')}`, align: 'center' },
    { id: '' },
  ];

  const {
    uclasses,
    loading,
    selectedUclass,
    setUclasses,
    countUclasses,
    setSelectedUclass,
    setLoading,
  } = useUclass(
    (state) => ({ 
      uclasses: state.datas,
      loading: state.loading,
      selectedUclass: state.selectedData,
      setUclasses: state.setDatas,
      countUclasses: state.countDatas,
      setSelectedUclass: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const {
    selectedContract,
    setSelectedContract,
  } = useContract(
    (state) => ({ 
      selectedContract: state.selectedData,
      setSelectedContract: state.setSelectedData,
    }),
    shallow
  );

  const {
    groups,
    selectedGroup,
    setGroups,
    countGroups,
    setSelectedGroup,
  } = useGroup(
    (state) => ({ 
      groups: state.datas,
      selectedGroup: state.selectedData,
      setGroups: state.setDatas,
      countGroups: state.countDatas,
      setSelectedGroup: state.setSelectedData,
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
    uclasses,
    loading,
    selectedUclass,
    setUclasses,
    countUclasses,
    setSelectedUclass,
    setLoading,
    //
    selectedContract,
    setSelectedContract,
    //
    user,
    groups,
    selectedGroup,
    setGroups,
    countGroups,
    setSelectedGroup,
    //
    TABLE_HEAD,
    SHORT_TABLE_HEAD,
    translate,
  }
};

const userFunction = ({
  props, 
  state, 
  setState
}: {props: IUserAttribute, state: ILocalState, setState: Function}): IUserFunction => {

  // Load user classes
  const loadAllUser = useCallback(async () => {
    const params = { customerId: props?.user?.customer._id };
    const apiRes: IUclassResGetAll = await userclassesApi.getUserClass(params);    
    props.setUclasses(apiRes.data);
    // load contract liên quan
    const contractParams = { customer: props?.user?.customer._id };
    const contractRes = await contractsApi.getContract(contractParams);
    if (contractRes.data.length > 0) {
      props.setSelectedContract(contractRes.data[0]);
    }
  }, [props?.user]);

  // invitations
  const handleInvitationsDialog = (openInvitationsDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openInvitationsDialog }));
  }

  // Groups
  // Load all groups
  const loadAllGroup = useCallback(async () => {
    const groupNames: string[] = [];
    groupNames.push('all');
    groupNames.push('none');
    const apiRes: IGroupResGetAll = await groupsApi.getByCustomer(props.user?.customer._id);
    for (const gi of apiRes.data) {
      groupNames.push(gi.groupname);
    }

    setState((prevState: ILocalState) => ({ ...prevState, groupOptions: groupNames }));
    handleFilter('reset', null);
  }, [props.groups]);

  const handleGroupsDialog = (openGroupsDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openGroupsDialog }));
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

  const handleAddUserToGroupDialog = (userId: string | null) => {
    if (userId === null) {
      return setUserToGroup(null, false);
    }
    const filterUClass = props.uclasses.filter((ui: any) => ui._id === userId);
    if (filterUClass.length > 0) {
      setUserToGroup(filterUClass[0], true);
      props.setSelected([]);
    }
  }

  const setUserToGroup = (data: IUclass | null, flagOpenDialog: boolean) => {
    props.setSelectedUclass(data);

    setState((prevState: ILocalState) => ({
      ...prevState,
      openAddUserToGroupDialog: flagOpenDialog,
    }));
  }

  // const addUserToGroup = async () => {
  //   if (props.selectedUclass !== null && props.selectedGroup !== null) {
  //     const updateData: IUclassReqCreate = {
  //       groupId: props.selectedGroup?._id,
  //       groupName: props.selectedGroup?.groupname,
  //       groupTitle: props.selectedGroup?.groupname,
  //       updatedById: props.user?.id,
  //       updatedByName: props.user?.username,
  //     }
      
  //     const selectedUClassId = props.selectedUclass?._id ?? '';
  //     const updateUclass = await userclassesApi.updateById(selectedUClassId, updateData);
  //     if (updateUclass) {
  //       loadAllUser();
  //     }
  //   }
  // }

  const handleAddUsersToGroupDialog = (openAddUserToGroupDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openAddUserToGroupDialog }));
  }

  const handleRemoveFromGroupConfirm = (userId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleRemoveFromGroupConfirm(null),
    }
    
    if (userId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return ;
    }

    const filterUClass = props.uclasses.filter(ui => ui._id === userId);

    if (filterUClass.length > 0) {
      const selectedUclass = filterUClass[0];
        
      dataDialog = {
        open: true,
        onClose: () => handleRemoveFromGroupConfirm(null),
        title: selectedUclass ? `${(selectedUclass.user as IUser).username}` : '',
        content: `${props.translate('common.remove_from_group_confirm')}`,
        action: (
          <Button variant="contained" color="error" onClick={() => onRemoveFromGroupConfirm(selectedUclass)}>
            {`${props.translate('common.remove_from_group')}`}
          </Button>
        )
      };
      
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onRemoveFromGroupConfirm = async (selectedUclass: IUclass) => {
    if (selectedUclass !== null) {
      const updateData: IUclassReqCreate = {
        groupId: '',
        groupName: '',
        groupTitle: '',
        updatedById: props.user?.id,
        updatedByName: props.user?.username,
      }
      
      const updateUclass = await userclassesApi.updateById(selectedUclass?._id ?? '', updateData);
      await usersApi.updateById((updateUclass.user as IUser).id, {
        group: null,
        project: null,
        projectrole: UserClassEnum.User,
      });
      if (updateUclass) {
        loadAllUser();
      }
    }
    handleRemoveFromGroupConfirm(null);
  };

  const handleRemoveSelectedFromGroupConfirm = (openRemoveSelectedFromGroupConfirm: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleRemoveSelectedFromGroupConfirm(false),
    }

    if (openRemoveSelectedFromGroupConfirm) {
      dataDialog = {
        open: true,
        onClose: () =>handleRemoveSelectedFromGroupConfirm(false),
        title: `${props.translate('common.remove_from_group')}`,
        content: `${props.translate('common.remove_from_group_confirm')}`,
        action: (
          <Button variant="contained" color="error" onClick={onRemoveSelectedFromGroupConfirm}>
            Ok
          </Button>
        )
      };
    }
    
    setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
  };

  const onRemoveSelectedFromGroupConfirm = async () => {
    const updateData: IUclassReqCreate = {
      groupId: '',
      groupName: '',
      groupTitle: '',
      updatedById: props.user?.id,
      updatedByName: props.user?.username,
    }
    for (const uid of props.selected) {
      const ucFilter = props.uclasses.filter(uc => uc._id === uid);
      if (ucFilter.length > 0) {
        const ui = ucFilter[0];
        const updateUclass = await userclassesApi.updateById(ui._id, updateData);
        await usersApi.updateById((updateUclass.user as IUser).id, {
          group: null,
          project: null,
          projectrole: UserClassEnum.User,
        });
      }
    }
    handleRemoveSelectedFromGroupConfirm(false);
    loadAllUser();
  };

  const handleCreateGroupConfirm = (userId: string | null) => {
    if (userId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, openCreateGroupConfirm: false }));
      loadAllUser();
      loadAllGroup();
      return;
    }
    const filterUClass = props.uclasses.filter(ui => ui._id === userId);
    if (filterUClass.length > 0) {
      props.setSelectedUclass(filterUClass[0]);
      setState((prevState: ILocalState) => ({ ...prevState, openCreateGroupConfirm: true }));
    }
  };

  // set key person
  const handleSetKeyConfirm = (userId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleSetKeyConfirm(null),
    }

    if (userId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterUClass = props.uclasses.filter(ui => ui._id === userId);
    if (filterUClass.length > 0) {
      const selectedUclass = filterUClass[0];
      dataDialog = {
        open: true,
        onClose: () => handleSetKeyConfirm(null),
        title: `${props.translate('common.set_keyperson')}`,
        content: selectedUclass ? (selectedUclass.user as IUser).username : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onSetKeyPerson(selectedUclass)}>
            Ok
          </Button>
        )
      };
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onSetKeyPerson = async (selectedUclass: IUclass) => {
    if (selectedUclass !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateUclass = await userclassesApi.setKeyById(selectedUclass?._id ?? '', deleteData);
      if (updateUclass) {
        loadAllUser();
      }
    }
    handleSetKeyConfirm(null);
  };
  
  // set key person for selected users
  const handleSetUsersKeyConfirm = (openSetUsersKeyConfirm: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleSetUsersKeyConfirm(false),
    }

    if (openSetUsersKeyConfirm) {
      dataDialog = {
        open: true,
        onClose: () => handleSetUsersKeyConfirm(false),
        title: `${props.translate('common.set_keyperson')}`,
        content: `${props.translate('common.remove_from_group_confirm')}`,
        action: (
          <Button variant="contained" color="error" onClick={onSetUsersKeyConfirm}>
            Ok
          </Button>
        )
      };
    }

    setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
  };

  const onSetUsersKeyConfirm = async () => {
    const deleteData: DeleteData = {
      deletedByName: props.user?.username,
      deletedById: props.user?.id,
    }
    for (const uid of props.selected) {
      const ucFilter = props.uclasses.filter(uc => uc._id === uid);
      if (ucFilter.length > 0) {
        const ui = ucFilter[0];
        await userclassesApi.setKeyById(ui._id, deleteData);
      }
    }
    handleSetUsersKeyConfirm(false);
    loadAllUser();
  };

  // block user
  const handleBlockUserConfirm = (userId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleBlockUserConfirm(null),
    }

    if (userId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterUClass = props.uclasses.filter(ui => ui._id === userId);
    if (filterUClass.length > 0) {
      const selectedUclass = filterUClass[0];

      dataDialog = {
        open: true,
        onClose: () => handleBlockUserConfirm(null),
        title: `${props.translate('common.block')} | ${props.translate('common.unblock')}`,
        content: selectedUclass ? (selectedUclass.user as IUser).username : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onBlockUser(selectedUclass)}>
            Ok
          </Button>
        )
      };
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onBlockUser = async (selectedUclass: IUclass) => {
    if (selectedUclass !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }     
      const updateUclass = await userclassesApi.blockById(selectedUclass?._id, deleteData);
      await usersApi.updateById((selectedUclass?.user as IUser)._id, {
        group: null,
        project: null,
        projectrole: UserClassEnum.User,
        customer: null,
        class: updateUclass._id,
      });
      if (updateUclass) {
        loadAllUser();
      }
    }
    handleBlockUserConfirm(null);
  };

  // block selected users
  const handleBlockUsersConfirm = (openBlockUsersConfirm: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleBlockUsersConfirm(false),
    }
    if (openBlockUsersConfirm) {
      dataDialog = {
        open: true,
        onClose: () => handleBlockUsersConfirm(false),
        title: `${props.translate('common.block')} | ${props.translate('common.unblock')}`,
        content: `${props.translate('common.remove_from_group_confirm')}`,
        action: (
          <Button variant="contained" color="error" onClick={onBlockUsers}>
            Ok
          </Button>
        )
      }
    }
    setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
  };

  const onBlockUsers = async () => {
    const deleteData: DeleteData = {
      deletedByName: props.user?.username,
      deletedById: props.user?.id,
    }
    const promises = [];
    for (const uid of props.selected) {
      const ucFilter = props.uclasses.filter(uc => uc._id === uid);
      if (ucFilter.length > 0) {
        const ui = ucFilter[0];
        promises.push(userclassesApi.blockById(ui._id, deleteData));
        promises.push(usersApi.updateById((ui.user as IUser)._id, {
          group: null,
          project: null,
          projectrole: UserClassEnum.User,
          customer: null,
          class: ui._id,
        }));
      }
    }
    await Promise.all(promises);
    handleBlockUsersConfirm(false);
    loadAllUser();
  };

  // Stop user: delete uclass
  const handleStopUserConfirm = (userId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleStopUserConfirm(null),
    }

    if (userId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterUClass = props.uclasses.filter(ui => ui._id === userId);
    if (filterUClass.length > 0) {
      const selectedUclass = filterUClass[0]
      dataDialog = {
        open: true,
        onClose: () => handleStopUserConfirm(null),
        title: `${props.translate('common.stop_coop')}`,
        content: selectedUclass ? (selectedUclass.user as IUser).username : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onStopUser(selectedUclass)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onStopUser = async (selectedUclass: IUclass) => {
    if (selectedUclass !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const updateUclass = await userclassesApi.deleteById(selectedUclass?._id ?? '', deleteData);
      await usersApi.updateById((selectedUclass?.user as IUser)._id, {
        group: null,
        project: null,
        projectrole: UserClassEnum.User,
        customer: null,
        class: null,
      });
      if (updateUclass) {
        loadAllUser();
        if (props.page > 0) {
          if (dataInPage.length < 2) {
            props.setPage(props.page - 1);
          }
        }
      }
    }
    handleStopUserConfirm(null);  
  };

  // stop selected users
  const handleStopUsersConfirm = (openStopUsersConfirm: boolean) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleStopUsersConfirm(false),
    }
    if (openStopUsersConfirm) {
      dataDialog = {
        open: true,
        onClose: () => handleStopUsersConfirm(false),
        title: `${props.translate('common.stop_coop')}`,
        content: `${props.translate('common.remove_from_group_confirm')}`,
        action: (
          <Button variant="contained" color="error" onClick={onStopUsers}>
            Ok
          </Button>
        )
      }
    }
    setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
  };

  const onStopUsers = async () => {
    const promises = [];
    for (const uid of props.selected) {
      const ucFilter = props.uclasses.filter(uc => uc._id === uid);
      if (ucFilter.length > 0) {
        const ui = ucFilter[0];
        const deleteData: DeleteData = {
          deletedByName: props.user?.username,
          deletedById: props.user?.id,
        }
        promises.push(userclassesApi.deleteById(ui._id, deleteData));
        promises.push(usersApi.updateById((ui?.user as IUser)._id, {
          group: null,
          project: null,
          projectrole: UserClassEnum.User,
          customer: null,
          class: null,
        }));
        if (props.page > 0) {
          if (props.selected.length === dataInPage.length) {
            props.setPage(props.page - 1);
          } else if (props.selected.length === dataFiltered.length) {
            props.setPage(0);
          } else if (props.selected.length > dataInPage.length) {
            const newPage = Math.ceil((props.uclasses.length - props.selected.length) / props.rowsPerPage) - 1;
            props.setPage(newPage);
          }
        }
        props.setSelected([]);
      }
    }
    await Promise.all(promises);
    handleStopUsersConfirm(false);
    loadAllUser();
  };

  const applyFilter = ({
    inputData,
    comparator,
    filterName,
    filterGroup,
  }: {
    inputData: IUclass[];
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
      const byUsername = inputData.filter(
        (uclass) => (uclass.user as IUser).username?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
        
      const byFullname = inputData.filter(
        (uclass) => (uclass.user as IUser).fullname?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );

      const byEmail = inputData.filter(
        (uclass) => (uclass.user as IUser).email?.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
      
      inputData = _.union(byUsername, byFullname, byEmail);
    }
    
    if (filterGroup !== 'all') {
      if (filterGroup === 'none') {
        inputData = inputData.filter((uclass) => (
          uclass.groupId === '' || uclass.groupId === null)
        );
      } else {
        inputData = inputData.filter((uclass) => (
          uclass.groupName === filterGroup)
        );
      }
    }

    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: props.uclasses,
    comparator: getComparator(props.order, props.orderBy),
    filterName: state.filterName,
    filterGroup: state.filterGroup,
  });

  const dataInPage = dataFiltered.slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage);

  return {
    loadAllUser,
    handleInvitationsDialog,
    loadAllGroup,
    handleGroupsDialog,
    handleFilter,
    handleAddUserToGroupDialog,
    // setUserToGroup,
    // addUserToGroup,
    handleAddUsersToGroupDialog,
    handleRemoveFromGroupConfirm,
    handleRemoveSelectedFromGroupConfirm,
    onRemoveSelectedFromGroupConfirm,
    handleCreateGroupConfirm,
    handleSetKeyConfirm,
    handleSetUsersKeyConfirm,
    onSetUsersKeyConfirm,
    handleBlockUserConfirm,
    handleBlockUsersConfirm,
    onBlockUsers,
    handleStopUserConfirm,
    dataFiltered,
    applyFilter,
    handleStopUsersConfirm,
    onStopUsers,
  }
};

const UserContainer = () => {
  
  const props = userAttribute();
  const { localState, setLocalState, user } = props;

  const func = userFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.loadAllGroup();
    func.loadAllUser();
  }, [user, props.groups]);

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
      <UserComponent props={props} func={func}/>
    </>
  )
}

export default UserContainer