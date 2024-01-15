import { useEffect, useReducer, useState, useCallback } from 'react';
// next
import Head from 'next/head';
// @mui
import { Stack, Button, Container, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// sections
import {
  UserListView,
  UserGridView,
  UserFilterName,
  UserClassDialog,
} from 'src/sections/@dashboard/bimnextadmin/users';

import ChangeViewButton from 'src/sections/utis/ChangeViewButton';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import usersApi from 'src/api/usersApi';
// type
import { IUser, IUserResGetAll} from 'src/shared/types/user';
// zustand
import useUser from 'src/redux/userStore';
import { shallow } from 'zustand/shallow';
// enums
import { DataTableEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

UsersManagerPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type LocalState = {
  view: string,
  filterName: string, 
  openClassDialog: boolean,
}

// ----------------------------------------------------------------------

export default function UsersManagerPage() {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 10 });

  const {
    users,
    loading,
    selectedUser,
    setUsers,
    countUsers,
    setSelectedUser,
    setLoading,
  } = useUser(
    (state) => ({ 
      users: state.datas,
      loading: state.loading,
      selectedUser: state.selectedData,
      setUsers: state.setDatas,
      countUsers: state.countDatas,
      setSelectedUser: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    view: 'list',
    filterName: '',
    openClassDialog: false,
  });

  useEffect(() => {
    if (user !== null) {
      if (user.dataMode === DataTableEnum.Table) {
        setLocalState((prevState: LocalState) => ({ ...prevState, view: 'list' }));
      } else {
        setLocalState((prevState: LocalState) => ({ ...prevState, view: 'grid' }));
      }
    }
  }, [user]);

  const handleChangeView = (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setLocalState((prevState: LocalState) => ({ ...prevState, view: newView }));
    }
  };

  const { themeStretch } = useSettingsContext();

  const loadAllUser = useCallback(async () => {
    const apiRes: IUserResGetAll = await usersApi.getUser(null);
    setUsers(apiRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllUser();
  }, []);

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName: localState.filterName,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const isNotFound = (!dataFiltered.length && !! localState.filterName);

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.setPage(0);
    setLocalState((prevState: LocalState) => ({ ...prevState, filterName: event.target.value }));
  };

  const handleOpenClass = async (id: string) => {
    const selectUser: IUser = users.filter((cus: IUser) => cus.id === id)[0];
    setSelectedUser(selectUser);
    setLocalState((prevState: LocalState) => ({ ...prevState, openClassDialog: true }));
  };

  const handleCloseClass = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openClassDialog: false }));
  };

  const handleDeleteItem = async (id: string) => {
    const deleteUser: IUser = await usersApi.removeById(id);
    if (deleteUser) {
      loadAllUser();

      const { page, setPage } = table;
      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    }
    
  };

  const handleBlockItem = async (id: string) => {
    const bloclUser: IUser = await usersApi.blockById(id);
    
    if (bloclUser) {
      loadAllUser();
    }
    
  };

  return (
    <>
      <Head>
        <title> {`${translate('superadmin.users')}`} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <CustomBreadcrumbs
          heading={`${translate('superadmin.users')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${translate('superadmin.users')}` },
          ]}
          action={
            <Typography color='primary' variant='subtitle1'>
              {`${translate('common.total')}: ${countUsers()} ${translate('common.user')}`}
            </Typography>
          }
        />

        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            <UserFilterName filterName={localState.filterName} onFilterName={handleFilterName} />
            
          </Stack>
          <ChangeViewButton value={localState.view} onChange={handleChangeView} />
        </Stack>

        {loading ?
          <LoadingWindow />
          : 
          <>
            {localState.view === 'list' ? (
              <UserListView
                table={table}
                tableData={users}
                dataFiltered={dataFiltered}
                openClass={handleOpenClass}
                onBlockUser={handleBlockItem}
                onDeleteRow={handleDeleteItem}
                isNotFound={isNotFound}
              />
            ) : (
              <UserGridView
                table={table}
                data={users}
                dataFiltered={dataFiltered}
                openClass={handleOpenClass}
                onBlockUser={handleBlockItem}
                onDeleteItem={handleDeleteItem}
                isNotFound={isNotFound}
              />
            )}
          </>
        
        }
      </Container>

      <UserClassDialog
        open={localState.openClassDialog}
        onClose={() => {
          handleCloseClass();
        }}
      />

    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: IUser[];
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
    inputData = inputData.filter(
      (file) => file.username.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}
