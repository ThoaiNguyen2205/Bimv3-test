import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  Tooltip,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// type
import { IUser } from 'src/shared/types/user';
import { IProject } from 'src/shared/types/project';
// components
import Label from '../../../components/label';
import Image from '../../../components/image';
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
// locales
import { useLocales } from '../../../locales';
import { IProjectCategory } from '../../../shared/types/projectCategory';

import { useAuthContext } from '../../../auth/useAuthContext';
// enums
import { UserClassEnum } from '../../../shared/enums';

// ----------------------------------------------------------------------

type Props = {
  row: IProject;
  selected: boolean;
  onSelectRow: VoidFunction;
  onOpenInfo: VoidFunction;
  onEditProject: VoidFunction;
  onSetPermission: VoidFunction;
  // onSetProperties: VoidFunction;
  onBlockRow: VoidFunction;
  onDeleteRow: VoidFunction;
  setDefaultProject: VoidFunction;
};

export default function ProjectTableRow({
  row,
  selected,
  onSelectRow,
  onOpenInfo,
  onEditProject,
  onSetPermission,
  // onSetProperties,
  onBlockRow,
  onDeleteRow,
  setDefaultProject,
}: Props) {
  const { _id, avatar, name, address, description, category, createdBy, blockedAt } = row;
  const isDesktop = useResponsive('up', 'lg');
  const { user } = useAuthContext();
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

        <TableCell align="center">
          <Button onClick={setDefaultProject}>
            <Iconify icon="mingcute:star-fill" width={24} height={24} sx={{ color: (user?.project?._id === row._id) ? 'warning.main' : 'text.disabled' }}/>
          </Button>
        </TableCell>

        <TableCell>
          <Tooltip title={description} placement="top">
            <Stack direction="row" alignItems="center" spacing={2} sx={{ cursor: 'pointer' }} onClick={onOpenInfo} >
              <Image
                alt={''}
                src={process.env.REACT_APP_APIFILE + 'images/' + avatar}
                sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
              />
              <Typography variant="subtitle2" noWrap>
                {name}
              </Typography>
            </Stack>
          </Tooltip>
        </TableCell>

        <TableCell align="center">
          <Tooltip title={(category !== undefined) ? (category as IProjectCategory).name : ''} placement="top">
            <Stack alignItems="center">
              {(category !== undefined) ?
                <Avatar alt={(category as IProjectCategory).name} src={process.env.REACT_APP_APIFILE + 'images/' + (category as IProjectCategory).logo} />
                :
                null
              }
            </Stack>
          </Tooltip>
        </TableCell>

        {isDesktop ? 
          <>
            <TableCell align="left">
              {address}
            </TableCell>            
            <TableCell align="center" >
              <Tooltip title={(createdBy as IUser).username} placement="top">
                <Stack alignItems="center">
                  <Avatar alt={(createdBy as IUser).username} src={process.env.REACT_APP_APIFILE + 'images/' + (createdBy as IUser).avatar} />
                </Stack>
              </Tooltip>
            </TableCell>
          </>
          :
          null
        }
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
            onOpenInfo();
            handleClosePopover();
          }}
        >
          <Iconify icon="fluent:info-12-regular" />
          {`${(translate('projects.information'))}`}
        </MenuItem>
        
        {(user?.class.uclass === UserClassEnum.Admin) ? 
          <>

            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <MenuItem
              onClick={() => {
                onEditProject();
                handleClosePopover();
              }}
            >
              <Iconify icon="bxs:edit" />
              {`${(translate('common.modify'))}`}
            </MenuItem>

            <MenuItem
              onClick={() => {
                onSetPermission();
                handleClosePopover();
              }}
            >
              <Iconify icon="ic:sharp-group-add" />
              {`${(translate('common.permission'))}`}
            </MenuItem>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                // onSetProperties();
                handleClosePopover();
              }}
            >
              <Iconify icon="raphael:history" />
              {`${(translate('projects.history_logs'))}`}
            </MenuItem>

            {/* <MenuItem
              onClick={() => {
                // onSetProperties();
                handleClosePopover();
              }}
            >
              <Iconify icon="mdi:tag-text" />
              {`${(translate('nav.properties'))}`}
            </MenuItem> */}

            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem
              onClick={() => {
                onBlockRow();
                handleClosePopover();
              }}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon="ooui:block" />
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
              {`${(translate('common.delete'))}`}
            </MenuItem>

          </>
          :
          null
        }
        
      </MenuPopover>

    </>
  );
}
