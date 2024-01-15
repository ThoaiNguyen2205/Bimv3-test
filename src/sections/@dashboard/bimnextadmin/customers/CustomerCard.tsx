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
  Typography,
  Tooltip,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
// type
import { ICustomer, ICustomerResGetAll, ICustomerReqCreate } from 'src/shared/types/customer';
// locales
import { useLocales } from 'src/locales';
//
import CustomerAppsDialog from './CustomerAppsDialog';
import CustomerContractDialog from './CustomerContractDialog';
import { IUser } from 'src/shared/types/user';
import { Exo_2 } from '@next/font/google';
// ----------------------------------------------------------------------

type LocalState = {
  openPopover: HTMLElement | null,
  openDelete: boolean,
  openBlock: boolean,
  showHover: boolean,
}

interface Props extends CardProps {
  customer: ICustomer;
  onUpdateCustomer: VoidFunction;
  onDeleteCustomer: VoidFunction;
  onBlockCustomer: VoidFunction;
  openContracts: VoidFunction;
  openApps: VoidFunction;
}

export default function CustomerCard({ customer, onUpdateCustomer, onDeleteCustomer, onBlockCustomer, openContracts, openApps, sx, ...other }: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<LocalState>({
    openPopover: null,
    openDelete: false,
    openBlock: false,
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
          <Avatar alt={customer.shortName} src={process.env.REACT_APP_APIFILE + `/images/${customer.logo}`} sx={{ maxWidth: 120, cursor: 'pointer' }} />

          <Stack
            spacing={0}
            direction="column"
            alignItems="left"
          >
            <Typography noWrap variant="inherit" color="primary" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {customer.shortName}
            </Typography>
            <Typography noWrap variant="caption" color="text.disabled" sx={{ maxWidth: 100, cursor: 'pointer' }}>
              {customer.name}
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
              {`Email: ${customer.contactEmail}`}
            </Typography>
          </Box>
          <Box sx={{alignItems: 'center', color: 'text.primary', display: 'inline-flex',}}>
            <Iconify icon={'fluent:person-20-regular'} sx={{ mr: 1 }} width={16} height={16}/>
            <Typography noWrap variant="caption" sx={{ maxWidth: 200 }}>
              {`${translate('common.contact')}: ${customer.contactPerson}`}
            </Typography>
          </Box>
          <Box sx={{alignItems: 'center', color: 'text.primary', display: 'inline-flex',}}>
            <Iconify icon={'carbon:phone'} sx={{ mr: 1 }} width={16} height={16}/>
            <Typography noWrap variant="caption" sx={{ maxWidth: 200 }}>
              {`${translate('common.phone')}: ${customer.phone}`}
            </Typography>
          </Box>
          <Box sx={{alignItems: 'center', color: 'text.primary', display: 'inline-flex',}}>
            <Iconify icon={'solar:tag-linear'} sx={{ mr: 1 }} width={16} height={16}/>
            <Typography noWrap variant="caption" sx={{ maxWidth: 200 }}>
              {`${translate('common.taxcode')}: ${customer.taxCode}`}
            </Typography>
          </Box>

          <Stack
            spacing={2.5}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 5 }}
          >
            <Stack
              spacing={1}
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ md: 'center' }}
              sx={{ width: 1 }}
            >
              <Box sx={{alignItems: 'center', display: 'inline-flex',}}>
                {/* <Iconify icon={'icon-park-outline:add-two'} sx={{ mr: 1 }} width={16} height={16}/> */}
                <Typography noWrap variant="caption" color="primary" sx={{ maxWidth: 200 }}>
                  {`${translate('common.createdby')}: ${(customer.createdBy as IUser).username}`}
                </Typography>
              </Box>
            </Stack>
            <Box textAlign={'right'}>
              <Tooltip title={(customer.blockedAt === null || customer.blockedAt === undefined) ? `${translate('common.unblock')}` : `${translate('common.block')}`} placement='top'>
                <Iconify
                  icon={(customer.blockedAt === null || customer.blockedAt === undefined) ? 'mdi:lock-open-check-outline' : 'fluent:lock-closed-key-16-regular'}
                  sx={{
                    mt: 1,
                    width: 24,
                    height: 24,
                    color: 'success.main',
                    ...(!(customer.blockedAt === null || customer.blockedAt === undefined) && { color: 'warning.main' }),
                  }}
                />
              </Tooltip>
            </Box>
          </Stack>
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
            onUpdateCustomer();
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
        title={`${translate('common.customer')} ${customer.name}`}
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
        title={`${translate('common.customer')} ${customer.name}`}
        content={(customer.blockedAt === null || customer.blockedAt === undefined) ? `${translate('common.block_confirm')} ${translate('common.block')}?` : `${translate('common.block_confirm')} ${translate('common.unblock')}?`}
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
