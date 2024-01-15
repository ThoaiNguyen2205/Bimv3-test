import { useState, useEffect } from 'react';
// @mui
import {
  Stack,
  Button,
  TableRow,
  TableCell,
  Typography,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// components
import Label from '../../../components/label';
// locales
import { useLocales } from '../../../locales';
// utils
import { fDate, fDateVi } from '../../../utils/formatTime';
// apis
import usersInDocumentsApi from '../../../api/usersInDocumentsApi';
//types
import { IDocContent } from '../../../shared/types/docContent';
import { IDocIndex } from '../../../shared/types/docIndex';
import { IUserInDocument } from '../../../shared/types/usersInDocument';
import { IUser } from '../../../shared/types/user';
// -------------------------------------------------------------

type ILocalState = {
  openPopover: HTMLElement | null;
  usersInDoc: IUserInDocument[];
};
type Props = {
  row: IDocContent;
  deleteVersion: (idVersion: string | null, title: string) => void;
  handleOpenPreviewDialog: (version: IDocContent | null) => void;
};
export default function UsersInDocTableRow({
  row,
  deleteVersion,
  handleOpenPreviewDialog
}: Props) {
  const { _id, createdAt, index, createdBy, versionNotes, content } = row;
  const createByObj = createdBy as IUser;
  const indexObj = index as IDocIndex;
  const userName = createByObj.username;
  const title = indexObj.title;
  const { translate, currentLang } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    usersInDoc: []
  });
  useEffect(() => {
    const loadUsersInDocument = async () => {
      const param = {
        document: _id
      };
      const res = await usersInDocumentsApi.getUsersInDocument(param);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        usersInDoc: res.data
      }));
    };
    loadUsersInDocument();
  }, []);

  return (
    <>
      <TableRow
        className="table__row"
        sx={{
          '& .MuiTableCell-root': {
            bgcolor: 'background.default',
            textAlign: 'center'
          }
        }}>
        <TableCell className="table__row-cell table__cell-1">
          <Stack className="table__cell-item">
            <Label variant="soft" color={'primary'}>
              {versionNotes}
            </Label>
          </Stack>
        </TableCell>

        <TableCell className="table__row-cell table__cell-2">
          <Stack className="table__cell-item">{title}</Stack>
        </TableCell>
        <TableCell className="table__row-cell table__cell-3">
          <Stack className="table__cell-item">
            <Typography className="item__username" noWrap variant="inherit">
              {userName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell className="table__row-cell table__cell-4">
          <Stack className="table__cell-item">
            {(currentLang.value === 'en' && fDateVi(createdAt)) ||
              (currentLang.value === 'vi' && fDateVi(createdAt)) ||
              fDate(createdAt)}
          </Stack>
        </TableCell>
        <TableCell className="table__row-cell table__cell-5">
          <Stack className="table__cell-item">
            <Tooltip placement="top" title={`${translate('common.delete')}`}>
              <Button
                className="item__button"
                variant="outlined"
                color="error"
                onClick={() => {
                  // setOpenDeleteVersion(true);
                  // setOpenDeleteVersion(true);
                  deleteVersion(row._id, row.versionNotes);
                  // setIdVersionDelete(_id);
                  // setVersionNoteDelete(versionNotes);
                }}>
                <DeleteIcon className="item__button-icon" />
              </Button>
            </Tooltip>
            <Tooltip
              placement="top"
              title={`${translate('documents.preview')}`}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  handleOpenPreviewDialog(row);
                }}>
                <RemoveRedEyeIcon className="item__button-icon" />
              </Button>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    </>
  );
}
