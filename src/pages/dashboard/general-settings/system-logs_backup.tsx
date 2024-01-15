import { useEffect, useState, useCallback } from 'react';
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
import {
  LogFilter,
} from 'src/sections/@dashboard/general-settings/system-logs';
import ChangeViewButton from 'src/sections/utis/ChangeViewButton';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import customersApi from 'src/api/customersApi';
import logsApi from 'src/api/logsApi';
// type
import { ICustomer, ICustomerResGetAll } from 'src/shared/types/customer';
import { ISystemLog, ISystemLogResGetAll } from 'src/shared/types/systemlog';
// zustand store
import useCustomer from 'src/redux/customerStore';
import { shallow } from 'zustand/shallow';
import { DeleteData } from 'src/shared/types/deleteData';

// ----------------------------------------------------------------------

LogsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type LocalState = {
  filterName: string,
  loading: boolean,
  logs: ISystemLog[],
}

export default function LogsPage() {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const table = useTable({ defaultRowsPerPage: 10 });


  const [localState, setLocalState] = useState<LocalState>({
    filterName: '',
    loading: true,
    logs: [],
  });

  const { themeStretch } = useSettingsContext();

  const loadAllLogs = useCallback(async () => {
    const param = {
      customerId: user?.customer._id,
    }
    const apiRes: ISystemLogResGetAll = await logsApi.getLogs(param);
    console.log(apiRes.data);
    
    setLocalState((prevState: LocalState) => ({ ...prevState, logs: apiRes.data, loading: false }));
  }, []);

  useEffect(() => {
    loadAllLogs();
  }, [user]);
  
  const dataFiltered = applyFilter({
    inputData: localState.logs,
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

  return (
    <>
      <Head>
        <title> {`${translate('nav.logs')}`} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <CustomBreadcrumbs
          heading={`${translate('logs.log_system')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${translate('logs.log_system')}` },
          ]}
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
            <LogFilter filterName={localState.filterName} onFilterName={handleFilterName} />
            
          </Stack>
        </Stack>

        {/* {localState.loading ?
          <LoadingWindow />
          : 
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
        } */}

      </Container>

    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: ISystemLog[];
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
      (logs) => 
      (
        logs.content.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      )
    );
  }

  return inputData;
}
