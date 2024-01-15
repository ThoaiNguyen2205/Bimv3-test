import React, { useEffect, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import {
  Divider,
  MenuItem,
  Link,
} from '@mui/material';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import { useSnackbar } from '../../../../components/snackbar';
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
// ----------------------------------------------------------------------

type Props = {
  openPopover: HTMLElement | null;
  type: string;
  data: IFolder | IFile;
  handleClosePopover: VoidFunction;
  //
  onDeleteRow: VoidFunction;
  onRestoreRow: VoidFunction;
};

export default function TrashPopupMenu({
  openPopover,
  type,
  data,
  handleClosePopover,
  //
  onDeleteRow,
  onRestoreRow,
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
            onRestoreRow();
            handleClosePopover();
          }}
        >
          <Iconify icon={'ic:round-restore'} />
          {`${translate('cloud.restore')}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onDeleteRow();
            handleClosePopover();
          }}
        >
          <Iconify icon={'tabler:trash-off'} />
          {`${translate('cloud.delete_trash')}`}
        </MenuItem>
        
      </MenuPopover>

    </>
  );
}
