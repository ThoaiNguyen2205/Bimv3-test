import React from 'react';
import { useSettingsContext } from '../../settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// @mui
import { useTheme, styled } from '@mui/material/styles';
// @mui
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  Drawer,
  Grid,
  MenuItem,
  Tooltip,
  Typography,
  Stack,
  AvatarGroup,
} from '@mui/material';
// components
import Iconify from '../../iconify';
import ConfirmDialog from '../../confirm-dialog';
import MenuPopover from '../../../components/menu-popover';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// sections
import {
  UploadForgeDialog,
  SelectFilesDialog,
  ImageListView,
  MarkupListView,
  CompareCadViewable,
  ModelManager,
  CompareModelDialog,
} from 'src/sections/@dashboard/forge-collab';
// type
import { IRequestAttribute, IRequestFunction } from 'src/containers/dashboard/cloud/request.container';
import EmptyContent from '../../empty-content/EmptyContent';
import { MarkupMode, TaskCategory } from 'src/shared/enums';
import { IFolder } from '../../../shared/types/folder';
import { TaskInfoDialog } from '../../../sections/@dashboard/task';
import TaskFileDialog from '../../../sections/@dashboard/task/TaskFileDialog';
import MarkupSettingsDialog from '../../../sections/@dashboard/forge-collab/MarkupSettingsDialog';
import MarkupDiscussionsDrawer from '../../../sections/@dashboard/forge-collab/MarkupDiscussionsDrawer';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import Scrollbar from 'src/components/scrollbar';
import TaskFileCard from 'src/sections/@dashboard/task/TaskFileCard';
import NewRequestDialog from 'src/sections/@dashboard/request/NewRequestDialog';
import Markdown from 'src/components/markdown/Markdown';
import { StyledEditor } from 'src/components/editor/styles';
import RequestDiscussionsDrawer from 'src/sections/@dashboard/request/RequestDiscussionsDrawer';
import NewSubmitDialog from 'src/sections/@dashboard/request/NewSubmitDialog';
import RequestFileDialog from 'src/sections/@dashboard/request/RequestFileDialog';
import { GroupsInFolderDialog } from 'src/sections/@dashboard/file';
import SubmitItem from 'src/sections/@dashboard/request/SubmitItem';
import ApproveSubmitdialog from 'src/sections/@dashboard/request/ApproveSubmitdialog';
// -------------------------------------------------------------------

type IRequestComponent = {
  props: IRequestAttribute,
  func: IRequestFunction
};

