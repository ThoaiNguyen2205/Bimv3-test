import React, { useEffect, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// components
import { useSnackbar } from '../../../../components/snackbar';
//
import FileFolderTableRow from './FileFolderTableRow';
import FileFolderCard from './FileFolderCard';
// type
import { IFileOrFolder, IFolder, IFileAndFolderSearching } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from 'src/locales';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import foldersApi from 'src/api/foldersApi';

import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '100vw',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    alignItems: 'center',
    zIndex: 98,
  },
}));

type Props = {
  rowType: string;
  row: IFileOrFolder;
  selected: boolean;
  onSelectRow: VoidFunction;
  onOpenRow: VoidFunction;
  onRenameRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  onFolderVersion: VoidFunction;
  onMoveFolder: VoidFunction;
  onPreviewFile: VoidFunction;
  onMoveFile: VoidFunction;
  onDeleteFile: VoidFunction;
  //
  searchMode: boolean;
  searchRes: IFileAndFolderSearching | null;
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object;
  //
  detailsId: string;
  onDetails: VoidFunction;
};

type ILocalState = {
  openPopover: HTMLElement | null;
  groupsInFoler: IGroupInFolder[];
  fLinks: IFolder[];
};

export default function FileFolderComponent({
  rowType,
  row,
  selected,
  onSelectRow,
  onOpenRow,
  onRenameRow,
  onPermission,
  onDeleteRow,
  onFolderVersion,
  onMoveFolder,
  onPreviewFile,
  onMoveFile,
  onDeleteFile,
  //
  searchMode,
  searchRes,
  onLinkClick,
  folderNameStyle,
  //
  detailsId,
  onDetails,
}: Props) {
  const { translate } = useLocales();
  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const { type, data } = row;
  // Folder:
  // const displayName = (type === 'folder') ? (data as IFolder).displayName : (data as IFile)?.displayName;
  // const updatedAt = (type === 'folder') ? (data as IFolder).updatedAt : (data as IFile)?.updatedAt;
  const size = (type === 'folder') ? '...' : (data as IFile).size;
  const version = (type === 'folder') ? (data as IFolder).version : `${(data as IFile)?.version}.${(data as IFile)?.subVersion}`;
  
  const isEdit = (type === 'folder') ? (data as IFolder).isEdit : false;
  const isUpdate = (type === 'folder') ? (data as IFolder).isUpdate : false;
  const isDownload = (type === 'folder') ? (data as IFolder).isDownload : false;
  const isApprove = (type === 'folder') ? (data as IFolder).isApprove : false;
  const isConfirm = (type === 'folder') ? (data as IFolder).isConfirm : false;
  // Files:
  const downloadFile = selectedFolder?.isDownload;
  const deleteFile = selectedFolder?.isEdit;

  const isShared = (type === 'folder') ? (data as IFolder)?.isShared : (data as IFile)?.isShared;

  let dataType = 'folder';
  if (type === 'file') {
    const fi = data as IFile;
    const storeFile = fi.storeFile;
    const dotIndex = storeFile.lastIndexOf('.');
    dataType = storeFile.substring(dotIndex + 1);
  }

  const { enqueueSnackbar } = useSnackbar();
  const { copy } = useCopyToClipboard();

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    groupsInFoler: [],
    fLinks: [],
  });

  useEffect(() => {
    const loadPermitsAndLocations = async () => {
      if (type === 'folder') {
        const params = {
          folder: (data as IFolder)?._id,
        }
        const groupsInProjectRes = await groupInFoldersApi.getGroupsInFolder(params);

        if (searchRes !== null) {
          const folders = searchRes.folders.map((e) => e.folder);
          const folderLocations = searchRes.folders.map((e) => e.location);
          const location = folderLocations[folders.indexOf(data as IFolder)];
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            groupsInFoler: groupsInProjectRes.data,
            fLinks: location,
          }));
        }
        else {
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            groupsInFoler: groupsInProjectRes.data,
          }));
        }
      } else {
        if (searchRes !== null) {
          const files = searchRes.files.map((e) => e.file);
          const fileLocations = searchRes.files.map((e) => e.location);
          const location = fileLocations[files.indexOf(data as IFile)];
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            fLinks: location,
          }));
        }
      }
    }
    loadPermitsAndLocations();    
  }, [data]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  const handleClick = useDoubleClick({
    click: () => {
      onDetails();
    },
    doubleClick: () => console.log('DOUBLE CLICK'),
  });

  const handleCopy = () => {
    enqueueSnackbar(`${translate('cloud.copied_link')}`, {variant: "info"});
    copy(process.env.REACT_APP_APIURL + '/files/download/' + data._id);
  };

  return (
    <>
      {(rowType === 'table') ?
        <FileFolderTableRow
          handleClick={handleClick}
          dataType={dataType}
          size={size}
          groupsInFoler={localState.groupsInFoler}
          fLinks={localState.fLinks}
          openPopover={localState.openPopover}
          type={type}
          data={data}
          version={version}
          handleClosePopover={handleClosePopover}
          isEdit={isEdit}
          isUpdate={isUpdate}
          isDownload={isDownload}
          isApprove={isApprove}
          isConfirm={isConfirm}
          downloadFile={downloadFile}
          deleteFile={deleteFile}
          handleCopy={handleCopy}
          handleOpenPopover={handleOpenPopover}
          selected={selected}
          onSelectRow={onSelectRow}
          onOpenRow={onOpenRow}
          onRenameRow={onRenameRow}
          onPermission={onPermission}
          onDeleteRow={onDeleteRow}
          onFolderVersion={onFolderVersion}
          onMoveFolder={onMoveFolder}
          onPreviewFile={onPreviewFile}
          onMoveFile={onMoveFile}
          onDeleteFile={onDeleteFile}
          //
          searchMode={searchMode}
          onLinkClick={onLinkClick}
          folderNameStyle={folderNameStyle}
          //
          detailsId={detailsId}
        />
        :
        <FileFolderCard
          handleClick={handleClick}
          dataType={dataType}
          size={size}
          groupsInFoler={localState.groupsInFoler}
          fLinks={localState.fLinks}
          openPopover={localState.openPopover}
          type={type}
          data={data}
          version={version}
          handleClosePopover={handleClosePopover}
          isEdit={isEdit}
          isUpdate={isUpdate}
          isDownload={isDownload}
          isApprove={isApprove}
          isConfirm={isConfirm}
          downloadFile={downloadFile}
          deleteFile={deleteFile}
          handleCopy={handleCopy}
          handleOpenPopover={handleOpenPopover}
          selected={selected}
          onSelectRow={onSelectRow}
          onOpenRow={onOpenRow}
          onRenameRow={onRenameRow}
          onPermission={onPermission}
          onDeleteRow={onDeleteRow}
          onFolderVersion={onFolderVersion}
          onMoveFolder={onMoveFolder}
          onPreviewFile={onPreviewFile}
          onMoveFile={onMoveFile}
          onDeleteFile={onDeleteFile}
          //
          searchMode={searchMode}
          onLinkClick={onLinkClick}
          folderNameStyle={folderNameStyle}
          //
          detailsId={detailsId}
        />
      }

    </>
  );
}
