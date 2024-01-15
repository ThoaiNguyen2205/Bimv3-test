import React, { useEffect, useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Stack,
  Avatar,
  Box,
  Button,
  Divider,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  AvatarGroup,
  Link,
} from '@mui/material';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// @types
import { IFileManager } from '../../../../@types/file';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { useSnackbar } from '../../../../components/snackbar';
import ConfirmDialog from '../../../../components/confirm-dialog';
import FileThumbnail from '../../../../components/file-thumbnail';

import FolderLinkCard from './FolderLinkCard';
import FolderFilePopupMenu from './FolderFilePopupMenu';
//
// type
import { IFileOrFolder, IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from 'src/locales';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import { IGroup } from 'src/shared/types/group';
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
  handleClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  dataType: string;
  size: string;
  groupsInFoler: IGroupInFolder[];
  fLinks: IFolder[];
  openPopover: HTMLElement | null;
  type: string;
  data: IFolder | IFile;
  version: string;
  handleClosePopover: VoidFunction;
  isEdit: boolean;
  isUpdate: boolean;
  isDownload: boolean;
  isApprove: boolean;
  isConfirm: boolean;
  downloadFile: boolean | undefined;
  deleteFile: boolean | undefined;
  handleCopy: VoidFunction;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  //
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
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object;
  //
  detailsId: string;
};

export default function FileFolderTableRow({
  detailsId,
  //
  handleClick,
  dataType,
  size,
  groupsInFoler,
  fLinks,
  openPopover,
  type,
  data,
  version,
  handleClosePopover,
  isEdit,
  isUpdate,
  isDownload,
  isApprove,
  isConfirm,
  downloadFile,
  deleteFile,
  handleCopy,
  handleOpenPopover,
  //
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
  onLinkClick,
  folderNameStyle,
}: Props) {
  const { translate } = useLocales();
  const [showCheckbox, setShowCheckbox] = useState(false);

  const handleShowCheckbox = () => {
    setShowCheckbox(true);
  };

  const handleHideCheckbox = () => {
    setShowCheckbox(false);
  };

  return (
    <>
      <TableRow
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          borderRadius: 1,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...((detailsId === data?._id) && {
            '& .MuiTableCell-root': {
              color: 'text.primary',
              bgcolor: 'success.lighter',
            },
          }),
        }}
      >
        <TableCell
          padding="checkbox"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
          onDoubleClick={onOpenRow}
        >
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell
          padding="checkbox"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <FileThumbnail file={dataType} />

            <Typography noWrap variant="inherit" sx={{ maxWidth: 180, cursor: 'pointer' }}>
              {data?.displayName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell
          align="left"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {size}
        </TableCell>

        <TableCell
          align="center"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap', maxWidth: 60 }}
        >
          <Box alignItems="center" alignContent="center" textAlign="center" alignSelf="center">
            <Stack direction="row" alignItems="center" alignContent="center" textAlign="center" alignSelf="center">
              {isEdit ?
                <Tooltip title={`${translate('common.edit')}`} placement='top'>
                  <Iconify icon="iconamoon:edit-fill" color='primary.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {isUpdate ? 
                <Tooltip title={`${translate('common.update')}`} placement='top'>
                  <Iconify icon="dashicons:update" color='info.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {isDownload ? 
                <Tooltip title={`${translate('common.download')}`} placement='top'>
                  <Iconify icon="ic:round-download" color='warning.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {isConfirm ? 
                <Tooltip title={`${translate('common.confirm')}`} placement='top'>
                  <Iconify icon="mdi:approve" color='secondary.light' width={12} height={12} />
                </Tooltip>
                : null
              }
              {isApprove ? 
                <Tooltip title={`${translate('common.approve')}`} placement='top'>
                  <Iconify icon="carbon:task-approved" color='error.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              
            </Stack>
            {(type === 'file') ? dataType : null}
          </Box>
        </TableCell>

        <TableCell
          align="center"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap', minWidth: 120, }}
        >
          {version}
        </TableCell>

        <TableCell
          align="left"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          {fDate(data?.updatedAt)}
        </TableCell>

        <TableCell align="right" onClick={handleClick} onDoubleClick={onOpenRow}>
          <AvatarGroup
            max={4}
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
            {groupsInFoler &&
              groupsInFoler.map((group) => (
                <Avatar key={group._id} alt={(group.group as IGroup).groupname} src={process.env.REACT_APP_APIFILE + 'images/' + (group.group as IGroup).logo} />
              ))}
          </AvatarGroup>
        </TableCell>

        {searchMode ? 
          <TableCell
            align="right"
            onDoubleClick={onOpenRow}
            sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
          >
            <HtmlTooltip
              title={
                <FolderLinkCard fLinks={fLinks} onLinkClick={onLinkClick} folderNameStyle={folderNameStyle} searchMode={searchMode} />
              }
              placement='left'
              arrow
            >
              {(fLinks?.length > 0) ?
                <Button id={fLinks[fLinks.length - 1]._id} variant='outlined' color='success' onClick={onLinkClick} >
                  <Typography id={fLinks[fLinks.length - 1]._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                    {fLinks[fLinks.length - 1].displayName}
                  </Typography>
                </Button>
                : <> </>
              }
              
            </HtmlTooltip>
          </TableCell>
          : null
        }

        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <FolderFilePopupMenu 
        openPopover={openPopover}
        type={type}
        data={data}
        handleClosePopover={handleClosePopover}
        isEdit={isEdit}
        isUpdate={isUpdate}
        downloadFile={downloadFile}
        deleteFile={deleteFile}
        handleCopy={handleCopy}
        //
        onOpenRow={onOpenRow}
        onRenameRow={onRenameRow}
        onPermission={onPermission}
        onDeleteRow={onDeleteRow}
        onFolderVersion={onFolderVersion}
        onMoveFolder={onMoveFolder}
        onPreviewFile={onPreviewFile}
        onMoveFile={onMoveFile}
        onDeleteFile={onDeleteFile}
      />

    </>
  );
}
