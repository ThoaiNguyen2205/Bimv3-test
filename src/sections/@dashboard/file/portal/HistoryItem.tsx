// @mui
import {
  Avatar,
  Box,
  ButtonGroup,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Link,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
// hooks
import useResponsive from 'src/hooks/useResponsive';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from 'src/components/menu-popover';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
import { IGroup } from 'src/shared/types/group';
// type
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import { IFile, IFileReqCreate } from 'src/shared/types/file';
import { IUser } from 'src/shared/types/user';
import { fDate } from 'src/utils/formatTime';
import { useState } from 'react';
// apis
import filesApi from 'src/api/filesApi';
import { IFolder } from 'src/shared/types/folder';
// zustand store
import { shallow } from 'zustand/shallow';
import useHistoryFiles from 'src/redux/historyFilesStore';
// ----------------------------------------------------------------------

type Props = {
  file: IFile;
  isUpdate: boolean;
  isDownload: boolean;
  treeItemOnClick: VoidFunction;
  onPreviewFile: VoidFunction;
};

export default function HistoryItem({ file, isUpdate, isDownload, treeItemOnClick, onPreviewFile }: Props) {

  const isDesktop = useResponsive('up', 'lg');
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    historyFiles,
    setHistoryFiles,
  } = useHistoryFiles(
    (state) => ({
      historyFiles: state.datas,
      setHistoryFiles: state.setDatas,
    }),
    shallow
  );

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const reNew = async () => {
    const displayName = file.displayName;
    // const ext = displayName.slice(displayName.lastIndexOf('.') + 1);
    const folderVersion = (file.folder as IFolder).version;
    const param = {
      folder: (file.folder as IFolder)._id,
      displayName: displayName,
    }
    const sameFiles = await filesApi.getAllSameFiles(param);           
    let subver = '01';
    if (sameFiles.length > 0) {
      const newest = sameFiles[0];
      const newsub = parseInt(newest.subVersion) + 1;
      if (newsub < 10) {
        subver = '0' + newsub.toString();
      } else {
        subver = newsub.toString();
      }
    }

    const newFile: IFileReqCreate = {
      project: user?.project._id,
      folder: (file.folder as IFolder)._id,
      displayName: displayName,
      storeFile: file.storeFile,
      size: file.size,
      version: folderVersion,
      convertFile: file.convertFile,
      subVersion: subver,
      updatedBy: user?.id,
    }

    // Tạo mới dữ liệu files
    const newFileResponse = await filesApi.postCreate(newFile);
    if (newFileResponse) {
      const params = {
        folder: (file.folder as IFolder)._id,
        displayName: displayName,
      }
      const files = await filesApi.getAllSameFiles(params);
      setHistoryFiles(files);
      treeItemOnClick();
    }
    
  }

  return (
    <>
      <ListItem
        disableGutters
        sx={{
          flexGrow: 1,
          pr: 1,
          pb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: '#00ab5526',
          px: 2,
          mb: 1,
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ bottom: 8, right: 8, position: 'absolute', zIndex: 2 }} >
          <Stack direction="row" alignItems="center" justifyContent="flex-end" >
            <ButtonGroup>
              {(file.isConfimed !== undefined && file.isConfimed !== null) ? 
                <Tooltip title={`${translate('common.confirmed')}`}>
                  <Iconify color="secondary.main" icon="mdi:approve" width={12} height={12}/>
                </Tooltip>
                : null
              }
              {(file.isApproved !== undefined && file.isApproved !== null) ? 
                <Tooltip title={`${translate('common.approved')}`}>
                  <Iconify color="error.main" icon="carbon:task-approved" width={12} height={12}/>
                </Tooltip>
                : null
              }
            </ButtonGroup>
          </Stack>
        </Stack>

        <Tooltip title={`${(file.updatedBy as IUser).username}`} placement='top'>
          <Avatar
            alt={(file.updatedBy as IUser).username}
            src={process.env.REACT_APP_APIFILE + `/images/${(file.updatedBy as IUser).avatar}`}
            sx={{ width: 50, height: 50 }}
          />
        </Tooltip>

        <ListItemText
          primary={`${file.version}.${file.subVersion}`}
          secondary={`${file.size} (Mb) - ${fDate(file.createdAt)}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2', color: 'primary' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
          sx={{ ml: 3 }}
        />

        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          <IconButton color={'default'} onClick={handleOpenPopover} >
            <Iconify icon="eva:more-vertical-fill" width={18} height={18} />
          </IconButton>
        </Stack>
        
        <MenuPopover
          open={openPopover}
          onClose={handleClosePopover}
          arrow="right-top"
          sx={{ width: 160 }}
        >
          {isUpdate ? 
            <>
              <MenuItem
                onClick={() => {
                  reNew();
                  handleClosePopover();
                }}
              >
                <Iconify icon='icomoon-free:new-tab' />
                {`${translate('cloud.re_new')}`}
              </MenuItem>
              <Divider sx={{ borderStyle: 'dashed' }} />
            </>
            : null
          }

          <MenuItem
            onClick={() => {
              onPreviewFile();
              handleClosePopover();
            }}
          >
            <Iconify icon={'ic:round-preview'} />
            {`${translate('cloud.preview')}`}
          </MenuItem>

          {isDownload ? 
            <Link
              target="_blank"
              href={process.env.REACT_APP_APIURL + '/files/download/' + file._id}
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none !important' }}
            >
              <MenuItem id={ file._id } >
                <Iconify icon={'octicon:download-16'} />
                {`${translate('cloud.download')}`}
              </MenuItem>
            </Link>
            : null
          }

        </MenuPopover>

      </ListItem>
    </>
  );
}
