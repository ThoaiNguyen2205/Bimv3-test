// @ts-ignore
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
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

import { IMainTask } from "src/shared/types/mainTask";
import { IFolder} from 'src/shared/types/folder';
// apis
import foldersApi from 'src/api/foldersApi';
// components
import RequestComponent from 'src/components/dashboard/cloud/request.component';
import { IRequest, IRequestTaskData, IRequestTreeData } from 'src/shared/types/request';
import requestsApi from 'src/api/requestsApi';
import useRequest from 'src/redux/requestStore';
import useFile from 'src/redux/filesStore';
import { IFile } from 'src/shared/types/file';
import { IRequestContent, IRequestContentResGetAll } from 'src/shared/types/requestContent';
import { PATH_DASHBOARD } from 'src/routes/paths';
// sections
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
import { IGroup } from 'src/shared/types/group';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import requestContentsApi from 'src/api/requestContentsApi';
import Markdown from 'src/components/markdown/Markdown';
// --------------------------------------------------------------------------

export type ILocalState = {
  onAccess: boolean;
  initLoading: boolean;
  isSubmitting: boolean;
  //
  openNewRequestDialog: boolean;
  openFolderPermissionDialog: boolean;
  updateGroups: IGroup[];
  approveGroups: IGroup[];
  confirmGroups: IGroup[];
  openTaskInfoDialog: boolean;
  openTaskFilesDialog: boolean;
  openDiscussions: boolean;
  editSubmit: boolean;
  openNewSubmitDialog: boolean;
  openApproveDialog: boolean;
  //
  dataDialog: ConfirmDialogProps;
  // openDetails: boolean,
  // detailItem: IFile | null,
};

export type IRequestAttribute = {
  localState: ILocalState, 
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>,
  //
  selectedFolder: IFolder | null,
  setSelectedFolder: (folder: IFolder | null) => void,
  destination: string,
  setDestination: (value: string) => void,
  //
  selectedTask: IMainTask | null,
  setSelectedTask: (task: IMainTask | null) => void;
  //
  requests: IRequest[];
  setRequests: (requests: IRequest[]) => void;
  selectedRequest: IRequest | null;
  setSelectedRequest: (request: IRequest | null) => void;
  requestLoading: boolean;
  setRequestLoading: (value: boolean) => void;
  countRequests: () => void;
  currentTask: IMainTask | null;
  setCurrentTask: (task: IMainTask | null) => void;
  requestsTree: IRequestTreeData[];
  setRequestsTree: (treeData: IRequestTreeData[]) => void;
  requestContents: IRequestContent[];
  setRequestContents: (requestContents: IRequestContent[]) => void;
  selectedRequestContent: IRequestContent | null;
  setSelectedRequestContent: (requestContent: IRequestContent | null) => void;
  //
  files: IFile[];
  setFiles: (files: IFile[]) => void;
  selectedFile: IFile | null;
  setSelectedFile: (file: IFile | null) => void;
  //
  user: AuthUserType,
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>,
};

export type IRequestFunction = {
  loadTaskData: () => Promise<void>,
  jumptoFilePath: () => void,
  renderRequestsTree: (treeData: IRequestTreeData[]) => ReactNode[],
  handleNewRequestDialog: (open: boolean) => void,
  handleSetPermission: (open: boolean) => void,
  handleOpenInfoDialog: (open: boolean) => void,
  handleDeleteRequest: (reqId: string | null) => void,
  handleCloseRequest: (reqId: string | null) => void,
  handleOpenFilesDialog: (open: boolean) => void,
  handleDiscussionsDialog: (open: boolean) => void,
  handleNewSubmitDialog: (open: boolean) => void,
  handleEditSubmitDialog: (submitId: string) => void,
  handleConfirmSubmit: (submitId: string | null) => void,
  handleApproveDialog: (submitId: string | null) => void,
};

