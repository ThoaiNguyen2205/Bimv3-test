import React from 'react';
import { useSettingsContext } from '../../settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @mui
import {
  Card,
  Container,
  Stack,
} from '@mui/material';
// components
import ConfirmDialog from '../../confirm-dialog';
import CustomBreadcrumbs from '../../custom-breadcrumbs';
// sections
import {
  FileChangeViewButton,
} from '../../../sections/@dashboard/file';
import { 
  TopHeader,
  TaskTableToolbar,
  TaskListView,
  TaskGridView,
  GroupsInTaskDialog,
  TaskDetailsDrawer,
} from '../../../sections/@dashboard/task';
import NewCollaborationDialog from '../../../sections/@dashboard/task/newtask/NewCollaboration';
// type
import { ITasksAttribute, ITasksFunction } from '../../../containers/dashboard/tasks/tasks.container';
import NewTaskDialog from '../../../sections/@dashboard/task/newtask/NewTaskDialog';
import { TaskCategory } from '../../../shared/enums';

// -------------------------------------------------------------------

type IFilesComponent = {
  props: ITasksAttribute,
  func: ITasksFunction
};

function TasksComponent({props, func}: IFilesComponent) {
  const { themeStretch } = useSettingsContext();
  const isFiltered = props.localState.filterName !== '';
  const isDesktop = useResponsive('up', 'lg');
    
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }} >

        {isDesktop ? 
          <CustomBreadcrumbs
            heading={`${props.localState.pageTitle}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root,
              },
              { name: `${props.localState.pageTitle}` },
            ]}
            action={
              <TopHeader
                handleNewTask={() => func.handleNewTask(props.localState.taskCategory)}
              />
            }
          />
          :
          <TopHeader
            handleNewTask={() => func.handleNewTask(props.localState.taskCategory)}
          />
        }

        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            <TaskTableToolbar
              filterName={props.localState.filterName}
              isFiltered={isFiltered}
              onFilterName={(e) => props.handleFilter('filterName', e)}
              onResetFilter={() => props.handleFilter('reset', null)}
            />
          </Stack>

          <FileChangeViewButton value={props.localState.view} onChange={props.handleChangeView} />
        </Stack>

        <Card sx={{ borderRadius: '5px !important', p: 1 }} >
          {props.localState.view === 'list' ? (
            <TaskListView
              category={props.localState.taskCategory}
              table={props.table}
              tableData={props.tasks}
              dataFiltered={props.dataFiltered}
              isNotFound={props.isNotFound}
              //
              onOpenRow={func.handleOpenRow}
              onEditRow={func.handleEditRow}
              onPermission={func.handleSetPermission}
              onDeleteRow={func.handleDeleteRow}
              //
              detailsId={(props.localState.detailItem !== undefined && props.localState.detailItem !== null) ? props.localState.detailItem._id : ''}
              onDetails={func.handleDetailsDialog}
            />
          ) : (
            <TaskGridView
              category={props.localState.taskCategory}
              table={props.table}
              tableData={props.tasks}
              dataFiltered={props.dataFiltered}
              isNotFound={props.isNotFound}
              //
              onOpenRow={func.handleOpenRow}
              onEditRow={func.handleEditRow}
              onPermission={func.handleSetPermission}
              onDeleteRow={func.handleDeleteRow}
              //
              detailsId={(props.localState.detailItem !== undefined && props.localState.detailItem !== null) ? props.localState.detailItem._id : ''}
              onDetails={func.handleDetailsDialog}
            />
          )}
        </Card>
      </Container>

      {/* Các hộp thoại new task */}
      <NewTaskDialog
        id='request'
        open={props.localState.openNewRequestDialog}
        title={props.localState.isEdit ? `${props.selectedTask?.name}` : `${props.translate('nav.request')}`}
        category={TaskCategory.FileRequestCloud}
        isEdit={props.localState.isEdit}
        onClose={() => func.closeNewDialog()}
      />

      <NewCollaborationDialog
        open={props.localState.openNewCollaborationDialog}
        isEdit={props.localState.isEdit}
        onClose={() => func.closeNewDialog()}
      />

      <NewTaskDialog
        id='point-cloud'
        open={props.localState.openNewPointCloudDialog}
        title={props.localState.isEdit ? `${props.selectedTask?.name}` : `${props.translate('nav.point_cloud')}`}
        category={TaskCategory.PointCloud}
        isEdit={props.localState.isEdit}
        onClose={() => func.closeNewDialog()}
      />

      <NewTaskDialog
        id='schedule-report'
        open={props.localState.openNewScheduleReportDialog}
        title={props.localState.isEdit ? `${props.selectedTask?.name}` : `${props.translate('nav.schedule')}`}
        category={TaskCategory.ScheduleReport}
        isEdit={props.localState.isEdit}
        onClose={() => func.closeNewDialog()}
      />

      <GroupsInTaskDialog
        open={props.localState.openTaskPermissionDialog}
        onClose={() => func.handleSetPermission(null)}
        onLoadData={func.LoadTasks}
      />

      {(props.localState.detailItem !== null && props.localState.detailItem !== undefined) ? 
        <>
          
        </>
        : null
      }

      <TaskDetailsDrawer
        item={props.localState.detailItem}
        open={props.localState.openDetails}
        onClose={func.handleCloseDetailsDialog}
        onOpenRow={() => {
          func.handleCloseDetailsDialog();
          func.handleOpenRow(props.localState.detailItem?._id || '');
        }}
      />

      <ConfirmDialog {...props.localState.dataDialog} />

    </>
  )
}

TasksComponent.propTypes = {}

export default TasksComponent;
