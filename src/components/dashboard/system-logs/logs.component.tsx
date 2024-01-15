import React from 'react';
import { useSettingsContext } from '../../settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @mui
import {
  Card,
  Table,
  TableBody,
  Container,
  TableContainer,
} from '@mui/material';
// components
import Scrollbar from '../../scrollbar';
import CustomBreadcrumbs from '../../custom-breadcrumbs';
// sections
import {
  LogsTableToolbar,
  TopHeader,
  ReportsDialog,
  LogTableRow,
} from 'src/sections/@dashboard/general-settings/system-logs';

import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../table';

import { ILogsAttribute, ILogsFunction } from 'src/containers/dashboard/system-logs/logs.container';
import { ISystemLog } from 'src/shared/types/systemlog';

type ILogComponent = {
  props: ILogsAttribute,
  func: ILogsFunction
};

function LogComponent({props, func}: ILogComponent) {
  const { themeStretch } = useSettingsContext();
  const isFiltered = props.localState.filterName !== '' || props.localState.filterType !== 'all';
  const denseHeight = props.dense ? 52 : 72;

  const isDesktop = useResponsive('up', 'lg');

  const isNotFound =
    (!func.dataFiltered.length && !! props.localState.filterName) ||
    (!func.dataFiltered.length && !! props.localState.filterType);
  
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'}>

        {isDesktop ? 
          <CustomBreadcrumbs
            heading={`${props.translate('logs.log_system')}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root,
              },
              { name: `${props.translate('logs.log_system')}` },
            ]}
            action={
              <TopHeader
                handleInvitationsDialog={() => func.handleReportsDialog(true)}
              />
            }
          />
          :
          <TopHeader
            handleInvitationsDialog={() => func.handleReportsDialog(true)}
          />
        }

        <Card>

          <LogsTableToolbar
            isFiltered={isFiltered}
            filterName={props.localState.filterName}
            filterType={props.localState.filterType}
            optionsType={props.localState.logOptions}
            onFilterName={(e) => func.handleFilter('filterName', e)}
            onFilterType={(e) => func.handleFilter('filterType', e)}
            onResetFilter={() => func.handleFilter('reset', null)}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={props.dense}
              numSelected={props.selected.length}
              rowCount={props.localState.logsList.length}
              onSelectAllRows={(checked: boolean) =>
                props.onSelectAllRows(
                  checked,
                  props.localState.logsList.map((row) => row._id)
                )
              }
              action={ <></> }
            />

            <Scrollbar>
              <Table size={props.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                
              <TableHeadCustom
                order={props.order}
                orderBy={props.orderBy}
                headLabel={props.TABLE_HEAD}
                rowCount={props.localState.logsList.length}
                numSelected={props.selected.length}
                onSort={props.onSort}
                onSelectAllRows={(checked: boolean) =>
                  props.onSelectAllRows(
                    checked,
                    props.localState.logsList.map((row: any) => row._id)
                  )
                }
              />

                <TableBody>
                  {func.dataFiltered
                    .slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage)
                    .map((row: ISystemLog) => (
                      <LogTableRow
                        key={row._id}
                        row={row}
                        selected={props.selected.includes(row._id)}
                        onSelectRow={() => props.onSelectRow(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(props.page, props.rowsPerPage, props.localState.logsList.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={func.dataFiltered.length}
            page={props.page}
            rowsPerPage={props.rowsPerPage}
            onPageChange={props.onChangePage}
            onRowsPerPageChange={props.onChangeRowsPerPage}
            //
            dense={props.dense}
            onChangeDense={props.onChangeDense}
          />
        </Card>
      </Container>

      <ReportsDialog
        open={props.localState.openReportsDialog}
        // logsList={???}
        onClose={() => func.handleReportsDialog(false)}
      />

    </>
  )
}

LogComponent.propTypes = {};

export default LogComponent;
