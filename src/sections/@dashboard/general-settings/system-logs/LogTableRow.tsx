import { useState } from 'react';
// next
import NextLink from 'next/link';
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
  Link,
} from '@mui/material';
// hooks
import useResponsive from '../../../../hooks/useResponsive';
// type
import { IUclass } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
// locales
import { useLocales } from 'src/locales';
import { ISystemLog } from 'src/shared/types/systemlog';
// utils
import { fDate } from 'src/utils/formatTime';
// ----------------------------------------------------------------------

type Props = {
  row: ISystemLog;
  selected: boolean;
  onSelectRow: VoidFunction;
};

export default function LogTableRow({
  row,
  selected,
  onSelectRow,
}: Props) {
  const { type, content, actionLink, createdAt } = row;
  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell align='left'>
          <Stack direction="row" spacing={2}>
            <Avatar alt={type} src={process.env.REACT_APP_APIFILE + 'images/' + type + '.png'} />
          </Stack>
        </TableCell>

        <TableCell align="left" > 
          <Link component={NextLink} href={process.env.REACT_APP_URL + actionLink} >
            {content}
          </Link>
        </TableCell>
        <TableCell align="left" > {fDate(createdAt)} </TableCell>
        
      </TableRow>

    </>
  );
}
