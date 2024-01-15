import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// type
import { IUclass } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
// locales
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type Props = {
  row: IUclass;
  selected: boolean;
  onSelectRow: VoidFunction;
  onAddToGroup: VoidFunction;
  onRemoveGromGroup: VoidFunction;
  onCreateGroup: VoidFunction;
  onSetKeyperson: VoidFunction;
  onBlockRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onAddToGroup,
  onRemoveGromGroup,
  onCreateGroup,
  onSetKeyperson,
  onBlockRow,
  onDeleteRow,
}: Props) {
  const { user, uclass, blockedAt, groupId, groupName, groupTitle, isKey } = row;
  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={(user as IUser).username} src={process.env.REACT_APP_APIFILE + 'images/' + (user as IUser).avatar} />

            <Typography variant="subtitle2" noWrap>
              {(user as IUser).username}
            </Typography>
          </Stack>
        </TableCell>

        {isDesktop ? 
          <>
            <TableCell align="left" sx={{ textTransform: 'capitalize' }}>{(user as IUser).fullname}</TableCell>
            <TableCell align="center" >
              {uclass}
            </TableCell>

            {/* <TableCell align="left" >
              {(user as IUser).email}
            </TableCell> */}
          </>
          :
          null
        }
        

        <TableCell align="center" >
          {groupName ?
            groupName
            :
            '-'
          }
        </TableCell>

        {isDesktop ? 
          <TableCell align="center" >
            {groupTitle ?
              groupTitle
              :
              '-'
            }
          </TableCell>
          :
          null
        }

        <TableCell align="center" >
          <Label
            variant="soft"
            color={(isKey === false || isKey === null || isKey === undefined)  && 'warning' || 'secondary' }
            sx={{ textTransform: 'capitalize' }}
          >
            {(isKey === false || isKey === null || isKey === undefined)  && `${(translate('nav.member'))}` || `${(translate('common.key_person'))}`}
          </Label>
        </TableCell>

        <TableCell align="center">
          <Label
            variant="soft"
            color={(blockedAt === null || blockedAt === undefined)  && 'success' || 'error'}
            sx={{ textTransform: 'capitalize' }}
          >
            {(blockedAt === null || blockedAt === undefined)  && `${(translate('common.unblock'))}` || `${(translate('common.block'))}`}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
      >
        <MenuItem
          onClick={() => {
            onAddToGroup();
            handleClosePopover();
          }}
          // sx={{ color: 'primary.main' }}
        >
          <Iconify icon="ic:twotone-group-add" />
          {`${(translate('common.add_to_group'))}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onCreateGroup();
            handleClosePopover();
          }}
          // sx={{ color: 'primary.main' }}
        >
          <Iconify icon="fluent-mdl2:add-group" />
          {`${(translate('common.create_group'))}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onSetKeyperson();
            handleClosePopover();
          }}
          // sx={{ color: 'secondary.main' }}
        >
          <Iconify icon="fluent:person-key-20-regular" />
          {`${(translate('common.set_keyperson'))}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            onRemoveGromGroup();
            handleClosePopover();
          }}
          // sx={{ color: 'warning.main' }}
        >
          <Iconify icon="mingcute:user-remove-2-line" />
          {`${(translate('common.remove_from_group'))}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            onBlockRow();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="dashicons:remove" />
          {`${(translate('common.block'))}`}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onDeleteRow();
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="clarity:remove-solid" />
          {`${(translate('common.stop_coop'))}`}
        </MenuItem>
        
      </MenuPopover>

    </>
  );
}
