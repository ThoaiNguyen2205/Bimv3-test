// @mui
import {
  Stack,
  Avatar,
  Checkbox,
  TableRow,
  TableCell,
  Typography,
  Tooltip,
} from '@mui/material';
import { IGroup } from 'src/shared/types/group';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type Props = {
  row: IGroup;
  selected: boolean;
  onSelectRow: VoidFunction;
  onToggleAdmin: VoidFunction;
  adminChecked: boolean;
};

export default function ProjectGroupsTableRow({
  row,
  selected,
  onSelectRow,
  onToggleAdmin,
  adminChecked,
}: Props) {
  const { _id, groupname, title, logo } = row;
  const labelId = `transfer-group-item-${_id}-label`;
  const { translate } = useLocales();
 
  return (
    <>
      <TableRow hover selected={selected} >
        
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

        <TableCell id='isAdmin' padding="checkbox" align="center" sx={{ width: 100 }}>
          <Tooltip title={`${translate('common.project_admin')}`} placement='top'>
            <Checkbox
              onClick={onToggleAdmin}
              checked={adminChecked || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </Tooltip>
        </TableCell>
        
      </TableRow>

    </>
  );
}
