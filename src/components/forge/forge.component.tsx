import React from 'react';
import { useSettingsContext } from '../settings';
// hooks
import useResponsive from '../../hooks/useResponsive';
// @mui
import { useTheme, styled } from '@mui/material/styles';
// @mui
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Drawer,
  MenuItem,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
// components
import Iconify from '../iconify';
import ConfirmDialog from '../confirm-dialog';
import MenuPopover from '../../components/menu-popover';
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
import { IForgeAttribute, IForgeFunction } from 'src/containers/forge/forge.container';
import EmptyContent from '../empty-content/EmptyContent';
import { MarkupMode, TaskCategory } from 'src/shared/enums';
import { IFolder } from 'src/shared/types/folder';
import { TaskInfoDialog } from 'src/sections/@dashboard/task';
import TaskFileDialog from 'src/sections/@dashboard/task/TaskFileDialog';
import MarkupSettingsDialog from 'src/sections/@dashboard/forge-collab/MarkupSettingsDialog';
import MarkupDiscussionsDrawer from 'src/sections/@dashboard/forge-collab/MarkupDiscussionsDrawer';
// -------------------------------------------------------------------

const HeaderStyle = styled('div')(({ theme }) => ({
  flexShrink: 0,
  minHeight: 50,
  display: 'flex',
  alignItems: 'center',
}));

const SIDEBAR_WIDTH = 320;

// ----------------------------------------------------------------------

type IForgeComponent = {
  props: IForgeAttribute,
  func: IForgeFunction
};

