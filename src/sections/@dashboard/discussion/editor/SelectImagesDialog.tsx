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
import { shallow } from 'zustand/shallow';
// enums
import { LogType, TransferType, UserClassEnum } from 'src/shared/enums';
// sections
import StyledTreeFolder from 'src/sections/treeview/StyledTreeFolder';
// type
import { IFileAndFolder, IFolder, IFolderNodeData, IFileAndFolderSearching, IFolderFullData } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// apis 
import foldersApi from 'src/api/foldersApi';
import filesApi from 'src/api/filesApi';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
import FileThumbnail from 'src/components/file-thumbnail';
import FileCard from './FileCard';
import Image from 'src/components/image';
import { UploadFilesDialogs } from '../../file';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
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
  selImage: string | null,
}

interface Props extends DialogProps {
  linkFolderId: string | null;
  open: boolean;
  onClose: VoidFunction;
}

export default function SelectImagesDialog({ linkFolderId, open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const {
    files,
    fileLoading,
    selectedFile,
    selectedFiles,
    setSelectedFiles,
    selectedImagePath,
    setSelectedImagePath,
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
      selectedImagePath: state.selectedImagePath,
      setSelectedImagePath: state.setSelectedImagePath,
      setFileLoading: state.setLoading,
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
    selImage: null,
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
    let uRole = user?.class.uclass;
    if (user?.projectrole === UserClassEnum.Admin) {
      uRole = user?.projectrole;
    }
    const folderFullData: IFolderFullData = await filesApi.getFullFolderData(nodeId, user?.id, uRole);
    
    const selFolderResponse = folderFullData.folder;
    const linkList: IFolder[] = folderFullData.linkList;
    const files = folderFullData.files;
    console.log(files);
    
    
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
      setLocalState((prevState: ILocalState) => ({ ...prevState, folderTree: projectFolderData }));
    }
  }, [
    user,
    localState.selectedFolder,
  ]);

  useEffect(() => {
    getFolderTree();
  }, [user]);

  const onSelectFile = (file: IFile) => {
    let url = process.env.REACT_APP_APIFILE + 'projects/';
    url += (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selImage: url,
    }));
  }

  const handleSelectImage = () => {
    setSelectedImagePath(localState.selImage);
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      selImage: null
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

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({ 
        ...prevState,
        selImage: null
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
      <DialogTitle> {`${translate('discussion.insert_image')}`} </DialogTitle>

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
            <Card sx={{ borderRadius: '10px !important', p: 1, m: 1 }}>
              <Scrollbar sx={{ maxHeight: 300 }}>
                {localState.isSubmitting ? 
                  <LoadingWindow />
                  :
                  <Stack
                    minHeight={214}
                    spacing={1}
                    direction={{ xs: 'row', md: 'column' }}
                    alignItems={{ xs: 'flex-start', md: 'left' }}
                    sx={{ mb: 1 }}
                  >
                    {localState.files && localState.files.filter((e) => (
                      e.storeFile.slice(e.storeFile.lastIndexOf('.')).toLowerCase().includes('jpg') ||
                      e.storeFile.slice(e.storeFile.lastIndexOf('.')).toLowerCase().includes('png') ||
                      e.storeFile.slice(e.storeFile.lastIndexOf('.')).toLowerCase().includes('gif') ||
                      e.storeFile.slice(e.storeFile.lastIndexOf('.')).toLowerCase().includes('webp')
                      )).map((file) => (
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
                }
              </Scrollbar>
            </Card>
          </Grid>
        </Grid>

        {(localState.selImage !== null) ?
            <Stack
                minHeight={140}
                spacing={1}
                direction={{ xs: 'row', md: 'column' }}
                alignItems={{ xs: 'center', md: 'center' }}
            >
                <Card  sx={{ borderRadius: '10px !important', mb: 3 }}>
                    <Image src={localState.selImage} sx={{ height: 140, width: 140 }}/>
                </Card>
            </Stack>
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
          onClick={handleSelectImage}
        >
          {`${translate('task.select')}`}
        </LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