const requestAttribute = (): IRequestAttribute => {
  
  const [localState, setLocalState] = useState<ILocalState>({
    onAccess: false,
    initLoading: false,
    isSubmitting: false,
    //
    openNewRequestDialog: false,
    openFolderPermissionDialog: false,
    updateGroups: [],
    approveGroups: [],
    confirmGroups: [],
    openTaskInfoDialog: false,
    openTaskFilesDialog: false,
    openDiscussions: false,
    editSubmit: false,
    openNewSubmitDialog: false,
    openApproveDialog: false,
    //
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    // openDetails: false,
    // detailItem: null,
  });

  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    selectedFolder,
    setSelectedFolder,
    destination,
    setDestination,
  } = useFolder(
    (state) => ({
      selectedFolder: state.selectedData,
      setSelectedFolder: state.setSelectedData,
      destination: state.destination,
      setDestination: state.setDestination,
    }),
    shallow
  );

  const {
    selectedTask,
    setSelectedTask,
  } = useTask(
    (state) => ({ 
      selectedTask: state.selectedData,
      setSelectedTask: state.setSelectedData,
    }),
    shallow
  );

  const {
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    requestLoading,
    setRequestLoading,
    countRequests,
    currentTask,
    setCurrentTask,
    requestsTree,
    setRequestsTree,
    requestContents,
    setRequestContents,
    selectedRequestContent,
    setSelectedRequestContent,
  } = useRequest(
    (state) => ({
      requests: state.datas,
      setRequests: state.setDatas,
      selectedRequest: state.selectedData,
      setSelectedRequest: state.setSelectedData,
      requestLoading: state.loading,
      setRequestLoading: state.setLoading,
      countRequests: state.countDatas,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      requestsTree: state.requestsTree,
      setRequestsTree: state.setRequestsTree,
      requestContents: state.requestContents,
      setRequestContents: state.setRequestContents,
      selectedRequestContent: state.selectedRequestContent,
      setSelectedRequestContent: state.setSelectedRequestContent,
    }),
    shallow
  );

  const {
    files,
    setFiles,
    selectedFile,
    setSelectedFile,
  } = useFile(
    (state) => ({ 
      files: state.datas,
      setFiles: state.setDatas,
      selectedFile: state.selectedData,
      setSelectedFile: state.setSelectedData,
    }),
    shallow
  );

  return {
    localState, 
    setLocalState,
    //
    selectedFolder,
    setSelectedFolder,
    destination,
    setDestination,
    //
    selectedTask,
    setSelectedTask,
    //
    requests,
    setRequests,
    selectedRequest,
    setSelectedRequest,
    requestLoading,
    setRequestLoading,
    countRequests,
    currentTask,
    setCurrentTask,
    requestsTree,
    setRequestsTree,
    requestContents,
    setRequestContents,
    selectedRequestContent,
    setSelectedRequestContent,
    //
    files,
    setFiles,
    selectedFile,
    setSelectedFile,
    //
    user,
    translate,
  }
};