function ForgeComponent({props, func}: IForgeComponent) {
  const { themeStretch } = useSettingsContext();
  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');

  const filterObject = props.forgeObjectData.filter((e) => e.forgeObject._id === props.selectedObject?._id);
  
  return (
    <>
      {props.localState.onAccess ? 
        <>
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {(props.previewUrn === '') ?
              <HeaderStyle sx={{ pl: 1, pr: 1, pt: 0.5, }}>
                <Box sx={{ flexGrow: 1 }}>
                  <ButtonGroup>
                    <Tooltip title={`${props.translate('coordinator.markup')}`} placement="top">
                      <Button variant="soft" size='small' onClick={func.handleToggleLeftBar}>
                        <Iconify icon="ic:round-note-alt" width={20} height={20} />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <ButtonGroup variant="outlined" color="primary" size="small">
                    <Tooltip
                      title={`${props.translate('coordinator.remove_note')}`}
                      placement="top"
                    >
                      <Button onClick={func.exitMarkupView}>
                        <Iconify icon="mdi:clipboard-remove-outline" width={20} height={20} />
                      </Button>
                    </Tooltip>

                    {(props.currentTask?.isUpdate === true || props.currentTask?.isApprove === true) ?
                      <>
                        <Tooltip title={`${props.translate('coordinator.arrow')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.arrow)}}>
                            <Iconify icon="akar-icons:arrow-right" width={20} height={20} />
                          </Button>
                        </Tooltip>
                              
                        <Tooltip title={`${props.translate('coordinator.square')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.rectangle)}}>
                            <Iconify icon="akar-icons:square" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.circle')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.circle)}}>
                            <Iconify icon="akar-icons:circle" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.text')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.text)}}>
                            <Iconify icon="bi:input-cursor-text" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.hand')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.freehand)}}>
                            <Iconify icon="mdi:draw" width={20} height={20} />
                          </Button>
                        </Tooltip>
                              
                        <Tooltip title={`${props.translate('coordinator.polyline')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.polyline)}}>
                            <Iconify icon="gis:polyline-pt" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.polycloud')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.polycloud)}}>
                            <Iconify icon="wpf:cloud" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.boxcloud')}`} placement="top">
                          <Button onClick={() => {func.enterMarkupEditMode(MarkupMode.cloud)}}>
                            <Iconify icon="fluent:square-hint-32-filled" width={20} height={20} />
                          </Button>
                        </Tooltip>

                        <Tooltip title={`${props.translate('coordinator.settings')}`} placement="top">
                          <Button onClick={() => {func.handleOpenMarkupSettingsDialog(true)}}>
                            <Iconify icon="ic:outline-settings-suggest" width={20} height={20} />
                          </Button>
                        </Tooltip>
                      </>
                      : null
                    }
                          
                  </ButtonGroup>
                  {(props.firstSubObject === null) ? 
                    null
                    :
                    <Typography
                      color='primary'
                      variant='subtitle2'
                      sx={{
                        position: 'absolute',
                        top: '7px',
                        left: '60px',
                        zIndex: 99,
                        pt: 1,
                      }}
                    >
                      <i>{`${props.firstObject?.version}.${props.firstObject?.subVersion} - ${props.firstSubObject?.version}.${props.firstSubObject?.subVersion}`}</i>
                    </Typography>
                  }

                  <ButtonGroup variant="outlined" color="primary" sx={{ ml: 3}}  size="small">
                    {(props.currentTask?.category === TaskCategory.ModelCollaboration) ? 
                      <>
                        {/* <Tooltip title={`${props.translate('coordinator.selection')}`} placement="top">
                          <Button>
                            <Iconify icon="clarity:objects-line" width={20} height={20} />
                          </Button>
                        </Tooltip> */}
                        <Tooltip title={`${props.translate('coordinator.ghosting')}`} placement="top">
                          <Button onClick={func.handleSetGhosting}>
                            <Iconify icon="ph:selection-background-duotone" width={20} height={20} />
                          </Button>
                        </Tooltip>
                      </>
                      : null
                    }
                    <Tooltip title={`${props.translate('coordinator.files')}`} placement="top">
                      <Button onClick={() => func.handleOpenFilesDialog(true)}>
                        <Iconify icon="clarity:file-group-line" width={20} height={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip title={`${props.translate('coordinator.discussion')}`} placement="top">
                      <Button onClick={() => func.handleDiscussionsDialog(!props.localState.openDiscussions)}>
                        <Iconify icon="octicon:comment-discussion-24" width={20} height={20} />
                      </Button>
                    </Tooltip>
                    <Tooltip title={`${props.translate('coordinator.info')}`} placement="top">
                      <Button onClick={() => func.handleOpenInfoDialog(true)}>
                        <Avatar alt={props.currentTask?.category} src={process.env.REACT_APP_APIFILE + 'images/' + props.currentTask?.attach} sx={{ width: 28, height: 28 }}/>
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                  
                  {(props.currentTask?.category === TaskCategory.ModelCollaboration) ?
                    <ButtonGroup variant="outlined" color="primary" sx={{ ml: 3 }}  size="small">
                      <Tooltip title={`${props.translate('coordinator.history')}`} placement="top">
                        <Button onClick={func.handleOpenCompareHistory}>
                          <Iconify icon="fluent:split-vertical-24-regular" width={20} height={20} />
                        </Button>
                      </Tooltip>
                      <MenuPopover
                        open={props.localState.openCompareHistory}
                        onClose={func.handleCloseCompareHistory}
                        arrow="top-center"
                        sx={{ width: 240 }}
                      >
                        <MenuItem
                          key='exit-compare-model'
                          // value={option._id}
                          onClick={() => {func.handleOpenCompareDialog(true); func.handleCloseCompareHistory();}}
                          sx={{
                            mx: 1,
                            borderRadius: 0.75,
                            typography: 'body2',
                            textTransform: 'capitalize',
                          }}
                        >
                          <Stack direction="row" alignItems="center">
                            <Iconify icon="material-symbols-light:compare-rounded" width={20} height={20} />
                            {`${props.translate('coordinator.compare_model')}`}
                          </Stack>
                        </MenuItem>
                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <MenuItem
                          key='exit-compare-dwg'
                          // value={option._id}
                          onClick={() => func.handleCompare('')}
                          sx={{
                            mx: 1,
                            borderRadius: 0.75,
                            typography: 'body2',
                            textTransform: 'capitalize',
                          }}
                        >
                          <Stack direction="row" alignItems="center">
                            <Iconify icon="system-uicons:exit-left" width={20} height={20} />
                            {`${props.translate('coordinator.exit')}`}
                          </Stack>
                        </MenuItem>
                      </MenuPopover>
                    </ButtonGroup>
                    :
                    <>
                      {(filterObject.length > 0) ?
                        <>
                          {(filterObject[0].history.length > 1) ?
                            <ButtonGroup variant="outlined" color="primary" sx={{ ml: 3}}  size="small">
                              <Tooltip title={`${props.translate('coordinator.history')}`} placement="top">
                                <Button onClick={func.handleOpenCompareHistory}>
                                  <Iconify icon="fluent:split-vertical-24-regular" width={20} height={20} />
                                </Button>
                              </Tooltip>
                              <MenuPopover
                                open={props.localState.openCompareHistory}
                                onClose={func.handleCloseCompareHistory}
                                arrow="top-center"
                                sx={{ width: 200 }}
                              >
                                {filterObject && filterObject[0].history.map((option) => (
                                  <MenuItem
                                    key={option._id}
                                    // id={option._id}
                                    // value={option._id}
                                    onClick={() => func.handleCompare(option._id)}
                                    sx={{
                                      mx: 1,
                                      borderRadius: 0.75,
                                      typography: 'body2',
                                      textTransform: 'capitalize',
                                      color: 'secondary.light',
                                      ...((props.firstSubObject?._id === option._id) && {
                                        color: 'primary.main',
                                      }),
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center">
                                      <Iconify icon="solar:history-2-bold" width={20} height={20} />
                                      {`${option.version}.${option.subVersion}`}
                                    </Stack>
                                  </MenuItem>
                                ))}
                                <Divider sx={{ borderStyle: 'dashed' }} />
                                <MenuItem
                                  key='exit-compare'
                                  // value={option._id}
                                  onClick={() => func.handleCompare('')}
                                  sx={{
                                    mx: 1,
                                    borderRadius: 0.75,
                                    typography: 'body2',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  <Stack direction="row" alignItems="center">
                                    <Iconify icon="system-uicons:exit-left" width={20} height={20} />
                                    {`${props.translate('coordinator.exit')}`}
                                  </Stack>
                                </MenuItem>               
                              </MenuPopover>
                            </ButtonGroup>
                            : null
                          }
                        </>
                        : null
                      }
                    </>
                  }

                  {(props.currentTask?.isEdit || props.currentTask?.isUpdate) ? 
                    <ButtonGroup variant="outlined" color="primary" sx={{ ml: 3 }}  size="small">
                      <Tooltip title={`${props.translate('common.admin')}`} placement="top">
                        <Button onClick={func.handleOpenAdminMenu}>
                          <Iconify icon="ri:more-fill" width={20} height={20} />
                        </Button>
                      </Tooltip>
                      <MenuPopover
                        open={props.localState.openAdminMenu}
                        onClose={func.handleCloseAdminMenu}
                        arrow="top-center"
                        sx={{ width: 200 }}
                      >
                        <MenuItem
                          onClick={() => {
                            func.handleUploadFiles(true);
                            func.handleCloseAdminMenu();
                          }}
                        >
                          <Iconify icon={'icon-park-solid:upload-web'} />
                          {`${props.translate('common.upload')}`}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            func.handleSelectFiles(true);
                            func.handleCloseAdminMenu();
                          }}
                        >
                          <Iconify icon={'lucide:cloud-cog'} />
                          {`${props.translate('coordinator.transfer_from_cloud')}`}
                        </MenuItem>
                        {props.currentTask.category === TaskCategory.ModelCollaboration ?
                          <MenuItem
                            onClick={() => {
                              func.handleModelManager(true);
                              func.handleCloseAdminMenu();
                            }}
                          >
                            <Iconify icon='carbon:model-alt' />
                            {`${props.translate('coordinator.model_manager')}`}
                          </MenuItem>
                          : null
                        }
                        
                      </MenuPopover>
                    </ButtonGroup>
                    : null
                  }
                </Box>
                <Box>
                  <ButtonGroup>
                    <Tooltip title={`${props.translate('coordinator.content')}`} placement="top">
                      <Button variant="soft" size='small' onClick={func.handleToggleRightBar} >
                        <Iconify icon="ep:list" width={20} height={20} />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
              </HeaderStyle>
              : null
            }

            <Divider />

            <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
              <Box id='leftpanel' sx={{ position: 'relative' }}>
                <Drawer
                  anchor="left"
                  open={props.localState.openLeftBar}
                  ModalProps={{ keepMounted: isDesktop ? true : false }}
                  variant={isDesktop ? "persistent" : "temporary" }
                  onClose={func.handleCloseLeftBar}
                  sx={isDesktop ? {
                      height: 1,
                      width: SIDEBAR_WIDTH,
                      transition: theme.transitions.create('width'),
                      backgroundColor: theme.palette.background.neutral,
                      ...(!props.localState.openLeftBar && { width: '0px' }),
                      '& .MuiDrawer-paper': {
                        position: 'static',
                        width: SIDEBAR_WIDTH,
                      },
                    } : {
                      '& .MuiDrawer-paper': {
                      width: SIDEBAR_WIDTH,
                      },
                      backgroundColor: theme.palette.background.paper,
                      
                    }
                  }
                >
                  <Box sx={{
                    padding: '10px',
                    height: '100%',
                  }}>
                    <MarkupListView />
                  </Box>
                </Drawer>
              </Box>
              
              <Box id='center' sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
                <Box id="forgeViewer" />
              </Box>
              {props.isSplit ? 
                <Box id='center' sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
                  <Box id="subViewer" />
                </Box>
                : null
              }

              <Box id='rightpanel' sx={{ position: 'relative' }}>
                <Drawer
                  anchor="right"
                  open={props.localState.openRightBar}
                  ModalProps={{ keepMounted: isDesktop ? true : false }}
                  variant={isDesktop ? "persistent" : "temporary" }
                  onClose={func.handleCloseRightBar}
                  sx={isDesktop ? {
                      height: '100%',
                      width: SIDEBAR_WIDTH,
                      transition: theme.transitions.create('width'),
                      ...(!props.localState.openRightBar && { width: '0px' }),
                      '& .MuiDrawer-paper': {
                      position: 'static',
                      width: SIDEBAR_WIDTH,
                      },
                    } : {
                      '& .MuiDrawer-paper': {
                      width: SIDEBAR_WIDTH,
                      },
                      backgroundColor: theme.palette.background.paper,
                    }
                    
                  }
                >
                  <Box sx={{
                    padding: '10px',
                    height: '100%',
                  }}>
                    <ImageListView
                      category={props.currentTask?.category as TaskCategory}
                      linkFolderId={(props.currentTask?.folder as IFolder)?._id}
                      imageObjects={props.forgeObjectData}
                      onItemClick={func.handleObjectClick}
                      handleDeleteForgeObject={func.handleDeleteForgeObject}
                      onModelClick={func.handleHistoryModelClick}
                    />
                  </Box>
                </Drawer>
              </Box>
            </Box>
          </Box>

          <UploadForgeDialog
            open={props.localState.openUploadFilesDialog}
            onClose={() => func.handleUploadFiles(false)}
          />

          <SelectFilesDialog
            linkFolderId={(props.currentTask?.folder as IFolder)?._id}
            category={props.currentTask?.category as TaskCategory}
            open={props.localState.openSelectFilesDialog}
            onClose={() => func.handleSelectFiles(false)}
          />

          <ModelManager
            open={props.localState.openModelManagerDialog}
            onClose={() => func.handleModelManager(false)}
          />

          <TaskInfoDialog
            open={props.localState.openTaskInfoDialog}
            onClose={() => func.handleOpenInfoDialog(false)}
          />

          <TaskFileDialog 
            open={props.localState.openTaskFilesDialog}
            onClose={() => func.handleOpenFilesDialog(false)}
          />

          <MarkupSettingsDialog 
            open={props.localState.openMarkupSettingsDialog}
            setDefaultMarkupStyle={func.setDefaultMarkupStyle}
            onClose={() => func.handleOpenMarkupSettingsDialog(false)}
          />
          
          <CompareCadViewable 
            open={props.localState.openSelectViewables}
            viewables01={props.localState.viewableList01}
            viewables02={props.localState.viewableList02}
            initForgeViewerCad={func.initForgeViewerCad}
            onClose={func.handleCloseCompareCadSheet}
            onCancel={() => func.handleCompare('')}
          />

          {(props.currentTask?.category === TaskCategory.ModelCollaboration) ?
            <CompareModelDialog 
              open={props.localState.openModelCompare}
              onClose={() => func.handleOpenCompareDialog(false)}
              onCancel={() => func.handleCompare('')}
            />
            : null
          }

          <MarkupDiscussionsDrawer
            currentTask={props.currentTask}
            itemType={props.currentTask?.category}
            open={props.localState.openDiscussions}
            onClose={() => func.handleDiscussionsDialog(false)}
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

ForgeComponent.propTypes = {}

export default ForgeComponent;
