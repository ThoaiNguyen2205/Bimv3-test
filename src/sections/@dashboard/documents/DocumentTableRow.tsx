import { useState, useEffect } from 'react';
// @mui
import {
  AvatarGroup,
  Stack,
  Avatar,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Tooltip,
  Link
} from '@mui/material';
//next
import NextLink from 'next/link';
//routers
import { PATH_DASHBOARD } from '../../../routes/paths';
//utils
import { fDate, fDateVi } from '../../../utils/formatTime';
//hooks
import useResponsive from '../../../hooks/useResponsive';
//stores
import useBimDocument from '../../../redux/bimDocumentStore';
import { shallow } from 'zustand/shallow';
//apis
import usersInDocumentsApi from '../../../api/usersInDocumentsApi';
// type
import { IUser } from '../../../shared/types/user';
import { IBimDocument } from '../../../shared/types/bimDocument';
import { IDocCategory } from '../../../shared/types/docCategory';
import { IUserInDocument } from '../../../shared/types/usersInDocument';
// locales
import { useLocales } from '../../../locales';
// components
import Iconify from '../../../components/iconify';
import Image from '../../../components/image';
import Label from '../../../components/label';
// sections
import DocumentPopupMenu from './popup/DocumentPopupMenu';

// ----------------------------------------------------------------------

type ILocalState = {
  openPopover: HTMLElement | null;
  usersInDoc: IUserInDocument[];
};

type Props = {
  row: IBimDocument;
  showEditDocument: VoidFunction;
  onDeleteDocument: VoidFunction;
  jumpToEditor: VoidFunction;
  onShareDocument: VoidFunction;
  onSetPermit: VoidFunction;
  viewCover: VoidFunction;
  resetFormEditor: () => void;
};
//--------------------------------------
export default function DocumentTableRow({
  row,
  showEditDocument,
  onDeleteDocument,
  jumpToEditor,
  onShareDocument,
  onSetPermit,
  viewCover,
  resetFormEditor
}: Props) {
  const {
    _id,
    title,
    cover,
    description,
    category,
    isPublish,
    isComment,
    views,
    comments,
    createdAt
  } = row;

  const { translate, currentLang } = useLocales();
  const linkTo = PATH_DASHBOARD.document.details(_id);
  const isDesktopMd = useResponsive('up', 'md');
  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    usersInDoc: []
  });
  const { setSelectedDocument } = useBimDocument(
    (state) => ({
      setSelectedDocument: state.setSelectedData
    }),
    shallow
  );
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

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: event.currentTarget
    }));
    setSelectedDocument(row);
  };
  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: null
    }));
  };

  return (
    <>
      <TableRow
        className="item__table-row"
        sx={{
          '& .MuiTableCell-root': {
            bgcolor: 'background.default'
          }
        }}>
        <TableCell className="table__cell table__cell-1">
          <Stack className="table__cell-cover" onClick={viewCover}>
            <Image
              alt={title}
              src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
              ratio="4/3"
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </TableCell>

        <TableCell className="table__cell table__cell-2">
          <Stack>
            <Tooltip
              title={title !== undefined ? description : ''}
              placement="top">
              <Link
                component={NextLink}
                href={linkTo}
                color="inherit"
                className="table__cell-title">
                <Typography variant={'subtitle2'}>{title}</Typography>
              </Link>
            </Tooltip>
          </Stack>
        </TableCell>

        <TableCell className="table__cell table__cell-3">
          <Stack spacing={2}>
            <Tooltip
              placement="top"
              title={
                category !== undefined ? (category as IDocCategory).name : ''
              }>
              <Stack className="table__cell-category" alignItems="center">
                {category !== undefined ? (
                  <Avatar
                    className="category__avatar"
                    alt={(category as IDocCategory).name}
                    src={
                      process.env.REACT_APP_APIFILE +
                      'images/' +
                      (category as IDocCategory).avatar
                    }
                  />
                ) : null}
              </Stack>
            </Tooltip>
          </Stack>
        </TableCell>

        <TableCell className="table__cell table__cell-4">
          <Stack className="table__cell-settings">
            <Label
              className="table__cell-publish table__cell-label"
              variant="soft"
              color={(isPublish === null && 'error') || 'primary'}>
              {isPublish === null
                ? `${translate('documents.draft')}`
                : `${translate('documents.publish')}`}
            </Label>
            <Label
              className="table__cell-comment table__cell-label"
              variant="soft"
              color={(isComment === null && 'warning') || 'info'}>
              {isComment === null
                ? `${translate('documents.nocomments')}`
                : `${translate('documents.comments')}`}
            </Label>
          </Stack>
        </TableCell>
        <TableCell className="table__cell table__cell-5">
          <Stack className="table__cell-createdAt">
            {(currentLang.value === 'en' && fDate(createdAt)) ||
              (currentLang.value === 'vi' && fDateVi(createdAt)) ||
              fDate(createdAt)}
          </Stack>
        </TableCell>
        {isDesktopMd && (
          <>
            <TableCell className="table__cell table__cell-6">
              <Stack className="table__cell-item table__cell-views">
                <Iconify
                  icon="solar:eye-bold"
                  className="table-cell__item-icon"
                />
                {/* {fShortenNumber(views)} */}
                {views}
              </Stack>
            </TableCell>

            <TableCell className="table__cell table__cell-7">
              <Stack className="table__cell-item table__cell-comments">
                <Iconify
                  icon="eva:message-circle-fill"
                  className="table-cell__item-icon"
                />
                {comments}
              </Stack>
            </TableCell>
            <TableCell className="table__cell table__cell-8">
              <Stack className="table__cell-item table__cell-shares">
                {localState.usersInDoc.length ? (
                  <AvatarGroup
                    max={4}
                    sx={{
                      '.css-14hg6kh-MuiAvatar-root-MuiAvatarGroup-avatar': {
                        width: '28px',
                        height: '28px'
                      }
                    }}>
                    {localState.usersInDoc &&
                      localState.usersInDoc.map((person) => (
                        <Avatar
                          className="item__avatar"
                          key={(person.user as IUser)._id}
                          alt={(person.user as IUser).username}
                          src={
                            process.env.REACT_APP_APIFILE +
                            '/images/' +
                            (person.user as IUser).avatar
                          }
                        />
                      ))}
                  </AvatarGroup>
                ) : (
                  <Label className="item__label" variant="soft" color="warning">
                    {`${translate('documents.noshared')}`}
                  </Label>
                )}
              </Stack>
            </TableCell>
          </>
        )}

        <TableCell className="table__cell table__cell-9">
          <Stack className="table__cell-action">
            <IconButton
              color={localState.openPopover ? 'inherit' : 'default'}
              onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <DocumentPopupMenu
        resetFormEditor={resetFormEditor}
        openPopover={localState.openPopover}
        onClosePopover={handleClosePopover}
        showEditDocument={showEditDocument}
        onDeleteDocument={onDeleteDocument}
        jumpToEditor={jumpToEditor}
        showShareForm={onShareDocument}
        onSetPermit={onSetPermit}
      />
    </>
  );
}