const requestFunction = ({
  props, 
  state, 
  setState
}: {props: IRequestAttribute, state: ILocalState, setState: Function}): IRequestFunction => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // Tải dữ liệu thông tin task hiện hành

  const loadTaskData = useCallback(async () => {
    if (props.user === null) return;
    setState((prevState: ILocalState) => ({
      ...prevState,
      initLoading: true,
    }));
    if (props.user.group === null) {
      enqueueSnackbar(`${props.translate('helps.no_group_alert')}`, {variant: "info"});
      router.push(PATH_DASHBOARD.member.users);
      return;
    }
    let urlParams = new URLSearchParams(window.location.search);
    let taskParam = urlParams.get('task');

    if (taskParam) {
      // cần tải: 
      // 1. task data
      // 2. request data dạng cây
      // 3. request content data
      const taskData: IRequestTaskData = await requestsApi.getRequestTaskData(
        taskParam,
        props.user.id,
        props.user.class.uclass,
        props.user.customer._id,
        props.user?.group._id,
      );
      const taskAccess = taskData.task.isView;

      // const params = { 
      //   project: props.user?.project._id,
      //   category: TaskCategory.FileRequestCloud,
      // };
      // const allUserTask = await requestsApi.getRequestTasksByUser(params, props.user?.group._id);
      const allUserTask = taskData.allTasks;
      let reCheck = false;
      if (allUserTask.filter((e) => e._id === taskParam).length > 0) {
        reCheck = true;
      }

      const onAccess = taskAccess || reCheck;
      setState((prevState: ILocalState) => ({ ...prevState, onAccess: onAccess, initLoading: false }));
      if (onAccess) {
        props.setSelectedTask(taskData.task);
        props.setCurrentTask(taskData.task);

        props.setRequests(taskData.allRequest);
        props.setRequestsTree(taskData.requestTree);
      }
    }
  }, []);

  const jumptoFilePath = () => {
    if (props.selectedFolder !== null) {
      router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${props.selectedFolder}`);
    }
  }

  // Render request tree
  const treeItemOnClick = async (reqId: string) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));

    let urlParams = new URLSearchParams(window.location.search);
    let taskParam = urlParams.get('task');
    if (taskParam) {
      window.history.pushState({}, ``, `?task=${taskParam}&sel=${reqId}`);
    }

    // 1. Tìm và chọn request thành hiện hành
    const reqFilter = props.requests.filter((e) => e._id === reqId);
    if (reqFilter.length > 0) {
      props.setSelectedRequest(reqFilter[0]);
    }

    const submitDetails = await requestContentsApi.getRequestContentDetails(reqId, (reqFilter[0]?.folder as IFolder)._id, props.user?.id);

    props.setSelectedFolder(submitDetails.folderData);
    props.setDestination(submitDetails.strPath);
    props.setRequestContents(submitDetails.requestContents);
    
    setState((prevState: ILocalState) => ({
      ...prevState,
      updateGroups: submitDetails.preUpdateChecked,
      confirmGroups: submitDetails.preConfirmChecked,
      approveGroups: submitDetails.preApproveChecked,
      isSubmitting: false,
    }));
  }

  const renderRequestsTree = (treeData: IRequestTreeData[]) => (
    treeData.map((request) => (
      <StyledTreeFolder
        key={request.node._id}
        nodeId={request.node._id}
        labelText={request.node.title}
        color={'#00AB55'}
        bgColor="#3be79036"
        colorForDarkMode={'#00AB55'}
        bgColorForDarkMode="#3be79036"
        onClick={() => (treeItemOnClick(request.node._id))}
      >
        {(request.children.length > 0) ?
          <>
            {renderRequestsTree(request.children)}
          </>
          : null
        }
      </StyledTreeFolder>
    ))
  );

  const handleNewRequestDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewRequestDialog: open,
    }));
  }

  const handleSetPermission = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openFolderPermissionDialog: open,
    }));
    if (open === false) {
      if (props.selectedRequest !== null) treeItemOnClick(props.selectedRequest._id);
    }
  }

  // handle mở hộp thoại thông tin công việc
  const handleOpenInfoDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskInfoDialog: open,
    }));
  }

  // Delete request
  const handleDeleteRequest = (reqId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteRequest(null),
    }

    if (reqId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterRequest = props.requests.filter(ui => ui._id === reqId);
    if (filterRequest.length > 0) {
      const deleteRequest = filterRequest[0]
      dataDialog = {
        open: true,
        onClose: () => handleDeleteRequest(null),
        title: `${props.translate('common.delete')}`,
        content: deleteRequest ? deleteRequest.title : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onDeleteRequest(deleteRequest)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onDeleteRequest = async (deleteRequest: IRequest) => {
    if (deleteRequest !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const deletedRequest = await requestsApi.deleteById(deleteRequest?._id ?? '', deleteData);
      if (deletedRequest) {
        loadTaskData();
      }
    }
    handleDeleteRequest(null);
    props.setSelectedRequest(null);
  };

  // Close request
  const handleCloseRequest = (reqId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleCloseRequest(null),
    }

    if (reqId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterRequest = props.requests.filter(ui => ui._id === reqId);
    if (filterRequest.length > 0) {
      const closeRequest = filterRequest[0]
      dataDialog = {
        open: true,
        onClose: () => handleCloseRequest(null),
        title: `${props.translate('common.close')}`,
        content: closeRequest ? closeRequest.title : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onCloseRequest(closeRequest)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onCloseRequest = async (closeRequest: IRequest) => {
    if (closeRequest !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const deletedRequest = await requestsApi.closeById(closeRequest?._id ?? '', deleteData);
      if (deletedRequest) {
        loadTaskData();
      }
    }
    handleDeleteRequest(null);
    props.setSelectedRequest(null);
  };

  const handleOpenFilesDialog = async (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openTaskFilesDialog: open,
    }));
  }

  const handleDiscussionsDialog = (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openDiscussions: open,
    }));
  }

  const handleNewSubmitDialog = async (open: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewSubmitDialog: open,
      editSubmit: false,
    }));
  }

  const handleEditSubmitDialog = (submitId: string) => {
    const submitFilter = props.requestContents.filter((e) => e._id === submitId);
    if (submitFilter.length > 0) {
      const editSubmit = submitFilter[0];
      if ((editSubmit.isConfimed !== undefined && editSubmit.isConfimed !== null)
      && (editSubmit.isApproved !== undefined && editSubmit.isApproved !== null)) {
        enqueueSnackbar(`${props.translate('request.none_edit_submit')}`, {variant: "info"});
        return;
      }
      
      props.setSelectedRequestContent(submitFilter[0]);
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      openNewSubmitDialog: true,
      editSubmit: true,
    }));
  }

  // confirm request content
  const handleConfirmSubmit = (submitId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleConfirmSubmit(null),
    }

    if (submitId === null) {
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
      return;
    }
    const filterRequestContent = props.requestContents.filter(ui => ui._id === submitId);
    if (filterRequestContent.length > 0) {
      const confirmRequestContent = filterRequestContent[0];
      dataDialog = {
        open: true,
        onClose: () => handleConfirmSubmit(null),
        title: (confirmRequestContent.isConfimed !== undefined && confirmRequestContent.isConfimed !== null) ? `${props.translate('common.cancel')} ${props.translate('common.confirm')}` : `${props.translate('common.confirm')}`,
        content: confirmRequestContent ? <Markdown children={confirmRequestContent.content} /> : '',
        action: (
          <Button variant="contained" color="error" onClick={() => onConfirmSubmit(confirmRequestContent)}>
            Ok
          </Button>
        )
      }
      setState((prevState: ILocalState) => ({ ...prevState, dataDialog }));
    }
  };

  const onConfirmSubmit = async (submit: IRequestContent) => {
    if (submit !== null) {
      const deleteData: DeleteData = {
        deletedByName: props.user?.username,
        deletedById: props.user?.id,
      }
      const confirmedSubmit = await requestContentsApi.confirmById(submit?._id ?? '', deleteData);
      if (confirmedSubmit) {
        if (props.selectedRequest !== null) {
          treeItemOnClick(props.selectedRequest._id);
        }
      }
    }
    handleConfirmSubmit(null);
    props.setSelectedRequestContent(null);
  };

  const handleApproveDialog = (submitId: string | null) => {
    if (submitId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        openApproveDialog: false,
      }));
      if (props.selectedRequest !== null) {
        treeItemOnClick(props.selectedRequest._id);
      }
    } else {
      const filterRequestContent = props.requestContents.filter(ui => ui._id === submitId);
      if (filterRequestContent.length > 0) {
        props.setSelectedRequestContent(filterRequestContent[0]);
        setState((prevState: ILocalState) => ({
          ...prevState,
          openApproveDialog: true,
        }));
      }
    }
  }

  return {
    loadTaskData,
    jumptoFilePath,
    renderRequestsTree,
    handleNewRequestDialog,
    handleSetPermission,
    handleOpenInfoDialog,
    handleDeleteRequest,
    handleCloseRequest,
    handleOpenFilesDialog,
    handleDiscussionsDialog,
    handleNewSubmitDialog,
    handleEditSubmitDialog,
    handleConfirmSubmit,
    handleApproveDialog,
  }
};

const RequestContainer = () => {
  
  let props = requestAttribute();
  const { localState, setLocalState, user } = props;

  let func = requestFunction({props, state: localState, setState: setLocalState});

  useEffect(() => {
    func.loadTaskData();
  }, [user]);

  return (
    <>
      <RequestComponent props={props} func={func}/>
    </>
  )
}

export default RequestContainer;