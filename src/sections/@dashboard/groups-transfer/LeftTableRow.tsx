import { useState } from 'react';
// @mui
import {
  Stack,
  Avatar,
  Checkbox,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material';
import { IGroup } from 'src/shared/types/group';
// ----------------------------------------------------------------------

type Props = {
  row: IGroup;
  selected: boolean;
  onSelectRow: VoidFunction;
};

export default function LeftTableRow({
  row,
  selected,
  onSelectRow,
}: Props) {
  const { _id, groupname, title, logo } = row;
 
  return (
    <>
      <TableRow hover selected={selected}>
        
        <TableCell padding="checkbox" sx={{ width: 50 }}>
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell align="left" sx={{ width: 50 }}>
          <Avatar alt={groupname} src={process.env.REACT_APP_APIFILE + 'images/' + logo} />
        </TableCell>

        <TableCell align="left" sx={{ width: 300 }}>
          <Stack component="span" direction="column" >
            <Typography variant='subtitle2'>
              {groupname}
            </Typography>
            <Typography variant='caption'>
              {title}
            </Typography>
          </Stack>
        </TableCell>
        
      </TableRow>

    </>
  );
}
