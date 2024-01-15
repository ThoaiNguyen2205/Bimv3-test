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
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
// type
import { ICustomer } from 'src/shared/types/customer';
// locales
import { useLocales } from 'src/locales';

// import { eventReducer, CustomerActions } from './CustomerItemState';
import { IUser } from 'src/shared/types/user';
// ----------------------------------------------------------------------

type LocalState = {
  openPopover: HTMLElement | null,
  openDelete: boolean,
  openBlock: boolean,
}

type Props = {
  row: ICustomer;
  showUpdateCustomer: VoidFunction;
  onDeleteCustomer: VoidFunction;
  onBlockCustomer: VoidFunction;
  openContracts: VoidFunction;
  openApps: VoidFunction;
};

export default function CustomerTableRow({ row, showUpdateCustomer, onDeleteCustomer, onBlockCustomer, openContracts, openApps }: Props) {
  const { _id, name, shortName, address, contactPerson, contactEmail, phone, taxCode, logo, createdBy, blockedAt } = row;
  
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const [localState, setLocalState] = useState<LocalState>({
    openPopover: null,
    openDelete: false,
    openBlock: false,
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
            <Avatar alt={logo} src={process.env.REACT_APP_APIFILE + `/images/${logo}`} sx={{ maxWidth: 120, cursor: 'pointer' }} />
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 360, cursor: 'pointer' }}>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {shortName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {contactPerson}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {contactEmail}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {phone}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {taxCode}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="left" spacing={2}>
            <Typography noWrap variant="inherit" sx={{ maxWidth: 120, cursor: 'pointer' }}>
              {(createdBy as IUser).username}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell  align="center">
          <Tooltip title={(blockedAt === null || blockedAt === undefined) ? `${translate('common.unblock')}` : `${translate('common.block')}`} placement='top'>
            <Iconify
              icon={(blockedAt === null || blockedAt === undefined) ? 'mdi:lock-open-check-outline' : 'fluent:lock-closed-key-16-regular'}
              sx={{
                mt: 1,
                width: 24,
                height: 24,
                color: 'success.main',
                ...(!(blockedAt === null || blockedAt === undefined) && { color: 'warning.main' }),
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
            showUpdateCustomer();
          }}
        >
          <Iconify icon="fa:edit" />
          {`${translate('common.modify')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            openContracts();
            handleClosePopover();
          }}
        >
          <Iconify icon="clarity:contract-line" />
          {`${translate('superadmin.contracts')}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            openApps();
            handleClosePopover();
          }}
        >
          <Iconify icon="eos-icons:application-outlined" />
          {`${translate('superadmin.app')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* onBlockCustomer */}
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
          <Iconify icon="material-symbols:bookmark-remove" />
          {`${translate('common.delete')}`}
        </MenuItem>

      </MenuPopover>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={localState.openDelete}
        onClose={handleCloseDelete}
        title={`${translate('common.customer')} ${name}`}
        content={`${translate('common.delete_confirm')}`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleCloseDelete();
            onDeleteCustomer();
          }}>
            {`${translate('common.delete')}`}
          </Button>
        }
      />

      {/* Confirm Block */}
      <ConfirmDialog
        open={localState.openBlock}
        onClose={handleCloseBlock}
        title={`${translate('common.customer')} ${name}`}
        content={(blockedAt === null || blockedAt === undefined) ? `${translate('common.block_confirm')} ${translate('common.block')}?` : `${translate('common.block_confirm')} ${translate('common.unblock')}?`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleCloseBlock();
            onBlockCustomer();
          }}>
            Ok
          </Button>
        }
      />

    </>
  );
}