function RequestComponent({props, func}: IRequestComponent) {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');

  // const filterObject = props.forgeObjectData.filter((e) => e.forgeObject._id === props.selectedObject?._id);
  
  return (
    <>
      {props.localState.onAccess ? 
        <>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4} >
                <Card sx={{ borderRadius: '5px !important', px: 1, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ButtonGroup
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ 
                        p: 1
                      }}
                    >
                      {(props.currentTask?.isEdit === true || props.currentTask?.isApprove === true || props.selectedFolder?.isUpdate === true) ?
                        <>
                          <Tooltip
                            title={`${props.translate('request.new_request')}`}
                            placement="top"
                          >
                            <Button onClick={() => func.handleNewRequestDialog(true)} variant='contained'>
                              <Iconify icon="codicon:git-pull-request-new-changes" width={20} height={20} />
                            </Button>
                          </Tooltip>
                        </>
                        : null
                      }

                      <Tooltip title={`${props.translate('coordinator.info')}`} placement="top">
                        <Button 
                          onClick={() => func.handleOpenInfoDialog(true)}
                        >
                          <Iconify icon="ph:info-bold" width={20} height={20} />
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </Box>
                  <Divider />
                  {props.localState.initLoading ? 
                    <LoadingWindow />
                    :
                    <Scrollbar sx={{ mt: 1, height: 'calc(100vh - 105px)' }}>
                      {(props.requestsTree.length > 0) ?
                        <TreeView
                          aria-label="doc-categories"
                          defaultExpandIcon={<Iconify icon={'mingcute:layout-top-open-line'} color="#00AB55" width={24} height={24} />}
                          defaultEndIcon={<Iconify icon={'mingcute:layout-top-open-fill'} color="#00AB55" width={24} height={24} />}
                          defaultCollapseIcon={<Iconify icon={'material-symbols:bottom-panel-open-outline'} color="#00AB55" width={24} height={24} />}
                          sx={{ flexGrow: 1, overflowY: 'auto' }}
                          selected={props.selectedRequest ? props.selectedRequest._id : ''}
                          // expanded={props.localState.fLinks.map((e) => e._id)}
                        >
                          { func.renderRequestsTree(props.requestsTree) }
                        </TreeView>
                        :
                        <EmptyContent
                          title={`${props.translate('common.no_data')}`}
                          sx={{
                            '& span.MuiBox-root': { height: 160 },
                          }}
                        />
                      }
                      {(props.selectedRequest !== null) ?
                        <Stack
                          justifyContent="center"
                          sx={{
                            p: 0.5,
                            mt: 2,
                            width: 1,
                            boxShadow: (theme) => theme.customShadows.z4,
                            bgcolor: 'background.default',
                            border: (theme) => `solid 1px ${theme.palette.divider}`,
                            position: 'relative',
                            borderRadius: 1,
                          }}
                        >
                          {(props.selectedRequest.closedAt !== undefined && props.selectedRequest.closedAt !== null) ?
                            <Stack
                              justifyContent="center"
                              sx={{ position: 'absolute', top: 4, right: 4 }}
                            >
                              <Tooltip title={`${props.translate('common.close')}`} placement="top">
                                <Iconify icon="ion:checkmark-done-circle" color='error.main' width={24} height={24} />
                              </Tooltip>
                            </Stack>
                            : null
                          }

                          <ButtonGroup
                            size="small"
                            sx={{ 
                              p: 1
                            }}
                          >
                            {(props.selectedFolder?.isEdit === true || props.selectedFolder?.isApprove === true) ?
                              <>
                                <Tooltip title={`${props.translate('common.permission')}`} placement="top">
                                  <Button 
                                    variant='soft'
                                    onClick={() => func.handleSetPermission(true)}
                                  >
                                    <Iconify icon="icon-park-outline:permissions" width={20} height={20} />
                                  </Button>
                                </Tooltip>
                                <Tooltip title={(props.selectedRequest.closedAt !== null
                                  && props.selectedRequest.closedAt !== undefined) ? 
                                  `${props.translate('common.cancel')} ${props.translate('common.close')}`
                                  : `${props.translate('common.close')}`} placement="top">
                                  <Button 
                                    variant='soft'
                                    color='warning'
                                    onClick={() => func.handleCloseRequest(props.selectedRequest ? props.selectedRequest?._id : null)}
                                  >
                                    <Iconify icon="ci:stop-sign" width={20} height={20} />
                                  </Button>
                                </Tooltip>
                                <Tooltip title={`${props.translate('common.delete')}`} placement="top">
                                  <Button 
                                    variant='soft'
                                    color='error'
                                    onClick={() => func.handleDeleteRequest(props.selectedRequest ? props.selectedRequest?._id : null)}
                                  >
                                    <Iconify icon="ph:trash-bold" width={20} height={20} />
                                  </Button>
                                </Tooltip>
                              </>
                              : null
                            }

                          </ButtonGroup>
                          <Typography variant='body2' sx={{ p: 1 }}>
                            {props.selectedRequest.content}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='primary.main'
                            sx={{ cursor: 'pointer', p: 1 }}
                          >
                            <Box onClick={() => func.jumptoFilePath()}>
                              <Iconify icon="mdi:folder-cog-outline" width={12} height={12} sx={{ mr: 1 }}/>
                              {props.destination}
                            </Box>
                          </Typography>
                          {/* Nhóm trình nộp */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            sx={{ typography: 'caption', color: 'text.disabled' }}
                          >
                            <Typography variant='caption' sx={{ p: 1 }}>
                              <Iconify icon="formkit:submit" width={12} height={12} sx={{ mr: 1 }}/>
                              {`${props.translate('request.submit')}`}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              sx={{ typography: 'caption', color: 'text.disabled' }}
                            >
                              <AvatarGroup
                                max={10}
                                sx={{
                                  '& .MuiAvatarGroup-avatar': {
                                    width: 24,
                                    height: 24,
                                    '&:first-of-type': {
                                      fontSize: 12,
                                    },
                                  },
                                }}
                              >
                                {props.localState.updateGroups &&
                                  props.localState.updateGroups.map((group) => (
                                    <Tooltip key={group._id} title={group.groupname} placement='top'>
                                      <Avatar key={group._id} alt={group.groupname} src={process.env.REACT_APP_APIFILE + 'images/' + group.logo} />
                                    </Tooltip>
                                  ))}
                              </AvatarGroup>
                            </Stack>
                          </Stack>
                          {/* Nhóm thẩm tra */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            sx={{ typography: 'caption', color: 'text.disabled' }}
                          >
                            <Typography variant='caption' sx={{ p: 1 }}>
                              <Iconify icon="mdi:approve" width={12} height={12} sx={{ mr: 1 }}/>
                              {`${props.translate('common.confirm')}`}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              sx={{ typography: 'caption', color: 'text.disabled' }}
                            >
                              <AvatarGroup
                                max={10}
                                sx={{
                                  '& .MuiAvatarGroup-avatar': {
                                    width: 24,
                                    height: 24,
                                    '&:first-of-type': {
                                      fontSize: 12,
                                    },
                                  },
                                }}
                              >
                                {props.localState.confirmGroups &&
                                  props.localState.confirmGroups.map((group) => (
                                    <Tooltip key={group._id} title={group.groupname} placement='top'>
                                      <Avatar key={group._id} alt={group.groupname} src={process.env.REACT_APP_APIFILE + 'images/' + group.logo} />
                                    </Tooltip>
                                  ))}
                              </AvatarGroup>
                            </Stack>
                          </Stack>
                          {/* Nhóm Duyệt */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            // spacing={0.75}
                            sx={{ typography: 'caption', color: 'text.disabled' }}
                          >
                            <Typography variant='caption' sx={{ p: 1 }}>
                              <Iconify icon="carbon:task-approved" width={12} height={12} sx={{ mr: 1 }}/>
                              {`${props.translate('common.approve')}`}
                            </Typography>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              sx={{ typography: 'caption', color: 'text.disabled' }}
                            >
                              <AvatarGroup
                                max={10}
                                sx={{
                                  '& .MuiAvatarGroup-avatar': {
                                    width: 24,
                                    height: 24,
                                    '&:first-of-type': {
                                      fontSize: 12,
                                    },
                                  },
                                }}
                              >
                                {props.localState.approveGroups &&
                                  props.localState.approveGroups.map((group) => (
                                    <Tooltip key={group._id} title={group.groupname} placement='top'>
                                      <Avatar key={group._id} alt={group.groupname} src={process.env.REACT_APP_APIFILE + 'images/' + group.logo} />
                                    </Tooltip>
                                  ))}
                              </AvatarGroup>
                            </Stack>
                          </Stack>
                        </Stack>
                        : null
                      }
                    </Scrollbar>
                  }
                </Card>
              </Grid>
              <Grid item xs={12} md={8} >
                {props.localState.isSubmitting ? 
                  <LoadingWindow />
                  :
                  <Card sx={{ borderRadius: '5px !important', px: 1, pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ButtonGroup
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ 
                          p: 1
                        }}
                      >
                        {((props.selectedFolder?.isUpdate === true) 
                        && (props.selectedRequest?.closedAt === null || props.selectedRequest?.closedAt === undefined)) ?
                          <>
                            <Tooltip title={`${props.translate('request.submit')}`} placement="top">
                              <Button variant='contained' onClick={() => func.handleNewSubmitDialog(true)}>
                                <Iconify icon="formkit:submit" width={20} height={20} />
                              </Button>
                            </Tooltip>
                          </>
                          : null
                        }
                        <Tooltip title={`${props.translate('coordinator.files')}`} placement="top">
                          <Button 
                            onClick={() => func.handleOpenFilesDialog(true)}
                          >
                            <Iconify icon="clarity:file-group-line" width={20} height={20} />
                          </Button>
                        </Tooltip>
                        <Tooltip title={`${props.translate('coordinator.discussion')}`} placement="top">
                          <Button 
                            onClick={() => func.handleDiscussionsDialog(!props.localState.openDiscussions)}
                          >
                            <Iconify icon="octicon:comment-discussion-24" width={20} height={20} />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </Box>
                    <Divider />
                    {props.localState.isSubmitting ? 
                      <LoadingWindow />
                      :
                      <Scrollbar sx={{ mt: 1, height: 'calc(100vh - 105px)' }}>
                        {(props.files.length > 0) ?
                          <Box
                            display="grid"
                            gap={3}
                            sx={{ pb: 1 }}
                          >
                            {props.requestContents && props.requestContents.map((submit) => (
                              <SubmitItem
                                key={submit._id}
                                requestContent={submit}
                                isUpdate={props.selectedFolder?.isUpdate}
                                isConfirm={props.selectedFolder?.isConfirm}
                                isApprove={props.selectedFolder?.isApprove}
                                onEditSubmit={() => func.handleEditSubmitDialog(submit._id)}
                                onConfirm={() => func.handleConfirmSubmit(submit._id)}
                                onApprove={() => func.handleApproveDialog(submit._id)}
                              />
                            ))}
                          </Box>
                          :
                          <Box>
                            <EmptyContent
                              title={`${props.translate('common.no_data')}`}
                              sx={{
                                '& span.MuiBox-root': { height: 160 },
                              }}
                            />
                          </Box>
                        }
                      </Scrollbar>
                    }
                  </Card>
                }
              </Grid>
            </Grid>
          </Box>

          <NewRequestDialog
            open={props.localState.openNewRequestDialog}
            title={`${props.translate('request.new_request')}`}
            loadTaskData={func.loadTaskData}
            onClose={() => func.handleNewRequestDialog(false)}
          />

          <GroupsInFolderDialog
            open={props.localState.openFolderPermissionDialog}
            isFileManager={false}
            onClose={() => func.handleSetPermission(false)}
            onLoadData={() => {}}
          />

          <NewSubmitDialog
            open={props.localState.openNewSubmitDialog}
            isEdit={props.localState.editSubmit}
            onClose={() => {func.handleNewSubmitDialog(false)}}
          />

          <TaskInfoDialog
            open={props.localState.openTaskInfoDialog}
            onClose={() => func.handleOpenInfoDialog(false)}
          />

          <RequestFileDialog 
            open={props.localState.openTaskFilesDialog}
            onClose={() => func.handleOpenFilesDialog(false)}
          />

          <RequestDiscussionsDrawer
            open={props.localState.openDiscussions}
            onClose={() => func.handleDiscussionsDialog(false)}
          />

          <ApproveSubmitdialog
            open={props.localState.openApproveDialog}
            onClose={() => func.handleApproveDialog(null)}
          />

          <ConfirmDialog {...props.localState.dataDialog} />

        </>
        :
        <EmptyContent
          title={`${props.translate('common.no_data')}`}
          sx={{
            '& span.MuiBox-root': { height: 160 },
          }}
        />
      }
    </>
  )
}

RequestComponent.propTypes = {}

export default RequestComponent;
