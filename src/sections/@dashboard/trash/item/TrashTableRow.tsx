import React, { useEffect, useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Stack,
  Avatar,
  Box,
  Button,
  Divider,
  Checkbox,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
  AvatarGroup,
  Link,
} from '@mui/material';
// utils
import { fDate } from '../../../../utils/formatTime';
import { fData } from '../../../../utils/formatNumber';
// components
import Iconify from '../../../../components/iconify';
import FileThumbnail from '../../../../components/file-thumbnail';
import TrashPopupMenu from './TrashPopupMenu';
//
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

import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
// ----------------------------------------------------------------------

type Props = {
  dataType: string;
  size: string;
  groupsInFoler: IGroupInFolder[];
  fLinks: IFolder[];
  openPopover: HTMLElement | null;
  type: string;
  data: IFolder | IFile;
  version: string;
  handleClosePopover: VoidFunction;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  //
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onRestoreRow: VoidFunction;
  // //
  detailsId: string;
  onDetails: VoidFunction;
};

export default function TrashTableRow({
  dataType,
  size,
  groupsInFoler,
  fLinks,
  openPopover,
  type,
  data,
  version,
  handleClosePopover,
  handleOpenPopover,
  //
  selected,
  onSelectRow,
  onDeleteRow,
  onRestoreRow,
  // //
  detailsId,
  onDetails,
}: Props) {
  const { translate } = useLocales();
  const [showCheckbox, setShowCheckbox] = useState(false);

  const handleShowCheckbox = () => {
    setShowCheckbox(true);
  };

  const handleHideCheckbox = () => {
    setShowCheckbox(false);
  };

  return (
    <>
      <TableRow
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          borderRadius: 1,
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
          },
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
        }}
        selected={selected}
      >
        <TableCell
          padding="checkbox"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
        >
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell
          padding="checkbox"
          onClick={onDetails}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <FileThumbnail file={dataType} />

            <Typography noWrap variant="inherit" sx={{ maxWidth: 260, cursor: 'pointer' }}>
              {data?.displayName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell
          align="left"
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
          onClick={onDetails}
        >
          {size}
        </TableCell>

        <TableCell
          align="center"
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
          onClick={onDetails}
        >
          {version}
        </TableCell>

        <TableCell
          align="left"
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
          onClick={onDetails}
        >
          {fDate(data.createdAt)}
        </TableCell>

        {data.trashedAt ? 
          <TableCell
            align="left"
            sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
            onClick={onDetails}
          >
            {fDate(data.trashedAt)}
          </TableCell>
          : null
        }

        <TableCell align="right" onClick={onDetails}>
          <AvatarGroup
            max={4}
            sx={{
              '& .MuiAvatarGroup-avatar': {
                width: 24,
                height: 24,
                '&:first-of-type': {
                  fontSize: 12,
                },
              },
            }}
          >
            {groupsInFoler &&
              groupsInFoler.map((group) => (
                <Avatar key={group._id} alt={(group.group as IGroup).groupname} src={process.env.REACT_APP_APIFILE + 'images/' + (group.group as IGroup).logo} />
              ))}
          </AvatarGroup>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            whiteSpace: 'nowrap',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <TrashPopupMenu 
        openPopover={openPopover}
        type={type}
        data={data}
        handleClosePopover={handleClosePopover}
        //
        onDeleteRow={onDeleteRow}
        onRestoreRow={onRestoreRow}
      />

    </>
  );
}
