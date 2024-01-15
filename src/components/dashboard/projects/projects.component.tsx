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
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from '../../scrollbar';
import ConfirmDialog from '../../confirm-dialog';
import CustomBreadcrumbs from '../../custom-breadcrumbs';
// sections
import {
  CategoriesDialog,
  ProjectTableToolbar,
  NewProjectDialog,
  ProjectTableRow,
  ProjectInfoDialog,
  GroupsInProjectDialog,
  CloneProjectPermissionDialog,
} from 'src/sections/@dashboard/projects';
import { 
  TopHeader,
} from 'src/sections/@dashboard/projects';

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
// type
import { IProjectAttribute, IProjectFunction } from 'src/containers/dashboard/projects/projects.container';
import { IProject } from 'src/shared/types/project';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import WaitingWindow from 'src/sections/utis/WaitingWindow';

// -------------------------------------------------------------------

type IProjectsComponent = {
  props: IProjectAttribute,
  func: IProjectFunction
};

function ProjectsComponent({props, func}: IProjectsComponent) {
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
            heading={`${props.translate('nav.project_manager')}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root,
              },
              { name: `${props.translate('nav.project')}` },
            ]}
            action={
              <TopHeader
                handleCategoriesDialog={() => func.handleCategoriesDialog(true)}
                handleNewProjectDialog={() => func.handleNewProjectDialog()}
                countUclasses={props.countProjects}
              />
            }
          />
          :
          <TopHeader
            handleCategoriesDialog={() => func.handleCategoriesDialog(true)}
            handleNewProjectDialog={() => func.handleNewProjectDialog()}
            countUclasses={props.countProjects}
          />
        }

        <Card>

          <ProjectTableToolbar
            isFiltered={isFiltered}
            filterName={props.localState.filterName}
            filterGroup={props.localState.filterGroup}
            optionsGroup={props.localState.groupOptions}
            onFilterName={(e) => func.handleFilter('filterName', e)}
            onFilterGroup={(e) => func.handleFilter('filterGroup', e)}
            onResetFilter={() => func.handleFilter('reset', null)}
          />

          {props.loading ?
            <LoadingWindow />
            :
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                dense={props.dense}
                numSelected={props.selected.length}
                rowCount={props.projects.length}
                onSelectAllRows={(checked: boolean) =>
                  props.onSelectAllRows(
                    checked,
                    props.projects.map((row) => row._id)
                  )
                }
                action={
                  <>
                    <Tooltip title={`${(props.translate('common.clone_permission'))}`}>
                      <IconButton
                        color="primary"
                        onClick={() => func.handleClonePermissionDialog(true)}
                      >
                        <Iconify icon="mingcute:copy-fill" />
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
                      rowCount={props.projects.length}
                      numSelected={props.selected.length}
                      onSort={props.onSort}
                      onSelectAllRows={(checked: boolean) =>
                        props.onSelectAllRows(
                          checked,
                          props.projects.map((row: any) => row._id)
                        )
                      }
                    />
                    :
                    <TableHeadCustom
                      order={props.order}
                      orderBy={props.orderBy}
                      headLabel={props.SHORT_TABLE_HEAD}
                      rowCount={props.projects.length}
                      numSelected={props.selected.length}
                      onSort={props.onSort}
                      onSelectAllRows={(checked: boolean) =>
                        props.onSelectAllRows(
                          checked,
                          props.projects.map((row: any) => row._id)
                        )
                      }
                    />
                  }

                  <TableBody>
                    {func.dataFiltered
                      .slice(props.page * props.rowsPerPage, props.page * props.rowsPerPage + props.rowsPerPage)
                      .map((row: IProject) => (
                        <ProjectTableRow
                          key={row._id}
                          row={row}
                          selected={props.selected.includes(row._id)}
                          onSelectRow={() => props.onSelectRow(row._id)}
                          onOpenInfo={() => func.handleOpenProjectInfoDialog(row._id)}
                          onEditProject={() => func.handleEditProject(row._id)}
                          onSetPermission={() => func.handleSetPermission(row._id)}
                          onBlockRow={() => func.handleBlockProjectConfirm(row._id)}
                          onDeleteRow={() => func.handleDeleteProjectConfirm(row._id)}
                          setDefaultProject={() => func.setDefaultProject(row._id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(props.page, props.rowsPerPage, props.projects.length)}
                    />

                    <TableNoData isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          }

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

      <NewProjectDialog
        open={props.localState.openNewProjectDialog}
        isEdit={props.localState.isEdit}
        onClose={() => func.handleEditProject(null)}
      />

      <CategoriesDialog
        open={props.localState.openCategoriesDialog}
        onClose={() => func.handleCategoriesDialog(false)}
      />

      <ProjectInfoDialog
        open={props.localState.openProjectInfoDialog}
        onClose={() => func.handleOpenProjectInfoDialog(null)}
        setDefaultProject={() => func.setDefaultProject(props.selectedProject ? props.selectedProject?._id: '')}
      />

      <GroupsInProjectDialog
        open={props.localState.openProjectPermissionDialog}
        onClose={() => func.handleSetPermission(null)}
        onLoadData={() => func.loadAllProject()}
      />

      <CloneProjectPermissionDialog
        open={props.localState.openClonePermissionDialog}
        toProjects={props.selected}
        onClose={() => func.handleClonePermissionDialog(false)}
      />

      <ConfirmDialog {...props.localState.dataDialog} />

      {props.localState.showWaiting ?
        <WaitingWindow title={`${props.translate('common.set_project_default')}`}/>
        : null
      }
      

    </>
  )
}

ProjectsComponent.propTypes = {}

export default ProjectsComponent
