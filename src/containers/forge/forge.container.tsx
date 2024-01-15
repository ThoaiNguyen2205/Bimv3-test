// @ts-ignore
import * as Autodesk from "@types/forge-viewer";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
// components
import { useSnackbar } from 'src/components/snackbar';
// locales
import { useLocales } from 'src/locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
// @mui
import {
  Button,
} from '@mui/material';
// zustand
import useTask from "src/redux/taskStore";
import useFolder from 'src/redux/foldersStore';
import useForgeViewState from "src/redux/forgeViewStore";
import { shallow } from 'zustand/shallow';
// utils
import _ from 'lodash';
import { TFunctionDetailedResult } from 'i18next';
// enums
import { TaskCategory, MarkupMode } from 'src/shared/enums';
// type
import { AuthUserType } from 'src/auth/types';
import { ConfirmDialogProps } from 'src/components/confirm-dialog/types';
import { DeleteData } from 'src/shared/types/deleteData';
import { IForgeToken } from "src/shared/types/forgeToken";
import { IMainTask } from "src/shared/types/mainTask";
import { IForgeObject, ICollaborationTaskData, IForgeObjectData, IMarkupSettings } from "src/shared/types/forgeObject";
import { IFolder} from 'src/shared/types/folder';
// apis
import foldersApi from 'src/api/foldersApi';
import forgesApi from "src/api/forgesApi";
import forgeObjectsApi from "src/api/forgeObjectsApi";
// components
import ForgeComponent from 'src/components/forge/forge.component';
import { PATH_DASHBOARD } from "src/routes/paths";

// --------------------------------------------------------------------------

export type ILocalState = {
  onAccess: boolean, // quy định user được phép truy cập hay không
  openUploadFilesDialog: boolean; // điều khiển hộp thoại upload
  openSelectFilesDialog: boolean; // điều khiển hộp thoại chọn file từ lưu trữ
  openModelManagerDialog: boolean; // điều khiển hộp thoại quản lý dữ liệu mô hình
  //
  openAdminMenu: HTMLElement | null;
  openCompareHistory: HTMLElement | null;
  //
  openLeftBar: boolean;
  openRightBar: boolean;
  //
  filterName: string;
  tableData: IForgeObject[];
  //
  openTaskInfoDialog: boolean;
  openTaskFilesDialog: boolean;
  openMarkupSettingsDialog: boolean;
  //
  openSelectViewables: boolean;
  viewableList01: any[];
  viewableList02: any[];
  openModelCompare: boolean;
  //
  dataDialog: ConfirmDialogProps;
  openDiscussions: boolean;
};

export type IForgeAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  isSplit: boolean;
  setIsSplit: (value: boolean) => void;
  forgeLoading: boolean;
  setForgeLoading: (value: boolean) => void;
  subLoading: boolean;
  setSubLoading: (value: boolean) => void;
  previewUrn: string;
  setPreviewUrn: (urn: string) => void;
  currentTask: IMainTask | null;
  setCurrentTask: (task: IMainTask | null) => void;
  forgeObjectData: IForgeObjectData[];
  setForgeObjectData: (data: IForgeObjectData[]) => void;
  firstObject: IForgeObject | null;
  setFirstObject: (obj: IForgeObject | null) => void;
  firstSubObject: IForgeObject | null;
  setFirstSubObject: (obj: IForgeObject | null) => void;
  selectedObject: IForgeObject | null;
  setSelectedObject: (obj: IForgeObject | null) => void;
  forgeViewer: any | null;
  setForgeViewer: (obj: any) => void;
  subViewer: any | null;
  setSubViewer: (obj: any) => void;
  markupSettings: IMarkupSettings | null;
  setMarkupSettings: (obj: IMarkupSettings | null) => void;
  filterProperty: string;
  setFilterProperty: (prop: string) => void;
  filterKey: string;
  setFilterKey: (value: string) => void;
  is2D: boolean;
  setIs2d: (value: boolean) => void;
  sheetA: any | null;
  setSheetA: (obj: any) => void;
  sheetB: any | null;
  setSheetB: (obj: any) => void;
  viewerGhosting: boolean;
  setViewerGhosting: (value: boolean) => void;
  //
  setSelectedTask: (task: IMainTask | null) => void;
  //
  setSelectedFolder: (folder: IFolder | null) => void,
  //
  user: AuthUserType,
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IForgeFunction = {
  loadTaskData: () => Promise<void>,
  initForgeViewerImage: () => Promise<void>,
  initForgeViewerGlb: () => Promise<void>
  initForgeViewerSubImage: (imageObject: IForgeObject | null) => Promise<void>,
  initForgeViewer2D: () => void,
  initForgeViewerCad: (isComapre: boolean, sheet01: any | null, sheet02: any | null) => void,
  handleCloseCompareCadSheet: () => void,
  handleOpenCompareDialog: (open: boolean) => void,
  initForgeViewer: () => void,
  //
  handleOpenAdminMenu: (event: React.MouseEvent<HTMLElement>) => void,
  handleCloseAdminMenu: () => void,
  handleOpenCompareHistory: (event: React.MouseEvent<HTMLElement>) => void,
  handleCloseCompareHistory: () => void,
  handleOpenLeftBar: () => void,
  handleCloseLeftBar: () => void,
  handleToggleLeftBar: () => void,
  handleOpenRightBar: () => void,
  handleCloseRightBar: () => void,
  handleToggleRightBar: () => void,
  //
  handleObjectClick: (objId: string) => void,
  handleHistoryModelClick: (objId: string) => void,
  handleDeleteForgeObject: (objId: string | null) => void,
  //
  handleUploadFiles: (open: boolean) => void,
  handleSelectFiles: (open: boolean) => void,
  handleModelManager: (open: boolean) => void,
  // Markups
  enterMarkupEditMode: (mode: MarkupMode) => void,
  exitMarkupView: () => void,
  //
  handleSetGhosting: () => void,
  handleOpenInfoDialog: (open: boolean) => void,
  handleOpenFilesDialog: (open: boolean) => void,
  handleOpenMarkupSettingsDialog: (open: boolean) => void,
  setDefaultMarkupStyle: (isRestore: boolean) => void,
  //
  handleDiscussionsDialog: (open: boolean) => void,
  //
  handleCompare: (id: string) => void,
};

