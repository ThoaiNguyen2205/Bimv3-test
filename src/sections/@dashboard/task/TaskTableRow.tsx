import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { varHover, varTranHover, IconButtonAnimate, varFade } from 'src/components/animate';
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
} from '@mui/material';
// hooks
import useDoubleClick from '../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../hooks/useCopyToClipboard';
// utils
import { fDate } from '../../../utils/formatTime';
import { fData } from '../../../utils/formatNumber';
// @types
import { IFileManager } from '../../../@types/file';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
import { useSnackbar } from '../../../components/snackbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import FileThumbnail from '../../../components/file-thumbnail';
import TaskPopupMenu from './TaskPopupMenu';
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
import { IMainTask } from 'src/shared/types/mainTask';
import { IUser } from 'src/shared/types/user';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Image from 'src/components/image';
import { TaskCategory } from 'src/shared/enums';
import { getLinkFromCategory } from 'src/utils/taskCategoryHelper';
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean,
  hrefLink: string,
}

type Props = {
  category: TaskCategory;
  handleClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  groupsInFoler: IGroupInFolder[];
  openPopover: HTMLElement | null;
  data: IMainTask;
  handleClosePopover: VoidFunction;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  //
  selected: boolean;
  //
  onOpenRow: VoidFunction;
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  //
  detailsId: string;
};

export default function TaskTableRow({
  category,
  //
  handleClick,
  groupsInFoler,
  openPopover,
  data,
  handleClosePopover,
  handleOpenPopover,
  //
  selected,
  //
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  detailsId,
}: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
    hrefLink: '',
  });

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  useEffect(() => {
    const link = getLinkFromCategory(category, data._id);
    setLocalState((prevState: ILocalState) => ({ ...prevState, hrefLink: link }));
  }, []);

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
          ...((localState.showCheckbox || selected) && {
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
            p: 1,
          }}
          onClick={onOpenRow}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ cursor: 'pointer' }}>
            <Image alt={data.category} src={process.env.REACT_APP_APIFILE + 'images/' + data.logo} sx={{ width: 45, height: 45, borderRadius: 1 }} />
            <Typography noWrap variant="inherit" sx={{ maxWidth: 260, cursor: 'pointer' }} color='primary.main'>
              {data.name}
            </Typography>
          </Stack>
        </TableCell>
          

        <TableCell
          align="left"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          <Typography noWrap variant="inherit" sx={{ maxWidth: 260, cursor: 'pointer' }}>
            {data.description}
          </Typography>
        </TableCell>

        {data.category.includes('Collaboration') ? 
          <TableCell
          align="left"
            onClick={handleClick}
            onDoubleClick={onOpenRow}
          >
            <Stack direction="row" alignItems="center" >
              <Avatar alt={data.category} src={process.env.REACT_APP_APIFILE + 'images/' + data.attach} sx={{ width: 40, height: 40, cursor: 'pointer' }}/>
            </Stack>
          </TableCell>
          : null
        }

        <TableCell
          align="center"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          <Box alignItems="center" alignContent="center" textAlign="center" alignSelf="center">
            <Stack direction="row" alignItems="center" alignContent="center" textAlign="center" alignSelf="center">
              {data.isEdit ?
                <Tooltip title={`${translate('common.edit')}`} placement='top'>
                  <Iconify icon="iconamoon:edit-fill" color='primary.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {data.isUpdate ? 
                <Tooltip title={`${translate('common.update')}`} placement='top'>
                  <Iconify icon="dashicons:update" color='info.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {data.isDownload ? 
                <Tooltip title={`${translate('common.download')}`} placement='top'>
                  <Iconify icon="ic:round-download" color='warning.main' width={12} height={12} />
                </Tooltip>
                : null
              }
              {data.isConfirm ? 
                <Tooltip title={`${translate('common.confirm')}`} placement='top'>
                  <Iconify icon="mdi:approve" color='secondary.light' width={12} height={12} />
                </Tooltip>
                : null
              }
              {data.isApprove ? 
                <Tooltip title={`${translate('common.approve')}`} placement='top'>
                  <Iconify icon="carbon:task-approved" color='error.main' width={12} height={12} />
                </Tooltip>
                : null
              }
            </Stack>
          </Box>
        </TableCell>

        <TableCell
          align="left"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title={(data.createdBy as IUser).username} placement='top'>
              <Avatar alt={(data.createdBy as IUser).username} src={process.env.REACT_APP_APIFILE + 'images/' + (data.createdBy as IUser).avatar} />
            </Tooltip>
            <Typography noWrap variant="caption" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {(data.createdGroup as IGroup).groupname}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell
          align="center"
          onClick={handleClick}
          onDoubleClick={onOpenRow}
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography noWrap variant="caption" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {fDate(data?.updatedAt)}
            </Typography>
          </Stack>
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

      <TaskPopupMenu 
        openPopover={openPopover}
        data={data}
        handleClosePopover={handleClosePopover}
        //
        onOpenRow={onOpenRow}
        onEditRow={onEditRow}
        onPermission={onPermission}
        onDeleteRow={onDeleteRow}
      />

    </>
  );
}
