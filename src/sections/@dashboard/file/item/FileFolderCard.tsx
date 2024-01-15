import { useEffect, useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  Stack,
  Button,
  Divider,
  MenuItem,
  Checkbox,
  CardProps,
  IconButton,
  Typography,
} from '@mui/material';
// hooks
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// @types
import { IFolderManager } from '../../../../@types/file';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import TextMaxLine from '../../../../components/text-max-line';
import { useSnackbar } from '../../../../components/snackbar';
import ConfirmDialog from '../../../../components/confirm-dialog';
import FolderLinkCard from './FolderLinkCard';
//
import FolderFilePopupMenu from './FolderFilePopupMenu';
import FileThumbnail from 'src/components/file-thumbnail/FileThumbnail';
import { IFolder } from 'src/shared/types/folder';
import foldersApi from 'src/api/foldersApi';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import { IGroup } from 'src/shared/types/group';
import { IFile } from 'src/shared/types/file';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import { useLocales } from 'src/locales';
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
// ----------------------------------------------------------------------

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
  folderNameStyle: object,
  //
  detailsId: string;
};

export default function FileFolderCard({
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
  //
  detailsId,
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
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 2,
          width: 1,
          maxWidth: 222,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...((detailsId === data._id) && {
            bgcolor: 'success.lighter',
          }),
        }}
        onDoubleClick={onOpenRow}
      >
        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        {(showCheckbox || selected) && onSelectRow ? (
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            icon={<Iconify icon="eva:radio-button-off-fill" />}
            checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          />
        ) : (
          <Stack direction="row" alignItems="center" spacing={2} >
            <FileThumbnail file={dataType} sx={{ width: 40, height: 40 }}/>
          </Stack>
        )}

        <Stack
          direction="row"
          alignItems="center"
          sx={{ bottom: 8, right: 8, position: 'absolute' }}
          onClick={handleClick}
        >
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

        <TextMaxLine
          variant={(type === 'folder') ? "h6" : "subtitle2"}
          persistent
          onClick={handleClick}
          sx={{ mt: 1, cursor: 'pointer' }}
        >
          {data.displayName}
        </TextMaxLine>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
          onClick={handleClick}
        >
          <Box> {version} </Box>
          <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }} />
          <Box> {fDate(data.updatedAt)} </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled', mb: 1 }}
          onClick={handleClick}
        >
          {(size !== '...') ?
            <>
              <Box> {`${translate('cloud.size')}: ${size} Mb`} </Box>
            </>
            : null
          }
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled', mb: 1 }}
          onClick={handleClick}
        >
          <AvatarGroup
            max={6}
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
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          {searchMode ? 
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
            : null
          }
        </Stack>
      </Card>

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
