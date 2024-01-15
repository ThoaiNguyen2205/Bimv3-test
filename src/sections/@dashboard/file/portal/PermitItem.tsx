// @mui
import {
  Avatar,
  Box,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
} from '@mui/material';
// hooks
import useResponsive from 'src/hooks/useResponsive';
// components
import Iconify from '../../../../components/iconify';
// locales
import { useLocales } from 'src/locales';
import { IGroup } from 'src/shared/types/group';
// type
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
// ----------------------------------------------------------------------

type Props = {
  groupInFolder: IGroupInFolder;
};

export default function PermitItem({ groupInFolder }: Props) {

  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();
  
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
        <Avatar
          alt={(groupInFolder.group as IGroup).groupname}
          src={process.env.REACT_APP_APIFILE + `/images/${(groupInFolder.group as IGroup).logo}`}
          sx={{ width: 50, height: 50 }}
        />

        <ListItemText
          primary={`${(groupInFolder.group as IGroup).groupname}`}
          secondary={`${(groupInFolder.group as IGroup).title}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2', color: 'primary' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
          sx={{ ml: 3 }}
        />

        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
          {groupInFolder.isEdit ?
            <Tooltip title={`${translate('common.edit')}`} placement='top'>
              <Iconify icon="iconamoon:edit-fill" color='primary.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {groupInFolder.isUpdate ? 
            <Tooltip title={`${translate('common.update')}`} placement='top'>
              <Iconify icon="dashicons:update" color='info.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {groupInFolder.isDownload ? 
            <Tooltip title={`${translate('common.download')}`} placement='top'>
              <Iconify icon="ic:round-download" color='warning.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {groupInFolder.isConfirm ? 
            <Tooltip title={`${translate('common.confirm')}`} placement='top'>
              <Iconify icon="mdi:approve" color='secondary.light' width={12} height={12} />
            </Tooltip>
            : null
          }
          {groupInFolder.isApprove ? 
            <Tooltip title={`${translate('common.approve')}`} placement='top'>
              <Iconify icon="carbon:task-approved" color='error.main' width={12} height={12} />
            </Tooltip>
            : null
          }
        </Stack>
        

      </ListItem>
    </>
  );
}
