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
  isEdit: boolean;
  isUpdate: boolean;
  downloadFile: boolean | undefined;
  deleteFile: boolean | undefined;
  handleCopy: VoidFunction;
  //
  onOpenRow: VoidFunction;
  onRenameRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  onFolderVersion: VoidFunction;
  onMoveFolder: VoidFunction;
  onPreviewFile: VoidFunction;
  onMoveFile: VoidFunction;
  onDeleteFile: VoidFunction;
};

export default function FolderFilePopupMenu({
  openPopover,
  type,
  data,
  handleClosePopover,
  isEdit,
  isUpdate,
  downloadFile,
  deleteFile,
  handleCopy,
  //
  onOpenRow,
  onRenameRow,
  onPermission,
  onDeleteRow,
  onFolderVersion,
  onMoveFolder,
  onPreviewFile,
  onMoveFile,
  onDeleteFile,
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
        {(type === 'folder') ?
          <MenuItem
            onClick={() => {
              onOpenRow();
              handleClosePopover();
            }}
          >
            <Iconify icon={'bx:folder-open'} />
            {`${translate('cloud.open')}`}
          </MenuItem>
          : null
        }

        {isEdit ?<Divider sx={{ borderStyle: 'dashed' }} /> : null }

        {isEdit ?
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onRenameRow();
            }}
          >
            <Iconify icon={'bx:rename'} />
            {`${translate('cloud.rename')}`}
          </MenuItem>
          : null
        }

        {(isEdit && isUpdate) ?
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onMoveFolder();
            }}
          >
            <Iconify icon={'carbon:folder-move-to'} />
            {`${translate('cloud.move')}`}
          </MenuItem>
          : null
        }
    
        {isEdit ?
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <MenuItem
              onClick={() => {
                handleClosePopover();
                onPermission();
              }}
            >
              <Iconify icon={'icon-park-outline:permissions'} />
              {`${translate('cloud.permission')}`}
            </MenuItem>

            <MenuItem >
              <Iconify icon={'carbon:task-settings'} />
              {`${translate('cloud.properties')}`}
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleClosePopover();
                onFolderVersion();
              }}
            >
              <Iconify icon={'eos-icons:package-upgrade'} />
              {`${translate('cloud.version')}`}
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                onDeleteRow();
                handleClosePopover();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon={'ep:folder-delete'} />
              {`${translate('cloud.delete')}`}
            </MenuItem>

          </> : null 
        }

        {(type === 'file') ?
          <MenuItem
            onClick={() => {
              onPreviewFile();
              handleClosePopover();
            }}
          >
            <Iconify icon={'ic:round-preview'} />
            {`${translate('cloud.preview')}`}
          </MenuItem>
          : null
        }

        {(type === 'file') && downloadFile ? 
          <>
            <MenuItem
              onClick={() => {
                handleClosePopover();
                handleCopy();
              }}
            >
              <Iconify icon="eva:share-fill" />
              {`${translate('cloud.share')}`}
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleClosePopover();
                onMoveFile();
              }}
            >
              <Iconify icon={'carbon:folder-move-to'} />
              {`${translate('cloud.move')}`}
            </MenuItem>

            <Link
              target="_blank"
              href={process.env.REACT_APP_APIURL + '/files/download/' + data._id}
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none !important' }}
            >
              <MenuItem id={ data._id } >
                <Iconify icon={'octicon:download-16'} />
                {`${translate('cloud.download')}`}
              </MenuItem>
            </Link>
          </>
          : null
        }

        {(type === 'file') && deleteFile ? 
          <>
              <Divider sx={{ borderStyle: 'dashed', mt: 1, mb: 1 }} />
              <MenuItem
                onClick={() => {
                  onDeleteFile();
                  handleClosePopover();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon={'ep:document-delete'} />
                {`${translate('cloud.delete')}`}
              </MenuItem>
          </>
          : null
        }
        
      </MenuPopover>
    </>
  );
}
