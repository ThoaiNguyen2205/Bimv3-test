import { useEffect, useState, useCallback } from 'react';
// next
import Head from 'next/head';
// @mui
import { Stack, Button, Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// sections
import {
  SystemVarGridView,
  SystemFilterName,
  NewSystemVarDialog,
  SetImageDialog, 
  SetTextDialog,
} from 'src/sections/@dashboard/bimnextadmin/systems';
// locales
import { useLocales } from 'src/locales';
// apis
import usersApi from 'src/api/usersApi';
import systemsApi from 'src/api/systemsApi';
// type
import { IUser} from 'src/shared/types/user';
import { ISystem, ISystemResGetAll } from 'src/shared/types/system';
// zustand
import useSystem from 'src/redux/systemStore';
import { shallow } from 'zustand/shallow';
// authContext
import { useAuthContext } from 'src/auth/useAuthContext';

// ----------------------------------------------------------------------
SystemVariablesPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type ILocalState = {
  filterName: string, 
  openNewDialog: boolean,
  openImageFilesDialog: boolean,
  openTextDialog: boolean,
  isEdit: boolean,
}

// ----------------------------------------------------------------------

export default function SystemVariablesPage() {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const table = useTable({ defaultRowsPerPage: 10 });

  const {
    allVariables,
    loading,
    setSystemVars,
    setSelectedSystemVar,
    setLoading,
  } = useSystem(
    (state) => ({ 
      allVariables: state.datas,
      loading: state.loading,
      setSystemVars: state.setDatas,
      setSelectedSystemVar: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
    openNewDialog: false,
    openImageFilesDialog: false,
    openTextDialog: false,
    isEdit: false,
  });

  const { themeStretch } = useSettingsContext();

  const loadAllVariables = useCallback(async () => {
    const apiRes: ISystemResGetAll = await systemsApi.getAlls();
    setSystemVars(apiRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAllVariables();
  }, [user]);

  const dataFiltered = applyFilter({
    inputData: allVariables,
    comparator: getComparator(table.order, table.orderBy),
    filterName: localState.filterName,
  });

  const handleOpenNewSystemVar = async () => {
    setSelectedSystemVar(null);
    setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: false, openNewDialog: true }));
  }

  const handleOpenUpdateSystemVar = async (id: string) => {
    const varFilter = allVariables.filter((vi: ISystem) => vi._id === id);
    if (varFilter.length > 0) {
      setSelectedSystemVar(varFilter[0]);
      setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: true, openNewDialog: true }));
    }
  }

  const handleCloseNewSystemVar = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: false, openNewDialog: false }));
  }

  const handleOpenImageFiles = async (id: string) => {
    const varFilter = allVariables.filter((vi: ISystem) => vi._id === id);
    if (varFilter.length > 0) {
      setSelectedSystemVar(varFilter[0]);
      setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: true, openImageFilesDialog: true }));
    }
  }

  const handleCloseImageFiles = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: false, openImageFilesDialog: false }));
  }

  const handleOpenText = async (id: string) => {
    const varFilter = allVariables.filter((vi: ISystem) => vi._id === id);
    if (varFilter.length > 0) {
      setSelectedSystemVar(varFilter[0]);
      setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: true, openTextDialog: true }));
    }
  }

  const handleCloseText = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, isEdit: false, openTextDialog: false }));
  }

  const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.setPage(0);
    setLocalState((prevState: ILocalState) => ({ ...prevState, filterName: event.target.value }));
  };

  
  const handleDeleteItem = async (id: string) => {
    const deleteVar: ISystem = await systemsApi.removeById(id);
    if (deleteVar) {
      loadAllVariables();
    }
    
  };

  const handleBlockItem = async (id: string) => {
    const bloclUser: IUser = await usersApi.blockById(id);
    
    if (bloclUser) {
      loadAllVariables();
    }
  };

  return (
    <>
      <Head>
        <title> {`${translate('superadmin.system_variables')}`} </title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <CustomBreadcrumbs
          heading={`${translate('superadmin.system_variables')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${translate('superadmin.system_variables')}` },
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
                onClick={handleOpenNewSystemVar}
              >
                {`${translate('common.add')}`}
              </Button>
            </Stack>
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
            <SystemFilterName filterName={localState.filterName} onFilterName={handleFilterName} />
            
          </Stack>

        </Stack>

        {loading ?
          <LoadingWindow />
          : 
          <SystemVarGridView
            dataFiltered={dataFiltered}
            updateSystemVar={handleOpenUpdateSystemVar}
            setImage={handleOpenImageFiles}
            setText={handleOpenText}
            onDeleteItem={handleDeleteItem}
          />
        }
        
      </Container>

      <NewSystemVarDialog
        open={localState.openNewDialog}
        isEdit={localState.isEdit}
        onClose={() => {
          handleCloseNewSystemVar();
        }}
      />

      <SetImageDialog
        open={localState.openImageFilesDialog}
        isEdit={localState.isEdit}
        onClose={() => {
          handleCloseImageFiles();
        }}
      />

      <SetTextDialog
        open={localState.openTextDialog}
        isEdit={localState.isEdit}
        onClose={() => {
          handleCloseText();
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
  inputData: ISystem[];
  comparator: (a: any, b: any) => number;
  filterName: string;
}) {  
  if (inputData !== undefined) {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
      inputData = inputData.filter(
        (variable) => variable.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
      );
    }
  }

  return inputData;
}
