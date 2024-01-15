import { useReducer, useState } from 'react';
// @mui
import {
  Avatar,
  Box,
  Card,
  Stack,
  Button,
  Divider,
  MenuItem,
  CardProps,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import ConfirmDialog from 'src/components/confirm-dialog';
// type
import { IUser } from 'src/shared/types/user';
// locales
import { useLocales } from 'src/locales';
// enums
import { UserStatusEnum, UserRoleEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

type LocalState = {
  openPopover: HTMLElement | null,
  openBlock: boolean,
  openDelete: boolean,
  showHover: boolean,
}

// ----------------------------------------------------------------------

interface Props extends CardProps {
  user: IUser;
  openClass: VoidFunction;
  onBlockUser: VoidFunction;
  onDeleteItem: VoidFunction;
}

export default function UserCard({ user, openClass, onDeleteItem, onBlockUser, sx, ...other }: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<LocalState>({
    openPopover: null,
    openBlock: false,
    openDelete: false,
    showHover: false,
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

  const handleShowHover = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, showHover: true }));
  };

  const handleHideHover = () => {
    setLocalState((prevState: LocalState) => ({ ...prevState, showHover: false }));
  };

  return (
    <>
      <Card
        onMouseEnter={handleShowHover}
        onMouseLeave={handleHideHover}
        sx={{
          p: 2.5,
          width: 1,
          maxWidth: 222,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...(localState.showHover && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
      >
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
        >
          <Avatar alt={user.username} src={process.env.REACT_APP_APIFILE + `/images/${user.avatar}`} sx={{ maxWidth: 120, cursor: 'pointer' }} />

          <Stack
            spacing={0}
            direction="column"
            alignItems="left"
          >
            <Typography noWrap variant="inherit" color="primary" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {user.username}
            </Typography>
            <Typography noWrap variant="caption" color="text.disabled" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {(user.role === UserRoleEnum.SuperAdmin) ? `${translate('superadmin.superadmin')}` : `${translate('common.user')}`}
            </Typography>
          </Stack>
          
        </Stack>
        

        <Stack
          spacing={0.75}
          direction="column"
          alignItems="left"
          sx={{ typography: 'caption', color: 'text.main', mt: 2 }}
        >

          <Box sx={{alignItems: 'center', color: 'text.primary', display: 'inline-flex',}}>
            <Iconify icon={'mdi:email-seal'} sx={{ mr: 1 }} width={16} height={16}/>
            <Typography noWrap variant="caption" sx={{ maxWidth: 200 }}>
              {`Email: ${user.email}`}
            </Typography>
          </Box>

          <Box textAlign={'right'}>
            <Tooltip title={(user.status === UserStatusEnum.LoggedIn) ? `${translate('common.online')}` : `${translate('common.offline')}`} placement='top'>
              <Iconify
                icon={(user.status === UserStatusEnum.LoggedIn) ? 'mdi:account-online-outline' : 'mdi:user-block-outline'}
                sx={{
                  mt: 1,
                  mr: 3,
                  width: 20,
                  height: 20,
                  color: 'success.main',
                  ...(!(user.status === UserStatusEnum.LoggedIn) && { color: 'warning.main' }),
                }}
              />
            </Tooltip>
            <Tooltip title={user.active ? `${translate('common.active')}` : `${translate('common.unactive')}`} placement='top'>
              <Iconify
                icon={user.active ? 'eva:checkmark-circle-fill' : 'eva:clock-outline'}
                sx={{
                  mt: 1,
                  mr: 3,
                  width: 20,
                  height: 20,
                  color: 'success.main',
                  ...(!user.active && { color: 'warning.main' }),
                }}
              />
            </Tooltip>
            <Tooltip title={(user.blockedAt === null) ? `${translate('common.unblock')}` : `${translate('common.block')}`} placement='top'>
              <Iconify
                icon={(user.blockedAt === null) ? 'material-symbols:supervised-user-circle' : 'material-symbols:supervised-user-circle-off'}
                sx={{
                  mt: 1,
                  width: 20,
                  height: 20,
                  color: 'success.main',
                  ...(!(user.blockedAt === null) && { color: 'warning.main' }),
                }}
              />
            </Tooltip>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          <IconButton color={localState.openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Card>

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
        title={`${translate('common.user')} ${user.username}`}
        content={(user.blockedAt === null || user.blockedAt === undefined) ? `${translate('common.block_confirm')} ${translate('common.block')}?` : `${translate('common.block_confirm')} ${translate('common.unblock')}?`}
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
        title={`${translate('common.user')} ${user.username}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleCloseDelete();
            onDeleteItem();
          }}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />

    </>
  );
}
