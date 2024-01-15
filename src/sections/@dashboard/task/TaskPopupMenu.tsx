import React from 'react';
// @mui
import {
  Divider,
  MenuItem,
} from '@mui/material';
// hooks
import { useLocales } from 'src/locales';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
// type
import { IMainTask } from 'src/shared/types/mainTask';
// ----------------------------------------------------------------------

type Props = {
  openPopover: HTMLElement | null;
  data: IMainTask;
  handleClosePopover: VoidFunction;
  //
  onOpenRow: VoidFunction;
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function TaskPopupMenu({
  openPopover,
  data,
  handleClosePopover,
  //
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
}: Props) {
  const { translate } = useLocales();

  return (
    <>
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onOpenRow();
            handleClosePopover();
          }}
        >
          <Iconify icon={'bx:folder-open'} />
          {`${translate('cloud.open')}`}
        </MenuItem>
    
        {data.isEdit ?
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <MenuItem
              onClick={() => {
                handleClosePopover();
                onEditRow();
              }}
            >
              <Iconify icon={'bx:rename'} />
              {`${translate('common.update')}`}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClosePopover();
                onPermission();
              }}
            >
              <Iconify icon={'icon-park-outline:permissions'} />
              {`${translate('cloud.permission')}`}
            </MenuItem>

            {/* <MenuItem >
              <Iconify icon={'carbon:task-settings'} />
              {`${translate('cloud.properties')}`}
            </MenuItem> */}

            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                onDeleteRow();
                handleClosePopover();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon={'material-symbols:delete-outline'} />
              {`${translate('cloud.delete')}`}
            </MenuItem>
            
          </> : null 
        }
        
      </MenuPopover>

    </>
  );
}
