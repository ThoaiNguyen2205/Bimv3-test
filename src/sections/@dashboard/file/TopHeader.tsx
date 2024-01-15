// @mui
import {
  Stack,
  Button,
  Divider,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
// locales
import { useLocales } from 'src/locales';
// useAuth
import { useAuthContext } from 'src/auth/useAuthContext';
// types
import { IFolder } from 'src/shared/types/folder';
import { UserClassEnum } from 'src/shared/enums';

// ----------------------------------------------------------------------

type ILocalState = {
  openPopover: HTMLElement | null;
  uRole: UserClassEnum;
};

interface Props {
  selectedFolder: IFolder | null;
  handleUploadFolder: VoidFunction;
  handleUploadFilesDialog: VoidFunction;
  handleNewFolderDialog: VoidFunction;
  handleExportFolderTemplate: VoidFunction;
  handleImportFoldetTemplateDialog: VoidFunction;
}

export default function TopHeader({
  selectedFolder,
  handleUploadFolder,
  handleUploadFilesDialog,
  handleNewFolderDialog,
  handleExportFolderTemplate,
  handleImportFoldetTemplateDialog,
}: Props) {

  const { translate } = useLocales();
  const { user } = useAuthContext();

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    uRole: UserClassEnum.User,
  });

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  // let uRole = user?.class.uclass;
  // if (user?.projectrole === UserClassEnum.Admin) {
  //   uRole = user?.projectrole;
  // }

  useEffect(() => {
    let uRole = user?.class?.uclass;
    if (user?.projectrole === UserClassEnum.Admin) {
      uRole = user?.projectrole;
    }
    setLocalState((prevState: ILocalState) => ({ ...prevState, uRole: uRole }));
  }, [user]);

  return (
    
    <Stack
      spacing={1}
      direction='row'
      alignItems={{ xs: 'flex-end', md: 'right' }}
      justifyContent="space-between"
      sx={{ mt: 1, mb: 1 }}
    >

      {(selectedFolder?.isEdit || selectedFolder?.isUpdate) ?
        <>
          <Button
            variant="contained"
            startIcon={<Iconify icon="iconamoon:cloud-add-light" />}
            onClick={handleOpenPopover}
          >
            {`${translate('common.add')}`}
          </Button>
        </>
        : null
      }
      
      <MenuPopover
        open={localState.openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 250 }}
      >
        {selectedFolder?.isEdit ?
          <>
            <MenuItem
              onClick={() => {
                handleNewFolderDialog();
                handleClosePopover();
              }}
            >
              <Iconify icon='material-symbols:create-new-folder-rounded' />
              {`${translate('cloud.new_folder')}`}
            </MenuItem>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                handleUploadFolder();
                handleClosePopover();
              }}
            >
              <Iconify icon='mingcute:folder-upload-line' />
              {`${translate('cloud.upload_folder')}`}
            </MenuItem>
          </>
          : null
        }

        {selectedFolder?.isUpdate ?
          <>
            <MenuItem
              onClick={() => {
                handleUploadFilesDialog();
                handleClosePopover();
              }}
            >
              <Iconify icon='mdi:cloud-upload' />
              {`${translate('cloud.upload')}`}
            </MenuItem>
          </>
          : null
        }

        {(localState.uRole === UserClassEnum.Admin) ?
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                handleExportFolderTemplate();
                handleClosePopover();
              }}
            >
              <Iconify icon='mdi:database-export-outline' />
              {`${translate('cloud.export_folder_templates')}`}
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleImportFoldetTemplateDialog();
                handleClosePopover();
              }}
            >
              <Iconify icon='mdi:database-import-outline' />
              {`${translate('cloud.import_folder_templates')}`}
            </MenuItem>
          </>
          : null
        }
        
      </MenuPopover>

    </Stack>

  );
}