const forgeAttribute = (): IForgeAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    onAccess: false,
    openUploadFilesDialog: false,
    openSelectFilesDialog: false,
    openModelManagerDialog: false,
    //
    openAdminMenu: null,
    openCompareHistory: null,
    //
    openLeftBar: false,
    openRightBar: false,
    //
    filterName: '',
    tableData: [],
    //
    openTaskInfoDialog: false,
    openTaskFilesDialog: false,
    openMarkupSettingsDialog: false,
    //
    openSelectViewables: false,
    viewableList01: [],
    viewableList02: [],
    openModelCompare: false,
    //
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    openDiscussions: false,
  });

  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    previewUrn,
    setPreviewUrn,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
    markupSettings,
    setMarkupSettings,
    filterProperty,
    setFilterProperty,
    filterKey,
    setFilterKey,
    is2D,
    setIs2d,
    sheetA,
    setSheetA,
    sheetB,
    setSheetB,
    viewerGhosting,
    setViewerGhosting,
  } = useForgeViewState(
    (state) => ({
      isSplit: state.isSplit,
      setIsSplit: state.setIsSplit,
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      subLoading: state.subLoading,
      setSubLoading: state.setSubLoading,
      previewUrn: state.previewUrn,
      setPreviewUrn: state.setPreviewUrn,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      firstSubObject: state.firstSubObject,
      setFirstSubObject: state.setFirstSubObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
      forgeViewer: state.forgeViewer,
      setForgeViewer: state.setForgeViewer,
      subViewer: state.subViewer,
      setSubViewer: state.setSubViewer,
      markupSettings: state.markupSettings,
      setMarkupSettings: state.setMarkupSettings,
      filterProperty: state.filterProperty,
      setFilterProperty: state.setFilterProperty,
      filterKey: state.filterKey,
      setFilterKey: state.setFilterKey,
      is2D: state.is2D,
      setIs2d: state.setIs2d,
      sheetA: state.sheetA,
      setSheetA: state.setSheetA,
      sheetB: state.sheetB,
      setSheetB: state.setSheetB,
      viewerGhosting: state.viewerGhosting,
      setViewerGhosting: state.setViewerGhosting,
    }),
    shallow
  );

  const {
    setSelectedTask,
  } = useTask(
    (state) => ({ 
      setSelectedTask: state.setSelectedData,
    }),
    shallow
  );

  const {
    setSelectedFolder,
  } = useFolder(
    (state) => ({ 
      setSelectedFolder: state.setSelectedData,
    }),
    shallow
  );
  
  return {
    localState, 
    setLocalState,
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    previewUrn,
    setPreviewUrn,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
    markupSettings,
    setMarkupSettings,
    filterProperty,
    setFilterProperty,
    filterKey,
    setFilterKey,
    is2D,
    setIs2d,
    sheetA,
    setSheetA,
    sheetB,
    setSheetB,
    viewerGhosting,
    setViewerGhosting,
    //
    setSelectedTask,
    //
    setSelectedFolder,
    //
    user,
    translate,
  }
};

