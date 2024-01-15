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
import Iconify from 'src/components/iconify';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// sections
import {
  NewCustomerDialog,
  CustomerListView,
  CustomerAppsDialog,
  CustomerContractDialog,
  CustomerGridView,
  CustomerFilterName,
} from 'src/sections/@dashboard/bimnextadmin/customers';
import ChangeViewButton from 'src/sections/utis/ChangeViewButton';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import customersApi from 'src/api/customersApi';
// type
import { ICustomer, ICustomerResGetAll } from 'src/shared/types/customer';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';
import { DeleteData } from 'src/shared/types/deleteData';
// enums
import { DataTableEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

CustomersManagerPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type LocalState = {
  view: string,
  filterName: string, 
  openCustomerDialog: boolean,
  openAppDialog: boolean,
  openContractDialog: boolean,
  isEdit: boolean,
}

export default function CustomersManagerPage() {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 10 });

  const {
    customers,
    loading,
    setCustomers,
    countCustomers,
    replaceCustomer,
    removeCustomer,
    setSelectedCustomer,
    setLoading,
  } = useCustomer(
    (state) => ({ 
      customers: state.datas,
      loading: state.loading,
      setCustomers: state.setDatas,
      countCustomers: state.countDatas,
      replaceCustomer: state.replaceData,
      removeCustomer: state.removeData,
      setSelectedCustomer: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<LocalState>({
    view: 'list',
    filterName: '',
    openCustomerDialog: false,
    openAppDialog: false,
    openContractDialog: false,
    isEdit: false,
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

  const loadAllCustomer = useCallback(async () => {
    const apiRes: ICustomerResGetAll = await customersApi.getCustomer(null);
    setCustomers(apiRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllCustomer();
  }, [user]);
  
  const dataFiltered = applyFilter({
    inputData: customers,
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

  const handleOpenNewCustomerDialog = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openCustomerDialog: true }));
  }

  const handleCloseNewCustomerDialog = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openCustomerDialog: false }));
  }

  const handleAddCustomer = async () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: false }));
    setSelectedCustomer(null);
    handleOpenNewCustomerDialog();
  }

  const handleUpdateCustomer = async (id: string) => {
    const selectCus: ICustomer = customers.filter((cus: ICustomer) => cus._id === id)[0];
    setLocalState((prevState: LocalState) => ({ ...prevState, isEdit: true }));
    setSelectedCustomer(selectCus);
    handleOpenNewCustomerDialog();
  }

  const handleDeleteCustomer = async (id: string) => {
    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }
    const deleteCustomer: ICustomer = await customersApi.deleteById(id, deleteData);
    if (deleteCustomer) {
      removeCustomer(id);

      const { page, setPage } = table;
      if (page > 0) {
        if (dataInPage.length < 2) {
          setPage(page - 1);
        }
      }
    }
  };

  const handleBlockCustomer = async (id: string) => {
    const blockCustomer: ICustomer = await customersApi.blockById(id);
    if (blockCustomer) {
      replaceCustomer(blockCustomer);
    }
  };

  const handleCloseApps = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openAppDialog: false }));
  };

  const handleOpenContracts = async (id: string) => {
    const selectCus: ICustomer = customers.filter((cus: ICustomer) => cus._id === id)[0];
    setSelectedCustomer(selectCus);
    setLocalState((prevState: LocalState) => ({ ...prevState, openContractDialog: true }));
  };

  const handleCloseContracts = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openContractDialog: false }));
  };

  const handleOpenApps = async (id: string) => {
    const selectCus: ICustomer = customers.filter((cus: ICustomer) => cus._id === id)[0];
    setSelectedCustomer(selectCus);
    setLocalState((prevState: LocalState) => ({ ...prevState, openAppDialog: true }));
  };

  return (
    <>
      <Head>
        <title> {`${translate('superadmin.customers')}`} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <CustomBreadcrumbs
          heading={`${translate('superadmin.customers')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${translate('superadmin.customers')}` },
          ]}
          action={
            <Stack
              spacing={1}
              direction='column'
              alignItems={{ xs: 'flex-end', md: 'right' }}
              justifyContent="space-between"
              sx={{ mt: 1 }}
            >
              <Button
                variant="contained"
                startIcon={<Iconify icon="ic:round-bookmark-added" />}
                onClick={handleAddCustomer}
              >
                {`${translate('common.add')}`}
              </Button>
              <Typography color='primary' variant='subtitle2'>
                {`${translate('common.total')}: ${countCustomers()} ${translate('common.customer')}`}
              </Typography>
            </Stack>
          }
        />
        
        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mt: 2, mb: 3 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            <CustomerFilterName filterName={localState.filterName} onFilterName={handleFilterName} />
            
          </Stack>
          <ChangeViewButton value={localState.view} onChange={handleChangeView} />
        </Stack>

        {loading ?
          <LoadingWindow />
          : 
          <>
            {localState.view === 'list' ? (
              <CustomerListView
                table={table}
                tableData={customers}
                dataFiltered={dataFiltered}
                showUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onBlockCustomer={handleBlockCustomer}
                openContracts={handleOpenContracts}
                openApps={handleOpenApps}
                isNotFound={isNotFound}
              />
            ) : (
              <CustomerGridView
                table={table}
                data={customers}
                dataFiltered={dataFiltered}
                showUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onBlockCustomer={handleBlockCustomer}
                openContracts={handleOpenContracts}
                openApps={handleOpenApps}
                isNotFound={isNotFound}
              />
            )}
          </>
        }
      </Container>

      <NewCustomerDialog
        open={localState.openCustomerDialog}
        isEdit={localState.isEdit}
        onClose={handleCloseNewCustomerDialog}
      />

      <CustomerAppsDialog
        open={localState.openAppDialog}
        onClose={() => {
          handleCloseApps();
        }}
      />

      <CustomerContractDialog
        open={localState.openContractDialog}
        onClose={() => {
          handleCloseContracts();
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
  inputData: ICustomer[];
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
      (customer) => 
      (
        customer.shortName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        customer.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      )
    );
  }

  return inputData;
}
