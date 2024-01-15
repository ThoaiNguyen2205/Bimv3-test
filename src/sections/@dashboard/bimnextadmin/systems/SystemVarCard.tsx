import { useState } from 'react';
// @mui
import {
  Avatar,
  Card,
  Stack,
  Button,
  Divider,
  MenuItem,
  CardProps,
  IconButton,
  Typography,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import ConfirmDialog from 'src/components/confirm-dialog';
// type
import { ISystem } from 'src/shared/types/system';
// locales
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type LocalState = {
  openPopover: HTMLElement | null,
  openBlock: boolean,
  openDelete: boolean,
  showHover: boolean,
}

// ----------------------------------------------------------------------

interface Props extends CardProps {
  systemVar: ISystem;
  updateSystemVar: VoidFunction;
  setImage: VoidFunction;
  setText: VoidFunction;
  onDeleteItem: VoidFunction;
}

export default function SystemVarCard({ systemVar, updateSystemVar, setImage, setText, onDeleteItem, sx, ...other }: Props) {
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
          <Avatar alt={systemVar.name} src={process.env.REACT_APP_APIFILE + `/images/system-variables.gif`} sx={{ maxWidth: 120, cursor: 'pointer' }} />

          <Stack
            spacing={0}
            direction="column"
            alignItems="left"
          >
            <Typography noWrap variant="inherit" color="primary" sx={{ maxWidth: 180, cursor: 'pointer' }}>
              {systemVar.name}
            </Typography>
            <Typography variant="caption" color="grey.500" sx={{ maxWidth: 180, cursor: 'pointer' }}>
              {systemVar.value}
            </Typography>
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
            updateSystemVar();
          }}
        >
          <Iconify icon="akar-icons:edit" />
          {`${translate('common.modify')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            setImage();
            handleClosePopover();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="uil:image-edit" />
          {`${translate('superadmin.set_images')}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            setText();
            handleClosePopover();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="icon-park-outline:text" />
          {`${translate('superadmin.set_text')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={localState.openDelete}
        onClose={handleCloseDelete}
        title={`${translate('common.user')} ${systemVar.name}`}
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
