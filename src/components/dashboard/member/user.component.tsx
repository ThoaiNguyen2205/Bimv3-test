import React from 'react';
import PropTypes from 'prop-types';
import { useSettingsContext } from '../../../components/settings';

// hooks
import useResponsive from '../../../hooks/useResponsive';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';

// @mui
import {
  Tab,
  Tabs,
  Card,
  Table,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  Stack,
  TableContainer,
  Typography,
} from '@mui/material';

import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';

// sections
import { 
  InvitationsDialog,
  GroupsDialog,
  AddUserToGroupDialog,
  CreateGroupDialog,
  TopHeader,
  UserTableToolbar,
  UserTableRow,
} from 'src/sections/@dashboard/member';

import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';

import { IUserAttribute, IUserFunction } from 'src/containers/dashboard/member/user.container';
import { IUclass } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';

type IUserComponent = {
  props: IUserAttribute,
  func: IUserFunction
};

function UserComponent({props, func}: IUserComponent) {
  const { themeStretch } = useSettingsContext();
  const isFiltered = props.localState.filterName !== '' || props.localState.filterGroup !== 'all';
  const denseHeight = props.dense ? 52 : 72;

  const isDesktop = useResponsive('up', 'lg');

  const isNotFound =
    (!func.dataFiltered.length && !! props.localState.filterName) ||
    (!func.dataFiltered.length && !! props.localState.filterGroup);
  
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }} >

        {isDesktop ? 
          <CustomBreadcrumbs
            heading={`${props.translate('superadmin.users')}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root,
              },
              { name: `${props.translate('superadmin.users')}` },
            ]}
            action={
              <TopHeader
                handleGroupsDialog={() => func.handleGroupsDialog(true)}
                handleInvitationsDialog={() => func.handleInvitationsDialog(true)}
                countUclasses={props.countUclasses}
                contract={props.selectedContract}
              />
            }
          />
          :
          <TopHeader
            handleGroupsDialog={() => func.handleGroupsDialog(true)}
            handleInvitationsDialog={() => func.handleInvitationsDialog(true)}
            countUclasses={props.countUclasses}
            contract={props.selectedContract}
          />
        }

        <Card sx={{ mt: 2 }}>

          <UserTableToolbar
            isFiltered={isFiltered}
            filterName={props.localState.filterName}
            filterGroup={props.localState.filterGroup}
            optionsGroup={props.localState.groupOptions}
            onFilterName={(e) => func.handleFilter('filterName', e)}
            onFilterGroup={(e) => func.handleFilter('filterGroup', e)}
            onResetFilter={() => func.handleFilter('reset', null)}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={props.dense}
              numSelected={props.selected.length}
              rowCount={props.uclasses.length}
              onSelectAllRows={(checked: boolean) =>
                props.onSelectAllRows(
                  checked,
                  props.uclasses.map((row) => row._id)
                )
              }
              action={
                <>
                  <Tooltip title={`${(props.translate('common.add_to_group'))}`}>
                    <IconButton color="primary" onClick={() => func.handleAddUsersToGroupDialog(true)}>
                      <Iconify icon="ic:twotone-group-add" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`${(props.translate('common.set_keyperson'))}`}>
                    <IconButton color="primary" onClick={() => func.handleSetUsersKeyConfirm(true)}>
                      <Iconify icon="fluent:person-key-20-regular" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`${(props.translate('common.remove_from_group'))}`}>
                    <IconButton color="primary" onClick={() => func.handleRemoveSelectedFromGroupConfirm(true)}>
                      <Iconify icon="mingcute:user-remove-2-line" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`${(props.translate('common.block'))}`}>
                    <IconButton color="error" onClick={() => func.handleBlockUsersConfirm(true)}>
                      <Iconify icon="dashicons:remove" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`${(props.translate('common.stop_coop'))}`}>
                    <IconButton color="error" onClick={() => func.handleStopUsersConfirm(true)}>
                      <Iconify icon="clarity:remove-solid" />
                    </IconButton>
                  </Tooltip>
                </>
              }
            />

            <Scrollbar>
              <Table size={props.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                
                {isDesktop ?
                  <TableHeadCustom
                    order={props.order}
                    orderBy={props.orderBy}
                    headLabel={props.TABLE_HEAD}
                    rowCount={props.uclasses.length}
                    numSelected={props.selected.length}
                    onSort={props.onSort}
                    onSelectAllRows={(checked: boolean) =>
                      props.onSelectAllRows(
                        checked,
                        props.uclasses.map((row: any) => row._id)
                      )
                    }
                  />
                  :
                  <TableHeadCustom
                    order={props.order}
                    orderBy={props.orderBy}
                    headLabel={props.SHORT_TABLE_HEAD}
                    rowCount={props.uclasses.length}
                    numSelected={props.selected.length}
                    onSort={props.onSort}
                    onSelectAllRows={(checked: boolean) =>
                      props.onSelectAllRows(
                        checked,
                        props.uclasses.map((row: any) => row._id)
                      )
                    }
                  />
                }

                <TableBody>
                  {func.dataFiltered
                    .slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage)
                    .map((row: IUclass) => (
                      <UserTableRow
                        key={row._id}
                        row={row}
                        selected={props.selected.includes(row._id)}
                        onSelectRow={() => props.onSelectRow(row._id)}
                        onAddToGroup={() => func.handleAddUserToGroupDialog(row._id)}
                        onRemoveGromGroup={() => func.handleRemoveFromGroupConfirm(row._id)}
                        onCreateGroup={() => func.handleCreateGroupConfirm(row._id)}
                        onSetKeyperson={() => func.handleSetKeyConfirm(row._id)}
                        onBlockRow={() => func.handleBlockUserConfirm(row._id)}
                        onDeleteRow={() => func.handleStopUserConfirm(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(props.page, props.rowsPerPage, props.uclasses.length)}
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

      <InvitationsDialog
        open={props.localState.openInvitationsDialog}
        onClose={() => func.handleInvitationsDialog(false)}
        countUclasses={props.countUclasses}
        contract={props.selectedContract}
      />

      <GroupsDialog
        open={props.localState.openGroupsDialog}
        onClose={() => func.handleGroupsDialog(false)}
      />

      <AddUserToGroupDialog
        open={props.localState.openAddUserToGroupDialog}
        title={props.selectedUclass ? (props.selectedUclass?.user as IUser).username : ''}
        users={props.selected}
        loadAllUser={func.loadAllUser}
        onClose={() => func.handleAddUserToGroupDialog(null)}
      />

      {/* <AddUsersToGroupDialog
        open={props.localState.openAddUsersToGroupDialog}
        users={props.selected}
        onClose={() => func.handleAddUsersToGroupDialog(false)}
      /> */}

      <CreateGroupDialog
        open={props.localState.openCreateGroupConfirm}
        uclass={props.selectedUclass}
        onClose={() => func.handleCreateGroupConfirm(null)}
      />

      <ConfirmDialog {...props.localState.dataDialog} />

    </>
  )
}

UserComponent.propTypes = {};

export default UserComponent;
