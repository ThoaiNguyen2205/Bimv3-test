//react
import { useState, useEffect, useCallback } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  ListItem,
  Typography,
  Tooltip,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content/EmptyContent';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import useFile from 'src/redux/filesStore';
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TaskCategory, TransferType, UserClassEnum } from 'src/shared/enums';
// sections
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
// type
import { IFileAndFolder, IFolder, IFolderNodeData, IFileAndFolderSearching } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// apis 
import foldersApi from 'src/api/foldersApi';
import filesApi from 'src/api/filesApi';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
import FileThumbnail from 'src/components/file-thumbnail';
import FileCard from '../discussion/editor/FileCard';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
import { IForgeObjectReqCreate, IForgeObjectResGetAll, IForgeObject, IForgeObjectData, ICollaborationTaskData } from 'src/shared/types/forgeObject';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import forgesApi from 'src/api/forgesApi';
import { IForgeManifest, IForgeModel } from 'src/shared/types/forgeToken';
import { ImageFiles, CadFiles, ModelFiles, OfficeFiles, GlbFiles } from 'src/sections/utis/FileTypeAccept';

// ----------------------------------------------------------------------
const folderNameStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  minWidth: '50px',
  maxWidth: '150px',
  textOverflow: 'ellipsis',
  alignItems: 'left',
  justifyContent: 'left',
  flexGrow: 1,
}

type ILocalState = {
  files: IFile[],
  selectedFolder: IFolder | null,
  folderTree: IFolderNodeData[],
  searchMode: boolean,
  locations: IFolder[][],
  fLinks: IFolder[],
  isSubmitting: boolean,
  showProgress: boolean,
  fullProgress: number,
  info: string,
}

interface Props extends DialogProps {
  linkFolderId: string | null;
  category: TaskCategory;
  open: boolean;
  onClose: VoidFunction;
}

