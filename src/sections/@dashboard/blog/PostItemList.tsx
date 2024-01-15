import { useState } from 'react';
// @mui
import {
  Stack,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Link,
  Tooltip,
  Avatar
} from '@mui/material';
//next
import NextLink from 'next/link';
// locales
import { useLocales } from '../../../locales';
//type
import { IBimDocument } from '../../../shared/types/bimDocument';
import { IDocCategory } from '../../../shared/types/docCategory';
//utils
import { fDate, fDateVi } from '../../../utils/formatTime';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//hook
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';
import Image from '../../../components/image';
import Label from '../../../components/label';
// sections
import BlogPostPopupMenu from './dialog/BlogPostPopupMenu';
// ----------------------------------------------------------------------
type ILocalState = {
  openPopover: HTMLElement | null;
};
type Props = {
  row: IBimDocument;
  openViewCover: VoidFunction;
  openShareForm: VoidFunction;
  deletePostConfirm: VoidFunction;
  handleEditPost: VoidFunction;
  handlePreview: VoidFunction;
};
export default function PostItemList({
  row,
  openShareForm,
  deletePostConfirm,
  handleEditPost,
  handlePreview,
  openViewCover
}: Props) {
  const {
    category,
    cover,
    title,
    createdAt,
    views,
    comments,
    createdBy,
    isComment,
    isPublish,
    _id,
    description
  } = row;
  const { translate, currentLang } = useLocales();
  const isDesktopMd = useResponsive('up', 'md');
  const linkTo = PATH_DASHBOARD.blog.view(_id);

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null
  });
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: event.currentTarget
    }));
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
        className="post-list__table"
        sx={{
          '& .MuiTableCell-root': {
            bgcolor: 'background.default'
          }
        }}>
        <TableCell className="post-list__table-cell table__cell-1">
          <Stack className="table__cell-cover" onClick={openViewCover}>
            <Image
              alt="cover"
              src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
              borderRadius={'5px'}
            />
          </Stack>
        </TableCell>
        <TableCell className="post-list__table-cell table__cell-2">
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
        </TableCell>
        {isDesktopMd && (
          <TableCell className="post-list__table-cell table__cell-3">
            <Tooltip
              title={
                category !== undefined ? (category as IDocCategory).name : ''
              }
              placement="top">
              <Stack className="table__cell-category" alignItems="center">
                {category !== undefined ? (
                  <Avatar
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
          </TableCell>
        )}
        <TableCell className="post-list__table-cell table__cell-4">
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
              className="table__cell-label table__cell-comment"
              variant="soft"
              color={(isComment === null && 'warning') || 'info'}>
              {isComment === null
                ? `${translate('documents.nocomments')}`
                : `${translate('documents.comments')}`}
            </Label>
          </Stack>
        </TableCell>
        <TableCell className="post-list__table-cell table__cell-5">
          <Stack className="table__cell-createAt">
            {(currentLang.value === 'en' && fDate(createdAt)) ||
              (currentLang.value === 'vi' && fDateVi(createdAt)) ||
              fDate(createdAt)}
          </Stack>
        </TableCell>
        {isDesktopMd && (
          <>
            <TableCell className="post-list__table-cell table__cell-6">
              <Stack className="table__cell-item table__cell-view">
                <Iconify
                  className="table-cell__item-icon"
                  icon={'solar:eye-bold'}
                />
                {views}
              </Stack>
            </TableCell>
            <TableCell className="post-list__table-cell table__cell-7">
              <Stack className="table__cell-item table__cell-favorite">
                <Iconify
                  className="table-cell__item-icon"
                  icon={'eva:message-circle-fill'}
                />
                {comments}
              </Stack>
            </TableCell>
          </>
        )}

        <TableCell className="post-list__table-cell table__cell-9">
          <Stack className="table__cell-action">
            <IconButton
              color={localState.openPopover ? 'inherit' : 'default'}
              onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      <BlogPostPopupMenu
        openPopover={localState.openPopover}
        onClosePopover={handleClosePopover}
        values={row}
        openShareForm={openShareForm}
        deletePostConfirm={deletePostConfirm}
        handleEditPost={handleEditPost}
        handlePreview={handlePreview}
      />
    </>
  );
}
