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
  TopHeader,
  GroupsInTaskDialog,
  TaskInfoDialog,
} from 'src/sections/@dashboard/task';
import DiscussionGridView from 'src/sections/@dashboard/discussion/DiscussionGridView';
import CommentEditor from 'src/sections/@dashboard/discussion/editor/CommentEditor';
// type
import { IDiscussionsAttribute, IDiscussionsFunction } from 'src/containers/dashboard/discussions/discussions.container';
import { LogType, TaskCategory } from 'src/shared/enums';
import DiscussionTableToolbar from 'src/sections/@dashboard/discussion/DiscussionTableToolbar';
import { IFolder } from 'src/shared/types/folder';
import NewDiscussionDialog from 'src/sections/@dashboard/discussion/NewDiscussionDialog';
import TaskFileDialog from 'src/sections/@dashboard/task/TaskFileDialog';

// -------------------------------------------------------------------

type IDiscussionsComponent = {
  props: IDiscussionsAttribute,
  func: IDiscussionsFunction
};

function DiscussionsComponent({props, func}: IDiscussionsComponent) {
  const { themeStretch } = useSettingsContext();
  const isFiltered = props.localState.filterName !== '';
  const isDesktop = useResponsive('up', 'lg');
    
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }} >

        {isDesktop ? 
          <CustomBreadcrumbs
            heading={`${props.translate('nav.discussion')}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root,
              },
              { name: `${props.translate('nav.discussion')}` },
            ]}
            action={
              <TopHeader
                handleNewTask={() => func.handleNewGeneralDiscussionDialog()}
              />
            }
          />
          :
          <TopHeader
            handleNewTask={() => func.handleNewGeneralDiscussionDialog()}
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
            <DiscussionTableToolbar
              filterName={props.localState.filterName}
              isFiltered={isFiltered}
              onFilterName={(e) => props.handleFilter('filterName', e)}
              onResetFilter={() => props.handleFilter('reset', null)}
            />
          </Stack>

        </Stack>

        <Card sx={{ borderRadius: '5px !important', p: 1 }} >
          <DiscussionGridView
            table={props.table}
            tableData={props.discussionTasks}
            dataFiltered={props.dataFiltered}
            isNotFound={props.isNotFound}
            //
            onEditRow={func.handleEditGeneralDiscussion}
            onPermission={func.handleSetPermission}
            onDeleteRow={func.handleDeleteRow}
            //
            replyId={(props.localState.replyItem !== undefined && props.localState.replyItem !== null) ? props.localState.replyItem.mainTask._id : ''}
            onReply={func.handleReplyDialog}
            //
            handleOpenFilesDialog={func.handleOpenFilesDialog}
            handleOpenInfoDialog={func.handleOpenInfoDialog}
          />
        </Card>
      </Container>

      {/* Các hộp thoại new task */}
      
      <NewDiscussionDialog
        open={props.localState.openNewGeneralDiscussionDialog}
        title={props.localState.isEdit ? `${props.selectedTask?.name}` : `${props.translate('nav.discussion')}`}
        category={TaskCategory.GeneralDiscussion}
        isEdit={props.localState.isEdit}
        onClose={() => func.closeNewGeneralDiscussionDialog()}
      />

      <GroupsInTaskDialog
        open={props.localState.openTaskPermissionDialog}
        onClose={() => func.handleSetPermission(null)}
        onLoadData={func.LoadTasks}
      />

      <TaskFileDialog 
        open={props.localState.openTaskFilesDialog}
        onClose={() => func.handleOpenFilesDialog('', false)}
      />

      <TaskInfoDialog
        open={props.localState.openTaskInfoDialog}
        onClose={() => func.handleOpenInfoDialog('', false)}
      />

      <ConfirmDialog {...props.localState.dataDialog} />

      <CommentEditor
        task={props.localState.replyItem ? props.localState.replyItem.mainTask._id : ''}
        item={props.localState.replyItem ? props.localState.replyItem.mainTask._id : ''}
        logType={LogType.Task}
        link={window.location.href}
        title={`${props.localState.replyItem?.mainTask.name}`}
        open={props.localState.openReply}
        onClose={func.handleCloseReplyDialog}
        groupsInFolder={props.localState.groupsInFolder}
        linkFolderId={props.localState.replyItem ? (props.localState.replyItem.mainTask.folder as IFolder)._id : null}
      />

    </>
  )
}

DiscussionsComponent.propTypes = {}

export default DiscussionsComponent;
