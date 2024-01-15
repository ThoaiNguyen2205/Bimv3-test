import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Divider,
  TableRow,
  MenuItem,
  TableCell,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';

// type
import { IUser } from 'src/shared/types/user';
// locales
import { useLocales } from 'src/locales';

// zustand
import useUser from 'src/redux/userStore';
import { shallow } from 'zustand/shallow';
// enums
import { UserRoleEnum, UserStatusEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type LocalState = {
  openPopover: HTMLElement | null,
  openBlock: boolean,
  openDelete: boolean,
}

// ----------------------------------------------------------------------

type Props = {
  row: IUser;
  openClass: VoidFunction; 
  onBlockUser: VoidFunction; 
  onDeleteRow: VoidFunction;
};

// ----------------------------------------------------------------------

export default function UserTableRow({ row, openClass, onBlockUser, onDeleteRow }: Props) {
  const { id, avatar, username, email, role, status, active, blockedAt } = row;
  
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<LocalState>({
    openPopover: null,
    openBlock: false,
    openDelete: false,
  });
  
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };
  
  const handleClosePopover = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openPopover: null }));
  };

  const handleOpenDelete = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openDelete: true }));
  };
  const handleCloseDelete = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openDelete: false }));
  };

  const handleOpenBlock = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openBlock: true }));
  };
  const handleCloseBlock = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, openBlock: false }));
  };

  return (
    <>
      <TableRow
        sx={{
          borderRadius: 2,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
        }}
      >

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={username} src={process.env.REACT_APP_APIFILE + `/images/${avatar}`} sx={{ maxWidth: 120, cursor: 'pointer' }} />
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 200, cursor: 'pointer' }}>
              {username}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 360, cursor: 'pointer' }}>
              {email}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {(role === UserRoleEnum.SuperAdmin) ? `${translate('superadmin.superadmin')}` : `${translate('common.user')}`}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell  align="center">
        <Tooltip title={(status === UserStatusEnum.LoggedIn) ? `${translate('common.online')}` : `${translate('common.offline')}`} placement='top'>
            <Iconify
              icon={(status === UserStatusEnum.LoggedIn) ? 'mdi:account-online-outline' : 'mdi:user-block-outline'}
              sx={{
                mt: 1,
                mr: 3,
                width: 24,
                height: 24,
                color: 'success.main',
                ...(!(status === UserStatusEnum.LoggedIn) && { color: 'warning.main' }),
              }}
            />
          </Tooltip>
        </TableCell>

        <TableCell align="center">
          <Tooltip title={active ? `${translate('common.active')}` : `${translate('common.unactive')}`} placement='top'>
            <Iconify
              icon={active ? 'eva:checkmark-circle-fill' : 'eva:clock-outline'}
              sx={{
                mt: 1,
                width: 24,
                height: 24,
                color: 'success.main',
                ...(!active && { color: 'warning.main' }),
              }}
            />
          </Tooltip>
        </TableCell>

        <TableCell align="center">
          <Tooltip title={(blockedAt === null) ? `${translate('common.unblock')}` : `${translate('common.block')}`} placement='top'>
            <Iconify
              icon={(blockedAt === null) ? 'material-symbols:supervised-user-circle' : 'material-symbols:supervised-user-circle-off'}
              sx={{
                mt: 1,
                width: 24,
                height: 24,
                color: 'success.main',
                ...(!(blockedAt === null) && { color: 'warning.main' }),
              }}
            />
          </Tooltip>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <IconButton color={localState.openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={localState.openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            handleClosePopover();
            openClass();
          }}
        >
          <Iconify icon="icon-park-outline:permissions" />
          {`${translate('common.permission')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleOpenBlock();
            handleClosePopover();
          }}
          sx={{ color: 'warning.main' }}
        >
          <Iconify icon="fluent:lock-closed-key-16-regular" />
          {`${translate('common.block')}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenDelete();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="mdi:user-multiple-remove-outline" />
          {`${translate('common.delete')}`}
        </MenuItem>
      </MenuPopover>

      {/* Confirm Block */}
      <ConfirmDialog
        open={localState.openBlock}
        onClose={handleCloseBlock}
        title={`${translate('common.user')} ${username}`}
        content={(blockedAt === null || blockedAt === undefined) ? `${translate('common.block_confirm')} ${translate('common.block')}?` : `${translate('common.block_confirm')} ${translate('common.unblock')}?`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleCloseBlock();
            onBlockUser();
          }}>
            Ok
          </Button>
        }
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={localState.openDelete}
        onClose={handleCloseDelete}
        title={`${translate('common.user')} ${username}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleCloseDelete();
            onDeleteRow();
          }}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />
    </>
  );
}
