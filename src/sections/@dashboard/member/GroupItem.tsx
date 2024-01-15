// @mui
import {
  Avatar,
  Button,
  IconButton,
  ListItem,
  ListItemText,
  MenuItem,
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
// locales
import { useLocales } from 'src/locales';
// type
import { IGroup } from 'src/shared/types/group';
// zustand
import useGroup from 'src/redux/groupStore';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';
// ----------------------------------------------------------------------

type Props = {
  group: IGroup;
  onEdit: (group: IGroup) => void;
  onDelete: (id: string) => void;
};

export default function GroupItem({ group, onEdit, onDelete }: Props) {

  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();

  const {
    selectedGroup,
  } = useGroup(
    (state) => ({ 
      selectedGroup: state.selectedData,
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
          backgroundColor: (group._id === selectedGroup?._id) ? '#00ab5526' : 'none',
        }}
      >
        <Avatar
          alt={group.groupname}
          src={process.env.REACT_APP_APIFILE + `/images/${group.logo}`}
          sx={{ width: 50, height: 50 }}
        />

        <ListItemText
          primary={`${group.groupname}`}
          secondary={`${group.title}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2', color: 'primary' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
          sx={{ ml: 3 }}
        />

        {isDesktop ?
          <>
            <Button
              size="small"
              color="primary"
              startIcon={<Iconify icon='fluent:note-edit-24-regular' />}
              onClick={() => onEdit(group)}
              sx={{
                flexShrink: 0,
                textTransform: 'unset',
                fontWeight: 'fontWeightMedium',
                '& .MuiButton-endIcon': {
                  ml: 0,
                },
              }}
            >
              {`${translate('common.modify')}`}
            </Button>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon='mdi:remove-circle-outline' />}
              onClick={() => onDelete(group._id)}
              sx={{
                flexShrink: 0,
                textTransform: 'unset',
                fontWeight: 'fontWeightMedium',
                '& .MuiButton-endIcon': {
                  ml: 0,
                },
              }}
            >
              {`${translate('common.delete')}`}
            </Button>
          </>
          :
          <IconButton color={'default'} onClick={handleOpenPopover} >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        }

        <MenuPopover
          open={openPopover}
          onClose={handleClosePopover}
          arrow="right-top"
          sx={{ width: 160 }}
        >
          <MenuItem
            onClick={() => {
              onEdit(group);
              handleClosePopover();
            }}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon='fluent:note-edit-24-regular' />
            {`${translate('common.modify')}`}
          </MenuItem>

          <MenuItem
            onClick={() => {
              onDelete(group._id)
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon='mdi:remove-circle-outline' />
            {`${translate('common.delete')}`}
          </MenuItem>
        </MenuPopover>

      </ListItem>

    </>
  );
}
