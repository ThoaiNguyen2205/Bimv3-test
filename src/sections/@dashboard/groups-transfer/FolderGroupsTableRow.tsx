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
  onToggleEdit: VoidFunction;
  editChecked: boolean;
  onToggleUpdate: VoidFunction;
  updateChecked: boolean;
  onToggleDownload: VoidFunction;
  downloadChecked: boolean;
  onToggleApprove: VoidFunction;
  approveChecked: boolean;
  onToggleConfirm:VoidFunction;
  confirmChecked: boolean;
};

export default function FolderGroupsTableRow({
  row,
  selected,
  onSelectRow,
  onToggleEdit,
  editChecked,
  onToggleUpdate,
  updateChecked,
  onToggleDownload,
  downloadChecked,
  onToggleApprove,
  approveChecked,
  onToggleConfirm,
  confirmChecked,
}: Props) {
  const { _id, groupname, title, logo } = row;
  const labelId = `transfer-group-item-${_id}-label`;
  const { translate } = useLocales();
 
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

        <TableCell id='isEdit' padding="checkbox" align="center" sx={{ width: 60 }}>
          <Tooltip title={`${translate('common.edit')}`} placement='top'>
            <Checkbox
              onClick={onToggleEdit}
              checked={editChecked || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </Tooltip>
        </TableCell>

        <TableCell id='isUpdate' padding="checkbox" align="center" sx={{ width: 60 }}>
          <Tooltip title={`${translate('common.update')}`} placement='top'>
            <Checkbox
              onClick={onToggleUpdate}
              checked={updateChecked || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </Tooltip>
        </TableCell>

        <TableCell id='isDownload' padding="checkbox" align="center" sx={{ width: 60 }}>
          <Tooltip title={`${translate('common.download')}`} placement='top'>
            <Checkbox
              onClick={onToggleDownload}
              checked={downloadChecked || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </Tooltip>
        </TableCell>

        <TableCell id='isConfirm' padding="checkbox" align="center" sx={{ width: 60 }}>
          <Tooltip title={`${translate('common.confirm')}`} placement='top'>
            <Checkbox
              onClick={onToggleConfirm}
              checked={confirmChecked || false}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </Tooltip>
        </TableCell>

        <TableCell id='isApprove' padding="checkbox" align="center" sx={{ width: 60 }}>
          <Tooltip title={`${translate('common.approve')}`} placement='top'>
            <Checkbox
              onClick={onToggleApprove}
              checked={approveChecked || false}
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
