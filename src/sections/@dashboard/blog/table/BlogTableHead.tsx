// @mui
import { Theme } from '@mui/material/styles';
import {
  SxProps,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel
} from '@mui/material';

type Props = {
  headLabel: any[];
  rowCount?: number;
  numSelected?: number;

  sx?: SxProps<Theme>;
};
export default function BlogTableHead({
  headLabel,

  sx
}: Props) {
  return (
    <TableHead sx={sx} className="table__header">
      <TableRow className="table__header-row">
        {headLabel.map((headCell) => (
          <TableCell
            className="table__header-cell"
            key={headCell.id}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}>
            <TableSortLabel hideSortIcon sx={{ textTransform: 'capitalize' }}>
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