const forgeFunction = ({
  props, 
  state, 
  setState
}: {props: IForgeAttribute, state: ILocalState, setState: Function}): IForgeFunction => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Tải dữ liệu thông tin task hiện hành

  const loadTaskData = useCallback(async () => {
    if (props.previewUrn === '') {
      if (props.user === null) return;
      if (props.user.group === null) {
        enqueueSnackbar(`${props.translate('helps.no_group_alert')}`, {variant: "info"});
        router.push(PATH_DASHBOARD.member.users);
        return;
      }
      let urlParams = new URLSearchParams(window.location.search);
      let taskParam = urlParams.get('task');
      if (taskParam) {
        const taskData: ICollaborationTaskData = await forgeObjectsApi.getCollaborationTaskData(taskParam, props.user.id, props.user.class.uclass, props.user.customer._id);
        setState((prevState: ILocalState) => ({ ...prevState, onAccess: taskData.task.isView }));
        if (taskData.task.isView) {
          props.setCurrentTask(taskData.task);
          props.setSelectedTask(taskData.task);

          const forgeObjectData = taskData.forgeObjectData;
          if (props.currentTask?.category === TaskCategory.ModelCollaboration) {
            forgeObjectData.sort((a, b) => a.forgeObject.order - b.forgeObject.order);
          }
          props.setForgeObjectData(forgeObjectData);
          
          const checkModels = forgeObjectData.filter((e) => e.forgeObject.checked === true);
          if (checkModels.length > 0) {
            props.setSelectedObject(checkModels[0].forgeObject);
            props.setFirstObject(checkModels[0].forgeObject);
          }
        }
      }
    } else {
      setState((prevState: ILocalState) => ({ ...prevState, onAccess: true }));
    }
  }, []);

  // handle mở hộp thoại upload file
  const handleUploadFiles = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openUploadFilesDialog: open,
    }));
  }

  // handle mở hộp thoại chọn file từ lưu trữ
  const handleSelectFiles = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openSelectFilesDialog: open,
    }));
  }
  
  // handle mở hộp thoại chọn file từ lưu trữ
  const handleModelManager = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openModelManagerDialog: open,
    }));
  }

  // handle thiết lập ghosting tắt/mở
  const handleSetGhosting = () => {
    if (props.forgeViewer !== null) {
      props.forgeViewer.setGhosting(!props.viewerGhosting);
      props.setViewerGhosting(!props.viewerGhosting);
    }
  }

  // handle mở hộp thoại thông tin công việc
  const handleOpenInfoDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskInfoDialog: open,
    }));
  }

  const handleOpenFilesDialog = async (open: boolean) => {
    if (open === true) {
      const folderRes = await foldersApi.getReadByIdWithUser((props.currentTask?.folder as IFolder)._id, props.user?.id);
      props.setSelectedFolder(folderRes);
    } else {
      props.setSelectedFolder(null);
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskFilesDialog: open,
    }));
  }

  const setDefaultMarkupStyle = (isRestore: boolean) => {
    if (props.forgeViewer === null) return;
    const markExt = props.forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
    if (!markExt.editMode) {
      markExt.enterEditMode();
      markExt.leaveEditMode();
      markExt.enterEditMode();
      // @ts-ignore
      var markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(markExt);
      markExt.changeEditMode(markupMode);
      const defStyle = markExt.defaultStyle;

      if (props.markupSettings === null) {
        props.setMarkupSettings({
          strokeWidth: defStyle['stroke-width'],
          strokeColor: defStyle['stroke-color'],
          strokeOpacity: defStyle['stroke-opacity'],
          fillColor: defStyle['fill-color'],
          fillOpacity: defStyle['fill-opacity'],
          fontSize: defStyle['font-size'],
        });
      }
      if (isRestore) {
        props.setMarkupSettings({
          strokeWidth: defStyle['stroke-width'],
          strokeColor: defStyle['stroke-color'],
          strokeOpacity: defStyle['stroke-opacity'],
          fillColor: defStyle['fill-color'],
          fillOpacity: defStyle['fill-opacity'],
          fontSize: defStyle['font-size'],
        });
      }
      markExt.leaveEditMode();
      markExt.hide();
    } else {
      // @ts-ignore
      var markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(markExt);
      markExt.changeEditMode(markupMode);
      const defStyle = markExt.defaultStyle;
      if (props.markupSettings === null) {
        props.setMarkupSettings({
          strokeWidth: defStyle['stroke-width'],
          strokeColor: defStyle['stroke-color'],
          strokeOpacity: defStyle['stroke-opacity'],
          fillColor: defStyle['fill-color'],
          fillOpacity: defStyle['fill-opacity'],
          fontSize: defStyle['font-size'],
        });
      }
      if (isRestore) {
        props.setMarkupSettings({
          strokeWidth: defStyle['stroke-width'],
          strokeColor: defStyle['stroke-color'],
          strokeOpacity: defStyle['stroke-opacity'],
          fillColor: defStyle['fill-color'],
          fillOpacity: defStyle['fill-opacity'],
          fontSize: defStyle['font-size'],
        });
      }
    }
    
  }

  const handleOpenMarkupSettingsDialog = (open: boolean) => {
    if (open) {
      setDefaultMarkupStyle(false);
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      openMarkupSettingsDialog: open,
    }));
  }

  const handleObjectClick = (objId: string) => {
    const filterObj = props.forgeObjectData.filter((e) => e.forgeObject._id === objId);
    if (filterObj.length > 0) {
      props.setSelectedObject(filterObj[0].forgeObject);
      props.setFirstSubObject(null);
      // thêm tham số url param
      let params = new URLSearchParams(window.location.search);
      let taskParam = params.get('task');
      if (taskParam) {
        window.history.pushState({}, ``, `?task=${taskParam}&obj=${objId}`);
      } 
    }
  }

  const handleHistoryModelClick = (objId: string) => {
    // Tìm đối tượng trong data và thay đổi dữ liệu
    const newForgeData: IForgeObjectData[] = [];
    for (const foi of props.forgeObjectData) {
      for (const his of foi.history) {
        if (his._id === objId) {
          his.checked = true;
          foi.forgeObject = his;
        }
      }
      newForgeData.push(foi);
    }
    const checkModel = newForgeData.filter((e) => e.forgeObject.checked === true);
    if (checkModel.length > 0) {
      props.setFirstObject(checkModel[0].forgeObject);
    }
    props.setForgeObjectData(newForgeData);
  }

  // Delete Forge Object
  const handleDeleteForgeObject = (objId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteForgeObject(null),
    }

    if (objId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterObj = props.forgeObjectData.filter(ui => ui.forgeObject._id === objId);
    if (filterObj.length > 0) {
      const deleteObj = filterObj[0].forgeObject;
      dataDialog = {
        open: true,
        onClose: () => handleDeleteForgeObject(null),
        title: `${props.translate('common.delete')}`,
        content: deleteObj ? deleteObj.displayName : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteForgeObject(deleteObj)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteForgeObject = async (deleteObj: IForgeObject) => {
    if (deleteObj !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const deletedObj = await forgeObjectsApi.deleteById(deleteObj._id ?? '', deleteData);
      if (deletedObj) {
        loadTaskData();
        if (props.selectedObject !== null && props.currentTask?.category !== TaskCategory.ModelCollaboration) {
          handleObjectClick(props.selectedObject._id);
        }
      }
    }
    handleDeleteForgeObject(null);  
  };

  const Autodesk = window.Autodesk;
  let viewer: any;
  let subViewer: any;

  // Sử dụng cho hình ảnh - image
  const initForgeViewerImage = async () => {
    const options = {
      env: 'Local'
    };

    if (props.firstObject !== undefined && props.firstObject !== null) {
      Autodesk.Viewing.Initializer(options, async () => {
        // Bỏ các view đã tạo ở cùng container
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('forgeViewer');
        
        if (htmlDiv !== null) {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          viewer.setTheme('light-theme');
          viewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }
          viewer.loadExtension('Autodesk.PDF').then(async () => {
            viewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + props.firstObject?.urn,);
          });

          const handleResize = () => {
            viewer.resize();
          }
          viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              // console.log(settingsControl); // để xem id các button control
              if (settingsControl) {
                settingsControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setForgeViewer(viewer);
        }
        
      });
    }
  };

  // hình ảnh so sánh phiên bản
  const initForgeViewerSubImage = async (imageObject: IForgeObject | null) => {
    const options = {
      env: 'Local'
    };

    if (imageObject !== undefined && imageObject !== null) {
      Autodesk.Viewing.Initializer(options, async () => {
        // Bỏ các view đã tạo ở cùng container
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('subViewer');
        
        if (htmlDiv !== null) {
          subViewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = subViewer.start();
          subViewer.setTheme('light-theme');
          subViewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }
          subViewer.loadExtension('Autodesk.PDF').then(async () => {
            subViewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + imageObject?.urn,);
          });

          const handleResize = () => {
            subViewer.resize();
          }
          subViewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = subViewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              // console.log(settingsControl); để xem id các button control
              if (settingsControl) {
                settingsControl.setVisible(false);
              }
            }
          }
          subViewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setSubViewer(subViewer);
        }
        
      });
    }
  };

  // Sử dụng cho office
  const initForgeViewer2D = async () => {
    const options = {
      env: 'Local'
    };

    if (props.firstObject !== undefined && props.firstObject !== null) {
      // const fData = props.forgeObjectData.filter((e) => e.forgeObject._id === props.firstObject?._id);
      Autodesk.Viewing.Initializer(options, async () => {
        // Bỏ các view đã tạo ở cùng container
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('forgeViewer');
        
        if (htmlDiv !== null) {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          viewer.setTheme('light-theme');
          viewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }
          
          if (props.firstSubObject !== null) {
            viewer.loadExtension('Autodesk.PDF').then(async () => {
              viewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + props.firstObject?.urn, {}, (model1: Autodesk.Viewing.Model|number) => {
                viewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + props.firstSubObject?.urn, {}, async (model2: Autodesk.Viewing.Model|number) => {
                  const pixelCompareExt = await viewer.loadExtension('Autodesk.Viewing.PixelCompare')
                  pixelCompareExt.compareTwoModels(model1, model2);
                });
              });
            });
          } else {
            viewer.loadExtension('Autodesk.PDF').then(async () => {
              viewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + props.firstObject?.urn,);
            });
          }

          const handleResize = () => {
            viewer.resize();
          }
          viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              if (settingsControl) {
                settingsControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setForgeViewer(viewer);
        }
        
      });
    }
  };

  // Sử dụng cho Cad
  const initForgeViewerCad = async (isCompare: boolean, sheet01: any | null, sheet02: any | null) => {
    const tokenRes: IForgeToken = await forgesApi.getToken() as IForgeToken;
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: async (onSuccess: any) => {
        let accessToken, expire;
        accessToken = tokenRes.access_token;
        expire = tokenRes.expires_in;
        onSuccess(accessToken, expire);
      }
    }
    if (props.firstObject !== undefined && props.firstObject !== null) {
      Autodesk.Viewing.Initializer(options, async () => {
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('forgeViewer');
        
        if (htmlDiv !== null) {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          viewer.setTheme('light-theme');
          viewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }

          const documentId = 'urn:' + props.firstObject?.urn;
          const onDocumentLoadSuccess = (doc01: any) => {
            let viewables_01 = doc01.getRoot().getDefaultGeometry();
            if (viewer) {
              if (!isCompare) {
                viewer.loadDocumentNode(doc01, viewables_01);
              }
              viewables_01 = doc01.getRoot().search(
                {
                  type: "geometry",
                  role: "2d",
                },
                true
              );
              if (props.firstSubObject !== null) {
                const subDocumentId = 'urn:' + props.firstSubObject?.urn;
                const onSecondDocumentLoadSuccess = (doc02: any) => {
                  let viewables_02 = doc02.getRoot().getDefaultGeometry();
                  // if (viewer) {
                  //   viewer.loadDocumentNode(doc02, viewables_02);
                  // }
                  viewables_02 = doc02.getRoot().search(
                    {
                      type: "geometry",
                      role: "2d",
                    },
                    true
                  );
                  if (!isCompare) {
                    setState((prevState: ILocalState) => ({
                      ...prevState,
                      viewableList01: viewables_01,
                      viewableList02: viewables_02,
                      openSelectViewables: true,
                    }));
                  }
                  
                  if (isCompare && sheet01 !== null && sheet02 !== null) {
                    // Load 2 sheets
                    viewer.loadDocumentNode(doc01, sheet01).then((model1: any) => {
                      viewer.loadDocumentNode(doc02, sheet02, { keepCurrentModels: true }).then(async (model2: any) => {
                        // Compare them
                        var pcExt = await viewer.loadExtension("Autodesk.Viewing.PixelCompare");
                        pcExt.compareTwoModels(model1, model2);
                      })
                    });
                  }
                };
                Autodesk.Viewing.Document.load(subDocumentId, onSecondDocumentLoadSuccess, onDocumentLoadFailure);
              }
            }
          }
          
          const onDocumentLoadFailure = (viewerErrorCode: any, viewerErrorMsg: any) => {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
          }

          Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
          const handleInitializerError = () => {
            enqueueSnackbar(`${props.translate('coordinator.waiting_translate')}`, {
              variant: 'error',
            })
          }
          viewer.addEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, handleInitializerError);

          const handleResize = () => {
            viewer.resize();
          }
          viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              if (settingsControl) {
                const fullscreenControl = settingsControl.getControl('toolbar-fullscreenTool');
                fullscreenControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setForgeViewer(viewer);
        }
      });
    }
  };

  const handleCloseCompareCadSheet = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openSelectViewables: false,
    }));
  }

  const handleOpenCompareDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openModelCompare: open,
    }));
  }

  // Dùng cho sự kiện click trên properties panel để lấy thuộc tính
  const onPropertyClick = (property: any, event: any) => {
    props.setFilterProperty(property.name);
    props.setFilterKey(property.value);
    console.log(property);
    
  }

  // Dùng cho so sánh 2 model sheet
  const initForgeViewerCompareModelSheet = async (sheet01: any | null, sheet02: any | null) => {
    const tokenRes: IForgeToken = await forgesApi.getToken() as IForgeToken;
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: async (onSuccess: any) => {
        let accessToken, expire;
        accessToken = tokenRes.access_token;
        expire = tokenRes.expires_in;
        onSuccess(accessToken, expire);
      }
    }
    if (props.firstObject !== undefined && props.firstObject !== null) {
      Autodesk.Viewing.Initializer(options, async () => {
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('forgeViewer');
        
        if (htmlDiv !== null) {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          viewer.setTheme('light-theme');
          viewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }

          const documentId = 'urn:' + props.firstObject?.urn;
          const onDocumentLoadSuccess = (doc01: any) => {
            let viewables_01 = doc01.getRoot().getDefaultGeometry();
            if (viewer) {
              viewables_01 = doc01.getRoot().search(
                {
                  type: "geometry",
                  role: "2d",
                },
                true
              );
              if (props.firstSubObject !== null) {
                const subDocumentId = 'urn:' + props.firstSubObject?.urn;
                const onSecondDocumentLoadSuccess = (doc02: any) => {
                  let viewables_02 = doc02.getRoot().getDefaultGeometry();
                  // if (viewer) {
                  //   viewer.loadDocumentNode(doc02, viewables_02);
                  // }
                  viewables_02 = doc02.getRoot().search(
                    {
                      type: "geometry",
                      role: "2d",
                    },
                    true
                  );
                  
                  if (sheet01 !== null && sheet02 !== null) {
                    // Trường hợp từ 2 model: sheet 01 và 02 nhận được là guid của 2d sheet
                    // nên cần tìm ra viewable tương ứng
                    let sheetA: any = null;
                    for (const viewi of viewables_01) {
                      const child = viewi.data.children;
                      for (const chi of child) {
                        if (chi.guid === sheet01) {
                          sheetA = viewi;
                        }
                      }
                    }
                    let sheetB: any = null;
                    for (const viewi of viewables_02) {
                      const child = viewi.data.children;
                      for (const chi of child) {
                        if (chi.guid === sheet02) {
                          sheetB = viewi;
                        }
                      }
                    }
                    // Load 2 sheets
                    viewer.loadDocumentNode(doc01, sheetA).then((model1: any) => {
                      viewer.loadDocumentNode(doc02, sheetB, { keepCurrentModels: true }).then(async (model2: any) => {
                        // Compare them
                        var pcExt = await viewer.loadExtension("Autodesk.Viewing.PixelCompare");
                        pcExt.compareTwoModels(model1, model2);
                      })
                    });
                  }
                };
                Autodesk.Viewing.Document.load(subDocumentId, onSecondDocumentLoadSuccess, onDocumentLoadFailure);
              }
            }
          }
          
          const onDocumentLoadFailure = (viewerErrorCode: any, viewerErrorMsg: any) => {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
          }

          Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
          const handleInitializerError = () => {
            enqueueSnackbar(`${props.translate('coordinator.waiting_translate')}`, {
              variant: 'error',
            })
          }
          viewer.addEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, handleInitializerError);

          const handleResize = () => {
            viewer.resize();
          }
          viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              if (settingsControl) {
                const fullscreenControl = settingsControl.getControl('toolbar-fullscreenTool');
                fullscreenControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setForgeViewer(viewer);
        }
      });
    }
  };

  // Dùng cho so sánh model
  const initForgeViewerCompare3DModel = async () => {
    const tokenRes: IForgeToken = await forgesApi.getToken() as IForgeToken;
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: async (onSuccess: any) => {
        let accessToken, expire;
        accessToken = tokenRes.access_token;
        expire = tokenRes.expires_in;
        onSuccess(accessToken, expire);
      }
    }
    Autodesk.Viewing.Initializer(options, async () => {
      const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
      for (var i = existing_viewer.length - 1; i >= 0; --i) {
        existing_viewer[i].remove();
      }
      const htmlDiv = document.getElementById('forgeViewer');
      
      if (htmlDiv !== null) {
        viewer = new Autodesk.Viewing.GuiViewer3D(
          htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore' ] }
        );
        const startedCode = viewer.start();
        viewer.setTheme('light-theme');
        viewer.disableHighlight(true);
        if (startedCode > 0) {
          console.error('Failed to create a Viewer: WebGL not supported.');
          return;
        }

        const addViewable = async (urn: string) => {
          return new Promise((resolve, reject) => {
              const onSubDocumentLoadSuccess = (doc02: any) => {
                const viewable = doc02.getRoot().getDefaultGeometry();
                const options = {
                  preserveView: true,
                  keepCurrentModels: true,
                };
                viewer.loadDocumentNode(doc02, viewable, options)
                  .then(resolve)
                  .catch(reject);
              }
              const onSubDocumentLoadFailure = (code: any) => {
                reject(`Could not load document (${code}).`);
              }
              Autodesk.Viewing.Document.load('urn:' + urn, onSubDocumentLoadSuccess, onSubDocumentLoadFailure);
          });
        }

        const onDocumentLoadSuccess = (doc01: any) => {
          let viewables_01 = doc01.getRoot().getDefaultGeometry();
          if (viewer) {
            viewer.loadDocumentNode(doc01, viewables_01);
            const handleResize = () => {
              viewer.resize();
            }
            viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
            const handleFinishLoaded = () => {
              const viewerToolbar = viewer.getToolbar(true);          
              if (viewerToolbar) {
                // Find the settings control
                const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
                if (settingsControl) {
                  const fullscreenControl = settingsControl.getControl('toolbar-fullscreenTool');
                  fullscreenControl.setVisible(false);
                }
              }
            }
            viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          }
        }
        
        const onDocumentLoadFailure = (viewerErrorCode: any, viewerErrorMsg: any) => {
          console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
        }

        const documentId = 'urn:' + props.firstObject?.urn;
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

        const handleInitializerError = () => {
          enqueueSnackbar(`${props.translate('coordinator.  ')}`, {
            variant: 'error',
          })
        }
        viewer.addEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, handleInitializerError);
        // Tải model thứ 2
        const loadedPromise = new Promise((resolve, reject) => {
          const listener = function (event: any) {
            viewer.removeEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT, 
              listener
            );
            // @ts-ignore
            resolve();
          }
          viewer.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            listener
          );
        });
        await loadedPromise;
        if (props.firstSubObject !== undefined && props.firstSubObject !== null) {
          const urn = props.firstSubObject.urn;
          const restorePromise = new Promise((resolve, reject) => {
            const listener = function (event: any) {
              if (event.value.finalFrame) {
                viewer.removeEventListener(
                  Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, 
                  listener
                );
                // @ts-ignore
                resolve();
              }
            }
            viewer.addEventListener(
              Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT,
              listener
            );
            addViewable(urn);
          }); 
          await restorePromise;
        }
        const models = viewer.impl.modelQueue().getModels();
        let extensionConfig = {
          mimeType: 'application/vnd.autodesk.revit',
          // primaryModels: [viewer.getVisibleModels()[0]],
          // diffModels: [viewer.getVisibleModels()[1]],
          primaryModels: [models[0]],
          diffModels: [models[1]],
          diffMode: ['overlay', 'sidebyside'],
          versionA: `${props.firstObject?.version}.${props.firstObject?.subVersion}`,
          versionB: `${props.firstSubObject?.version}.${props.firstSubObject?.subVersion}`,
          diffadp: false,
          useSplitScreenExtension: true,
        }
        
        viewer.loadExtension('Autodesk.DiffTool', extensionConfig)
          .then(function (res: any) {
            const DIFF_EXT = viewer.getExtension('Autodesk.DiffTool');
            console.log(DIFF_EXT);
            // DIFF_EXT.active();
          })
          .catch(function (err: any) {
            console.log(err);
          });
        props.setForgeViewer(viewer);
        // =========
      }
    });
  }

  // Dùng tải model: single và multi
  const initForgeViewerMultiModel = async () => {
    const tokenRes: IForgeToken = await forgesApi.getToken() as IForgeToken;
    const options = {
      env: 'AutodeskProduction',
      getAccessToken: async (onSuccess: any) => {
        var accessToken, expire;
        accessToken = tokenRes.access_token;
        expire = tokenRes.expires_in;
        onSuccess(accessToken, expire);
      }
    }
    Autodesk.Viewing.Initializer(options, async () => {
      const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
      for (var i = existing_viewer.length - 1; i >= 0; --i) {
        existing_viewer[i].remove();
      }
      const htmlDiv = document.getElementById('forgeViewer');
      
      if (htmlDiv !== null) {
        viewer = new Autodesk.Viewing.GuiViewer3D(
          htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore'] }
        );
        const startedCode = viewer.start();
        viewer.setTheme('light-theme');
        viewer.disableHighlight(true);
        if (startedCode > 0) {
          console.error('Failed to create a Viewer: WebGL not supported.');
          return;
        }
        // =========
        const addViewable = async (urn: string, xform: any, globalOffset: any) => {
          return new Promise((resolve, reject) => {
              const onSubDocumentLoadSuccess = (doc02: any) => {
                const viewable = doc02.getRoot().getDefaultGeometry();
                const options = {
                  preserveView: true,
                  keepCurrentModels: true,
                  placementTransform: (new THREE.Matrix4()).setPosition(xform),
                  globalOffset: globalOffset
                };
                viewer.loadDocumentNode(doc02, viewable, options)
                  .then(resolve)
                  .catch(reject);
              }
              const onSubDocumentLoadFailure = (code: any) => {
                reject(`Could not load document (${code}).`);
              }
              Autodesk.Viewing.Document.load('urn:' + urn, onSubDocumentLoadSuccess, onSubDocumentLoadFailure);
          });
        }

        const onDocumentLoadSuccess = (doc01: any) => {
          let viewables_01 = doc01.getRoot().getDefaultGeometry();
          if (viewer) {
            viewer.loadDocumentNode(doc01, viewables_01);
            const handleResize = () => {
              viewer.resize();
            }
            viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
            const handleFinishLoaded = () => {
              const viewerToolbar = viewer.getToolbar(true);          
              if (viewerToolbar) {
                // Find the settings control
                const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
                if (settingsControl) {
                  const fullscreenControl = settingsControl.getControl('toolbar-fullscreenTool');
                  fullscreenControl.setVisible(false);
                }
              }
            }
            viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          }
        }
        
        const onDocumentLoadFailure = (viewerErrorCode: any, viewerErrorMsg: any) => {
          console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
        }

        const documentId = 'urn:' + props.firstObject?.urn;
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

        const handleInitializerError = () => {
          enqueueSnackbar(`${props.translate('coordinator.  ')}`, {
            variant: 'error',
          })
        }
        viewer.addEventListener(Autodesk.Viewing.VIEWER_UNINITIALIZED, handleInitializerError);
        // Tải multi model
        const loadedPromise = new Promise((resolve, reject) => {
          const listener = function (event: any) {
            viewer.removeEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT, 
              listener
            );
            // @ts-ignore
            resolve();
          }
          viewer.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            listener
          );
        });
        await loadedPromise;

        const checkModels = props.forgeObjectData.filter((e) => e.forgeObject.checked === true);
        if (checkModels.length > 1) {
          const Goffset = viewer.model.getData().globalOffset;
          for (let i = 1; i < checkModels.length; i++) {
            const fobi = checkModels[i];
            
            const xform = {x: 0.0, y: 0.0, z: 0.0};
            if (fobi.forgeObject.xform !== '') {
              const xf = JSON.parse(fobi.forgeObject.xform);
              xform.x = xf.x;
              xform.y = xf.y;
              xform.z = xf.z;
            }
            const urn = fobi.forgeObject.urn;
            const restorePromise = new Promise((resolve, reject) => {
              const listener = function (event: any) {
                if (event.value.finalFrame) {
                  viewer.removeEventListener(
                    Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, 
                    listener
                  );
                  // @ts-ignore
                  resolve();
                }
              }
              viewer.addEventListener(
                Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT,
                listener
              );
              addViewable(urn, xform, Goffset);
            }); 
            await restorePromise;
          }
        } 
        if (props.forgeObjectData.length === 1) {
          // trường hợp single model
          // Tải 'Autodesk.DocumentBrowser'
          viewer.loadExtension('Autodesk.DocumentBrowser');
        }
        // const models = viewer.impl.modelQueue().getModels();
        // console.log(models.length);
        viewer.setProgressiveRendering(false);
        props.setForgeViewer(viewer);
        // @ts-ignore
        Autodesk.Viewing.UI.PropertyPanel.prototype.onPropertyClick = onPropertyClick;
        // =========
      }
    });
  }

  // Sử dụng cho tải model. Bao gồm cả tải multiple model
  const initForgeViewer = async () => {
    if (props.firstSubObject === null) {
      if (props.firstObject !== undefined && props.firstObject !== null) {
        initForgeViewerMultiModel();
      } else {
        if (props.forgeViewer !== undefined && props.forgeViewer !== null) {
          const models = props.forgeViewer.impl.modelQueue().getModels();
          for (const mod of models) {
            props.forgeViewer.impl.unloadModel(mod);
          }        
        }
      }
    } else {
      if (props.is2D) {
        initForgeViewerCompareModelSheet(props.sheetA, props.sheetB);
      } else {
        initForgeViewerCompare3DModel();
      }
    }
    
  };

  const handleCompare = (id: string) => {
    const filter = props.forgeObjectData.filter((e) => e.forgeObject._id === props.selectedObject?._id);
    const historyFilter = filter[0].history.filter((e) => e._id === id);
    props.setFirstSubObject(historyFilter[0]);

    if (filter.length > 0) {
      switch (props.currentTask?.category) {
        case TaskCategory.ImageCollaboration:
          initForgeViewerSubImage(historyFilter[0]);
          props.setIsSplit(true);
          break;
        case TaskCategory.OfficeCollaboration:
          break;
        case TaskCategory.CadCollaboration:
          break;
        case TaskCategory.ModelCollaboration:
        break;
      }
    }
    
    if (id === '') {
      props.setFirstSubObject(null);
      props.setIsSplit(false);
    }
    
    handleCloseCompareHistory();
  }

  // Sử dụng cho Point Cloud
  const initForgeViewerGlb = async () => {
    const options = {
      env: 'Local'
    };

    if (props.firstObject !== undefined && props.firstObject !== null) {
      Autodesk.Viewing.Initializer(options, async () => {
        // Bỏ các view đã tạo ở cùng container
        const existing_viewer = document.getElementsByClassName('forgeViewer.adsk-viewing-viewer');
        for (let i = existing_viewer.length - 1; i >= 0; --i) {
          existing_viewer[i].remove();
        }
        const htmlDiv = document.getElementById('forgeViewer');
        
        if (htmlDiv !== null) {
          viewer = new Autodesk.Viewing.GuiViewer3D(
            htmlDiv, { extensions: [ 'Autodesk.Viewing.MarkupsCore', 'Autodesk.DocumentBrowser' ] }
          );
          const startedCode = viewer.start();
          viewer.setTheme('light-theme');
          viewer.disableHighlight(true);
          if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
          }
          
          if (props.firstSubObject === null) {
            viewer.loadExtension('Autodesk.glTF').then(async () => {
              viewer.loadModel(process.env.REACT_APP_APIFILE + 'projects/' + props.firstObject?.urn);
            });
          }

          const handleResize = () => {
            viewer.resize();
          }
          viewer.addEventListener(Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, handleResize);
          const handleFinishLoaded = () => {
            const viewerToolbar = viewer.getToolbar(true);            
            if (viewerToolbar) {
              // Find the settings control
              const settingsControl = viewerToolbar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
              if (settingsControl) {
                settingsControl.setVisible(false);
              }
            }
          }
          viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, handleFinishLoaded);
          props.setForgeViewer(viewer);
        }
        
      });
    }
  };

  // Left and right side bar
  const handleOpenLeftBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openLeftBar: true }));
  };
  const handleCloseLeftBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openLeftBar: false }));
  };
  const handleToggleLeftBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openLeftBar: !props.localState.openLeftBar }));
  };

  const handleOpenRightBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openRightBar: true }));
  };
  const handleCloseRightBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openRightBar: false }));
  };
  const handleToggleRightBar = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openRightBar: !props.localState.openRightBar }));
  };

  const handleOpenAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
    setState((prevState: ILocalState) => ({ ...prevState, openAdminMenu: event.currentTarget }));
  }

  const handleCloseAdminMenu = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openAdminMenu: null }));
  };

  const handleOpenCompareHistory = (event: React.MouseEvent<HTMLElement>) => {
    setState((prevState: ILocalState) => ({ ...prevState, openCompareHistory: event.currentTarget }));
  }

  const handleCloseCompareHistory = () => {
    setState((prevState: ILocalState) => ({ ...prevState, openCompareHistory: null }));
  }

  // Markups
  // Add Markup functions
  var markupExtension = null;

  const enterMarkupEditMode = (mode: MarkupMode) => {
    if (props.forgeViewer === null) return;
    markupExtension = props.forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
    if (!markupExtension.editMode) {
      markupExtension.enterEditMode();
      markupExtension.leaveEditMode();
      markupExtension.enterEditMode();
    }

    var markupMode;
    switch (mode) {
      case MarkupMode.arrow:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeArrow(markupExtension);
        break;
      case MarkupMode.rectangle:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeRectangle(markupExtension);
        break;
      case MarkupMode.circle:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeCircle(markupExtension);
        break;
      case MarkupMode.text:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeText(markupExtension);
        break;
      case MarkupMode.freehand:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeFreehand(markupExtension);
        break;
      case MarkupMode.polyline:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModePolyline(markupExtension);
        break;
      case MarkupMode.polycloud:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModePolycloud(markupExtension);
        break;
      default:
        // @ts-ignore
        markupMode = new Autodesk.Viewing.Extensions.Markups.Core.EditModeCloud(markupExtension);
        break;
    }
    markupExtension.changeEditMode(markupMode);

    // đổi style
    if (props.markupSettings !== null) {
      var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity', 'font-size'];
      // @ts-ignore
      var nsu = Autodesk.Viewing.Extensions.Markups.Core.Utils;
      var styleObject = nsu.createStyle(styleAttributes, markupExtension);
      styleObject['stroke-width'] = props.markupSettings.strokeWidth;
      styleObject['stroke-color'] = props.markupSettings.strokeColor;
      styleObject['stroke-opacity'] = props.markupSettings.strokeOpacity;
      styleObject['fill-color'] = props.markupSettings.fillColor;
      styleObject['fill-opacity'] = props.markupSettings.fillOpacity;
      styleObject['font-size'] = props.markupSettings.fontSize;
      markupExtension.setStyle(styleObject);
    }
  }

  const exitMarkupView = () => {
    if (props.forgeViewer) {
      markupExtension = props.forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
      // markupExtension.clear();
      markupExtension.hide();
    }
  }

  const handleDiscussionsDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDiscussions: open,
    }));
  }

  return {
    loadTaskData,
    initForgeViewerImage,
    initForgeViewerSubImage,
    initForgeViewer2D,
    initForgeViewerCad,
    handleCloseCompareCadSheet,
    handleOpenCompareDialog,
    initForgeViewer,
    initForgeViewerGlb,
    //
    handleOpenAdminMenu,
    handleCloseAdminMenu,
    handleOpenCompareHistory,
    handleCloseCompareHistory,
    handleOpenLeftBar,
    handleCloseLeftBar,
    handleToggleLeftBar,
    handleOpenRightBar,
    handleCloseRightBar,
    handleToggleRightBar,
    //
    handleObjectClick,
    handleHistoryModelClick,
    handleDeleteForgeObject,
    // markups
    enterMarkupEditMode,
    exitMarkupView,
    //
    handleSetGhosting,
    handleOpenInfoDialog,
    handleOpenFilesDialog,
    handleOpenMarkupSettingsDialog,
    setDefaultMarkupStyle,
    //
    handleUploadFiles,
    handleSelectFiles,
    handleModelManager,
    //
    handleDiscussionsDialog,
    //
    handleCompare,
  }
};

const ForgeContainer = () => {
  
  let props = forgeAttribute();
  const { localState, setLocalState, user } = props;

  let func = forgeFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.loadTaskData();
  }, [user]);

  useEffect(() => {
    switch (props.currentTask?.category) {
      case TaskCategory.ImageCollaboration:
        func.initForgeViewerImage();
        if (props.firstSubObject !== null && props.firstSubObject !== undefined) {
          func.initForgeViewerSubImage(props.firstSubObject);
        }
        break;
      case TaskCategory.ModelCollaboration:
        func.initForgeViewer();
        break;
      case TaskCategory.CadCollaboration:
        func.initForgeViewerCad(false, null, null);
        break;
      default:
        func.initForgeViewer2D();
        break;
    }
  }, [
    props.isSplit,
    props.firstObject,
    props.forgeObjectData,
    props.firstSubObject,
  ]);

  return (
    <>
      <ForgeComponent props={props} func={func}/>
    </>
  )
}

export default ForgeContainer;