export default function SelectFilesDialog({ linkFolderId, category, open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const {
    files,
    fileLoading,
    selectedFile,
    selectedFiles,
    setSelectedFiles,
    setFileLoading,
  } = useFile(
    (state) => ({ 
      files: state.datas,
      fileLoading: state.loading,
      selectedFile: state.selectedData,
      selectedFiles: state.selectedFiles,
      setFiles: state.setDatas,
      countFiles: state.countDatas,
      setSelectedFile: state.setSelectedData,
      setSelectedFiles: state.setSelectedFiles,
      setFileLoading: state.setLoading,
    }),
    shallow
  );

  const {
    forgeLoading,
    setForgeLoading,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    selectedObject,
    setSelectedObject,
  } = useForgeViewState(
    (state) => ({
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    files: [],
    selectedFolder: null,
    folderTree: [],
    searchMode: false,
    locations: [],
    fLinks: [],
    isSubmitting: false,
    showProgress: false,
    fullProgress: 0,
    info: '',
  });

  const onLinkClick = async (event: React.MouseEvent<HTMLElement>) => {
    const nodeId = (event.target as Element).id;
    treeItemOnClick(nodeId);
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      searchMode: false,
    }));
  }

  const treeItemOnClick = async (nodeId: string) => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: true,
    }));
    const selFolderResponse = await foldersApi.getReadByIdWithUser(nodeId, user?.id);
    // Tải dữ liệu đường dẫn thư mục
    const path = selFolderResponse.path + selFolderResponse.storeName + '/';
    
    const strs = path.split('/');
    let linkList: IFolder[] = [];
    let temp = strs[0] + '/' + strs[1] + '/';
    for (let i = 2; i < strs.length - 1; i++) {
      const tempFolder = await foldersApi.getFolderByPath(temp, strs[i]);
      if (tempFolder.data.length > 0) {
        const folderData = tempFolder.data[0];
        linkList.push(folderData);
      }
      temp = temp + strs[i] + '/';
    }
    
    // Tải dữ liệu files trong thư mục chọn
    const param = {
      folder: nodeId,
    }
    const files = await filesApi.getAllLastedFilesInFolder(param);
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      files: files,
      fLinks: linkList,
      selectedFolder: selFolderResponse,
      isSubmitting: false,
    }));
  };

  // Render folder tree
  const renderFoldersTree = (treeData: IFolderNodeData[]) => (
    treeData.map((folder) => (
      <StyledTreeFolder
        key={folder.nodeId}
        nodeId={folder.nodeId}
        labelText={folder.label}
        color={'#00AB55'}
        bgColor="#3be79036"
        colorForDarkMode={'#00AB55'}
        bgColorForDarkMode="#3be79036"
        onClick={() => (treeItemOnClick(folder.nodeId))}
      >
        {(folder.children.length > 0) ?
          <>
            {renderFoldersTree(folder.children)}
          </>
          : null
        }
      </StyledTreeFolder>
    ))
  );

  // Load folder tree data base on current user and project
  const getFolderTree = useCallback(async () => {
    if (user === null) return;
    
    // Lấy dữ liệu cây thư mục của dự án theo user
    if (user?.project !== null) {
      setLocalState((prevState: ILocalState) => ({ 
        ...prevState,
        isSubmitting: true,
      }));
      let userRole = UserClassEnum.User;
      if (user?.class.uclass === UserClassEnum.Admin || user?.projectrole === UserClassEnum.Admin) {
        userRole = UserClassEnum.Admin;
      }
      const projectFolderData: IFolderNodeData[] = await foldersApi.getProjectFolderTree(
        user?.customer._id,
        user?.project._id,
        user?.id,
        userRole,
      );
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        folderTree: projectFolderData,
        isSubmitting: false,
      }));
    }
  }, [
    user,
    localState.selectedFolder,
  ]);

  useEffect(() => {
    getFolderTree();
  }, [user]);

  const acceptedFile = (newFile: IFile, acceptList: string[]): boolean => {
    const ext = newFile.displayName.slice(newFile.displayName.lastIndexOf('.') + 1);
    if (acceptList.filter(e => e.includes(ext.toLowerCase())).length > 0) {
      return true;
    } else {
      return false;
    }
  }

  const onSelectFile = (file: IFile) => {
    let checkAccept: boolean = false;
    switch (category)
    {
      case TaskCategory.ImageCollaboration:
        checkAccept = acceptedFile(file, ImageFiles);
        break;
      case TaskCategory.OfficeCollaboration:
        checkAccept = acceptedFile(file, OfficeFiles);
        break;
      case TaskCategory.CadCollaboration:
        checkAccept = acceptedFile(file, CadFiles);
        break;
      case TaskCategory.ModelCollaboration:
        checkAccept = acceptedFile(file, ModelFiles);
        break;
      // case TaskCategory.GlbCollaboration:
      //   checkAccept = acceptedFile(file, GlbFiles);
      //   break;
    }

    if (checkAccept) {
      const fData = selectedFiles.filter(e => e._id === file._id);
      if (fData.length < 1) {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      enqueueSnackbar(`${translate('coordinator.deny_file_format')}`, {variant: "warning"});
    }
  }

  const onRemoveFile = (file: IFile) => {
    const fData = selectedFiles.filter(e => e._id !== file._id);
    setSelectedFiles(fData);
  }

  const transferImage = async (file: IFile) => {
    if (currentTask === null) return;
    // kiểm tra 
    const sameObjs: IForgeObjectResGetAll = await forgeObjectsApi.getAllSameName(currentTask._id, file.displayName);
    let check: boolean = true;
    if (sameObjs.data.length > 0) {
      const lastedForgeObject = sameObjs.data[0];
      if ((lastedForgeObject.file as IFile)._id === file._id) {
        check = false;
      }
    }

    if (check) {
      // Tạo forgeObject liên kết đến file
      const objData: IForgeObjectReqCreate = {
        task: currentTask._id,
        urn: (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile,
        file: file._id,
        text: file.displayName,
        displayName: file.displayName,
        xform: '',
        version: file.version,
        subVersion: file.subVersion,
        checked: true,
        updatedBy: user?.id,
        createdGroup: user?.group._id,
      }
      const newForgeObj = await forgeObjectsApi.postCreate(objData);
    }
  }

  const transferOffice = async (file: IFile) => {
    if (currentTask === null) return;
    // kiểm tra 
    const sameObjs: IForgeObjectResGetAll = await forgeObjectsApi.getAllSameName(currentTask._id, file.displayName);
    let check: boolean = true;
    if (sameObjs.data.length > 0) {
      const lastedForgeObject = sameObjs.data[0];
      if ((lastedForgeObject.file as IFile)._id === file._id) {
        check = false;
      }
    }
    if (check) {
      if (file.convertFile === '') {
        const ext = file.displayName.slice(file.displayName.lastIndexOf('.') + 1);
        if (ext.toLowerCase() !== 'pdf') {
          await forgeObjectsApi.convetOfficeToPdf(file._id);
        }
      }
      
      const urn = (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile;
      const name = urn.slice(0, urn.lastIndexOf('.'));
      const outputPath = name + '.pdf';
      // Tạo forgeObject liên kết đến file
      const objData: IForgeObjectReqCreate = {
        task: currentTask._id,
        urn: outputPath,
        file: file._id,
        text: file.displayName,
        displayName: file.displayName,
        xform: '',
        version: file.version,
        subVersion: file.subVersion,
        checked: true,
        updatedBy: user?.id,
        createdGroup: user?.group._id,
      }
      
      const newForgeObj = await forgeObjectsApi.postCreate(objData);
    }
    
  }

  const transferCadModel = async (file: IFile) => {
    if (currentTask === null) return;
    // kiểm tra 
    const sameObjs: IForgeObjectResGetAll = await forgeObjectsApi.getAllSameName(currentTask._id, file.displayName);
    let check: boolean = true;
    if (sameObjs.data.length > 0) {
      const lastedForgeObject = sameObjs.data[0];
      if ((lastedForgeObject.file as IFile)._id === file._id) {
        check = false;
      }
    }
    if (check) {
      const objData: IForgeObjectReqCreate = {
        task: currentTask._id,
        urn: '',
        file: file._id,
        text: file.displayName,
        displayName: file.displayName,
        xform: '',
        version: file.version,
        subVersion: file.subVersion,
        checked: true,
        updatedBy: user?.id,
        createdGroup: user?.group._id,
      }
      if (file.convertFile === '') {
        const fileData = await filesApi.getReadById(file._id);
        const uploadedFile = (fileData.folder as IFolder).path + (fileData.folder as IFolder).storeName + '/' + fileData.storeFile;

        // Tạo bucket tương ứng thư mục nếu chưa có
        try {
          await forgesApi.getBucketDetails((fileData.folder as IFolder)._id);
        } catch {
          await forgesApi.createBucket((fileData.folder as IFolder)._id);
        }
        
        // Kiểm tra model dã upload lên Forge hay chưa? Nếu chưa upload lên Forge
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          info: 'Đọc dữ liệu chuyển đổi'
        }));
        let urn = '';
        const modelsRes: IForgeModel[] = await forgesApi.getModels((fileData.folder as IFolder)._id);
        for (const bli of modelsRes) {
          if (bli.text === fileData.storeFile) {
            urn = bli.id;
          }
        }
        
        if (urn === '') {
          // Upload to Autodesk Forge:
          const uploadToForge = await forgesApi.uploadLargeModelFromServer({
            bucket: (fileData.folder as IFolder)._id,
            object: fileData.storeFile,
            filepath: uploadedFile
          });
          while (urn === '') {
            const blist = await forgesApi.getModels((fileData.folder as IFolder)._id);
            setLocalState((prevState: ILocalState) => ({
              ...prevState,
              info: localState.info + '.'
            }));
            for (const bli of blist) {
              if (bli.text === fileData.storeFile) {
                urn = bli.id;
              }
            }
          }
        }
        
        if (urn !== '') {
          // Translate model 
          let manifest: IForgeManifest = await forgesApi.getModelManifest(urn);      
          if (manifest.status.toString() !== 'success') {
            await forgesApi.translateModel(urn);
          }

          while (manifest.status.toString() !== 'success' && manifest.status.toString() !== 'failed') {
            manifest = await forgesApi.getModelManifest(urn);
            console.log(manifest);
            
            if (manifest.progress !== undefined) {
              setLocalState((prevState: ILocalState) => ({
                ...prevState,
                info: 'Chuyển đổi ' + manifest.progress.toLowerCase().replace(' complete', '')
              }));
            }
          }
          if (manifest.status.toString() === 'failed') {
            enqueueSnackbar(`${translate('cloud.convert_failed')}`, {
              variant: "error",
              autoHideDuration: 5000,
              anchorOrigin: { vertical: "bottom", horizontal: "center" }
            });
          }
          if (manifest.status.toString() === 'success') {
            await filesApi.updateById(file._id, { convertFile: manifest.urn });
            objData.urn = urn;
          }
        }
      } else {
        objData.urn = file.convertFile;
      }
      
      const newForgeObj = await forgeObjectsApi.postCreate(objData);
    }
    
  }

  const loadTaskData = async () => {
    if (user === null) return;
    let urlParams = new URLSearchParams(window.location.search);
    let taskParam = urlParams.get('task');
    if (taskParam) {
      const taskData: ICollaborationTaskData = await forgeObjectsApi.getCollaborationTaskData(taskParam, user.id, user.class.uclass, user.customer._id);
      setForgeObjectData(taskData.forgeObjectData);
      if (taskData.forgeObjectData.length > 0) {
        setFirstObject(taskData.forgeObjectData[0].forgeObject);
        setSelectedObject(taskData.forgeObjectData[0].forgeObject);
      }
    }
  };

  const handleSelectFiles = async () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: true,
      showProgress: true,
    }));
    let i: number = 1;
    for (const fi of selectedFiles) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        fullProgress: Math.round((100 * i) / (selectedFiles.length -1)),
      }));
      switch (category) {
        case TaskCategory.ImageCollaboration:
          await transferImage(fi);
          break;
        case TaskCategory.OfficeCollaboration:
          await transferOffice(fi);
          break;
        case TaskCategory.CadCollaboration:
          await transferCadModel(fi);
          break;
        case TaskCategory.ModelCollaboration:
          await transferCadModel(fi);
          break;
        // case TaskCategory.GlbCollaboration:
        //   await transferImage(fi);
        //   break;
      }
      i++;
    }
    await loadTaskData();
    setSelectedFiles([]);
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: false,
      showProgress: false,
    }));
    onClose();
  }

  const handleSearch = async () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      isSubmitting: true,
    }));
    var element: HTMLInputElement | null = document.getElementById("searchKey") as HTMLInputElement;
    let key = '';
    if (element !== null)
    {
      key = element.value;
    }

    if (key !== '') {
      const param = {
        project: user?.project._id,
        searchKey: key,
      }
      const searchRes: IFileAndFolderSearching = await filesApi.getSearchAllFolder(user?.id, user?.class.uclass, param);
      if (searchRes.files.length > 0)
      {
        setLocalState((prevState: ILocalState) => ({ 
          ...prevState,
          files: searchRes.files.map((e) => e.file),
          selectedFolder: null,
          searchMode: true,
          locations: searchRes.files.map((e) => e.location),
          isSubmitting: false,
        }));
      }
    }
  }

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      files: [],
      selectedFolder: null,
      selectedFiles: [],
    }));
    onClose();
  }

  const jumpToLinkFolder = () => {
    if (linkFolderId !== null) {
      treeItemOnClick(linkFolderId);
      setLocalState((prevState: ILocalState) => ({ 
        ...prevState,
        searchMode: false,
      }));
    }
  }

  return (
    <Dialog open={open} maxWidth='lg' onClose={onClose} {...other}>
      <DialogTitle> {`${translate('coordinator.select_files_from_cloud')}`} </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} minWidth={800} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6} >
            <Card sx={{ borderRadius: '10px !important', p: 1, m: 1 }}>
              <Scrollbar sx={{ minHeight: 220, maxHeight: 300 }}>
                <TreeView
                  aria-label="doc-categories"
                  defaultExpandIcon={<Iconify icon={'bx:folder'} color="#ffc144" width={24} height={24} />}
                  defaultEndIcon={<Iconify icon={'bxs:folder'} color="#ffc144" width={24} height={24} />}
                  defaultCollapseIcon={<Iconify icon={'bx:folder-open'} color="#ffc144" width={24} height={24} />}
                  sx={{ flexGrow: 1, overflowY: 'auto' }}
                  selected={localState.selectedFolder ? localState.selectedFolder._id : ''}
                  expanded={localState.fLinks.map((e) => e._id)}
                >
                  { renderFoldersTree(localState.folderTree) }
                </TreeView>
              </Scrollbar>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} >
            {localState.isSubmitting ?
              <LoadingWindow />
              :
              <Card sx={{ borderRadius: '10px !important', p: 1, m: 1 }}>
                <Scrollbar sx={{ maxHeight: 300 }}>
                  <Stack
                    minHeight={214}
                    spacing={1}
                    direction={{ xs: 'row', md: 'column' }}
                    alignItems={{ xs: 'flex-start', md: 'left' }}
                    sx={{ mb: 1 }}
                  >
                    {localState.files && localState.files.map((file) => (
                      <FileCard
                        key={file._id}
                        handleClick={onSelectFile}
                        file={file}
                        searchMode={localState.searchMode}
                        location={localState.locations[localState.files.indexOf(file)]}
                        onLinkClick={onLinkClick}
                        folderNameStyle={folderNameStyle}
                      />
                    ))}
                    {(localState.files.length < 1) ?
                      <Box sx={{ width: '100%' }}>
                        <EmptyContent
                          title={`${translate('common.no_data')}`}
                          sx={{
                            '& span.MuiBox-root': { height: 160 },
                          }}
                        />
                      </Box>
                      : null
                    }
                  </Stack>
                </Scrollbar>
              </Card>
            }
          </Grid>
        </Grid>

        {(selectedFiles.length > 0) ? 
          <Card sx={{ borderRadius: '10px !important', p: 1, m: 1, mb: 3 }}>
            {/* <Scrollbar sx={{ minHeight: 60, maxHeight: 125 }}>
              {selectedFiles && selectedFiles.reverse().map((file) => (
                <Stack
                  key={file._id}
                  spacing={1}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'left' }}
                >
                  <IconButton
                    color='error'
                    onClick={() => onRemoveFile(file)}
                  >
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                  <Typography color='primary' variant='subtitle2' sx={{ pt: 1 }}><i>{file.displayName}</i></Typography>
                </Stack>
              ))}
            </Scrollbar> */}
            {localState.showProgress ?
              <Stack sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={localState.fullProgress} color='success'/>
                <Typography variant='caption' sx={{ mt: 1 }} ><i>{`${localState.info}`}</i></Typography>
              </Stack>
              : 
              <Scrollbar sx={{ minHeight: 60, maxHeight: 125 }}>
                {selectedFiles && selectedFiles.reverse().map((file) => (
                  <Stack
                    key={file._id}
                    spacing={1}
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'left' }}
                  >
                    <IconButton
                      color='error'
                      onClick={() => onRemoveFile(file)}
                    >
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                    <Typography color='primary' variant='subtitle2' sx={{ pt: 1 }}><i>{file.displayName}</i></Typography>
                  </Stack>
                ))}
              </Scrollbar>
            }
          </Card>
          : null
        }
        
      </DialogContent>

      <DialogActions>
        {(linkFolderId !== null) ?
          <Tooltip title={`${translate('common.link_folder')}`} placement='top'>
            <LoadingButton
              type="submit"
              variant="outlined"
              loading={localState.isSubmitting}
              onClick={jumpToLinkFolder}
              sx={{ mr: 2 }}
            >
              <Iconify icon="mdi:folder-key-outline" />
            </LoadingButton>
          </Tooltip>
          : null
        }
        <TextField
          id="searchKey"
          size='small'
          label={`${translate('cloud.key')}`}
          sx={{ mr: 2 }}
        />
        <LoadingButton
          type="submit"
          variant="outlined"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="icon-park-outline:search" />}
          onClick={handleSearch}
          sx={{ mr: 30 }}
        >
          {`${translate('common.search')}`}
        </LoadingButton>

        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onCancel}
        >
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:folder-key" />}
          onClick={handleSelectFiles}
        >
          {`${translate('task.select')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
