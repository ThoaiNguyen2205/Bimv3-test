import React, { useState, useEffect, useCallback } from 'react';
// components
import {
  useTable,
  getComparator
} from '../../../components/table';
// locales
import { useLocales } from 'src/locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
import { AuthUserType } from 'src/auth/types';

import { TFunctionDetailedResult } from 'i18next';
import LogComponent from 'src/components/dashboard/system-logs/logs.component';
// enums
import { DenseEnum, LogType } from 'src/shared/enums';
// type
import { ISystemLog, ISystemLogResGetAll } from 'src/shared/types/systemlog';
// apis
import logsApi from 'src/api/logsApi';
// --------------------------------------------------------------------------

export type ILocalState = {
  filterName: string;
  filterType: string;
  openReportsDialog: boolean;
  logOptions: string[];
  logsList: ISystemLog[];
  loading: boolean;
};

export type ILogsAttribute = {
  user: AuthUserType;
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  dense: boolean,
  setDense: (value: boolean) => void,
  page: number,
  order: 'asc' | 'desc',
  orderBy: string,
  rowsPerPage: number,
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
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
  TABLE_HEAD: any[],
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

const logsAttribute = (): ILogsAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
    filterType: '',
    openReportsDialog: false,
    logOptions: [],
    logsList: [],
    loading: false,
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
    setRowsPerPage,
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
    { id: 'logtype', label: `${translate('common.type')}`, align: 'left' },
    { id: 'content', label: `${translate('common.content')}`, align: 'left' },
    { id: 'created', label: `${translate('common.created_at')}`, align: 'left' },
  ];

  return {
    user,
    localState, 
    setLocalState,
    //
    dense,
    setDense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setRowsPerPage,
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
    TABLE_HEAD,
    translate,
  }
};

export type ILogsFunction = {
  loadAllLogs: () => Promise<void>,
  handleReportsDialog: (openReportsDialog: boolean) => void,
  loadLogTypes: () => Promise<void>,
  handleFilter: (filterType: string, event: React.ChangeEvent<HTMLInputElement> | null) => void,
  dataFiltered: ISystemLog[],
  applyFilter: Function,
};

const userFunction = ({
  props, 
  state, 
  setState
}: {props: ILogsAttribute, state: ILocalState, setState: Function}): ILogsFunction => {

  // Load user classes
  const loadAllLogs = useCallback(async () => {
    const params = { customerId: props?.user?.customer._id };
    const apiRes: ISystemLogResGetAll = await logsApi.getLogs(params);
    setState((prevState: ILocalState) => ({ ...prevState, logsList: apiRes.data }));  
  }, [props?.user]);

  // invitations
  const handleReportsDialog = (openReportsDialog: boolean) => {
    setState((prevState: ILocalState) => ({ ...prevState, openReportsDialog }));
  }

  // Groups
  // Load all groups
  const loadLogTypes = useCallback(async () => {
    const logTypes: string[] = [];
    logTypes.push('all');
    for (const value in LogType) {
      logTypes.push(value);
    }
    setState((prevState: ILocalState) => ({ ...prevState, logOptions: logTypes }));
    handleFilter('reset', null);
  }, []);

  const handleFilter = (filterType: string, event: React.ChangeEvent<HTMLInputElement> | null) => {
    var filterData: any = null;
    switch (filterType) {
      case 'filterName':
        filterData = { filterName: event?.target.value };
        break;
      case 'filterType':
        filterData = { filterType: event?.target.value };
        break;
      default:
        filterData = { filterName: '', filterType: 'all' };
        break;
    }
    if (filterData != null) {
      setState((prevState: ILocalState) => ({ ...prevState, ...filterData }));
    }
  };

  const applyFilter = ({
    inputData,
    comparator,
    filterName,
    filterType,
  }: {
    inputData: ISystemLog[];
    comparator: (a: any, b: any) => number;
    filterName: string;
    filterType: string;
  }) => {
  
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    
    inputData = stabilizedThis.map((el) => el[0]);
    inputData = inputData.filter(
      (log) => log.content.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
    
    if (filterType !== 'all') {
      inputData = inputData.filter((uclass) => (
        uclass.type === filterType)
      );
    }

    return inputData;
  }

  const dataFiltered = applyFilter({
    inputData: props.localState.logsList,
    comparator: getComparator(props.order, props.orderBy),
    filterName: state.filterName,
    filterType: state.filterType,
  });

  return {
    loadAllLogs,
    handleReportsDialog,
    loadLogTypes,
    handleFilter,
    dataFiltered,
    applyFilter,
  }
};

const LogContainer = () => {
  
  let props = logsAttribute();
  const { localState, setLocalState, user } = props;

  let func = userFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.loadLogTypes();
    func.loadAllLogs();
  }, [user]);

  useEffect(() => {
    props.setRowsPerPage(20);
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
      <LogComponent props={props} func={func}/>
    </>
  )
}

export default LogContainer;