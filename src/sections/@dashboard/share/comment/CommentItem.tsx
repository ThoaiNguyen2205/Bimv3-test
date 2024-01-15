import React, { useRef } from 'react';
//mui
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  ListItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
//next
import NextLink from 'next/link';
//locales
import { useLocales } from '../../../../locales';
//router
import { PATH_DASHBOARD } from '../../../../routes/paths';
//type
import { IComment } from '../../../../shared/types/comment';
import { IUser } from '../../../../shared/types/user';
//utils
import { fDate, fDateVi } from '../../../../utils/formatTime';
//component
import Iconify from '../../../../components/iconify/Iconify';
import CommentsPopupMenu from './CommentsPopupMenu';
import MarkDown from '../../../../components/markdown/Markdown';
import CommentEditorForm from './editor/CommentFormEditor';

type Props = {
  comment: IComment;
  isCanEdit: boolean;
  isOwner: boolean;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void;
  handleClickButtonReply: (id: string) => void;
  replyComments: IComment[];
  handleOpenListReply?: (id: string) => void;
  openReplyList?: string;
  openPopover: HTMLElement | null;
  handleClosePopover: () => void;
  handleClickButtonEdit: (id: string) => void;
  deleteComment: (commentId: string | null, fatherId: string) => void;
  fatherId: string;
  openReply: string;
  replyContent: string;
  handleReplyContent: (value: string) => void;
  isEdit: boolean;
  handleEditComment: () => void;
  handleCreateReply: () => void;
  handleCancelButton: () => void;
};
export default function CommentItem({
  comment,
  isCanEdit,
  isOwner,
  handleOpenPopover,
  handleClickButtonReply,
  replyComments,
  handleOpenListReply,
  openReplyList,
  openPopover,
  handleClosePopover,
  handleClickButtonEdit,
  deleteComment,
  fatherId,
  openReply,
  replyContent,
  handleReplyContent,
  isEdit,
  handleEditComment,
  handleCreateReply,
  handleCancelButton
}: Props) {
  const { translate, currentLang } = useLocales();
  const linkTo = PATH_DASHBOARD.user.profile;
  return (
    <>
      <ListItem className="comments__item" disableGutters>
        <Box className="comments__item-author">
          <Link component={NextLink} href={linkTo}>
            <Avatar
              className="item__avatar"
              alt={(comment.createdBy as IUser).username}
              src={`${process.env.REACT_APP_APIFILE}images/${
                (comment.createdBy as IUser).avatar
              }`}
            />
          </Link>
          <Box className="item__body">
            <Stack className="body-show">
              <Box className="body-show__info">
                <Link component={NextLink} href={linkTo} color="inherit">
                  <Typography
                    variant="subtitle2"
                    className="body-show__info-createdBy">
                    {(comment.createdBy as IUser).username}
                  </Typography>
                </Link>

                <Typography
                  variant="caption"
                  className="body-show__info-createdAt">
                  {(currentLang.value === 'en' && fDate(comment.updatedAt)) ||
                    (currentLang.value === 'vi' &&
                      fDateVi(comment.updatedAt)) ||
                    fDate(comment.updatedAt)}
                </Typography>
              </Box>
              <Box className="body-show__content">
                <Box className="body-show__content-text">
                  <MarkDown children={comment.content} />
                </Box>
                {isCanEdit && (
                  <IconButton
                    onClick={handleOpenPopover}
                    className="body-show__content-popup">
                    <Iconify
                      icon="eva:more-vertical-fill"
                      className="content__popup-icon"
                    />
                  </IconButton>
                )}
              </Box>
            </Stack>
            <Box className="item__action">
              <Box className="item__action-button">
                <Button
                  className="button__reply"
                  size="small"
                  variant="text"
                  color="success"
                  onClick={() => handleClickButtonReply(comment._id)}>
                  {`${translate('common.reply')}`}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className="comments__item-hidden">
          {openReply === comment._id && (
            <Box className="comments__item-reply">
              <CommentEditorForm
                simple={false}
                value={replyContent}
                onChange={handleReplyContent}
                placeholder={`${translate('common.write_comment')}`}
              />
              {/* <TextField
            fullWidth
            name="comment"
            size="medium"
            value={replyContent}
            onChange={handleReplyContent}
            placeholder={`${translate('common.write_comment')}`}
          /> */}
              <Box className="item-reply__button">
                <Button
                  className="item-reply__button-cancel reply__button"
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelButton}>
                  {`${translate('common.cancel')}`}
                </Button>
                {isEdit ? (
                  <Button
                    className="item-reply__button-edit reply__button"
                    onClick={handleEditComment}
                    variant="contained"
                    color="primary"
                    disabled={
                      replyContent === '<p><br></p>' ||
                      replyContent === '<p></p>'
                    }>
                    {`${translate('common.edit')}`}
                  </Button>
                ) : (
                  <Button
                    className="item-reply__button-reply reply__button"
                    onClick={handleCreateReply}
                    variant="contained"
                    color="primary"
                    disabled={
                      replyContent === '<p><br></p>' ||
                      replyContent === '<p></p>'
                    }>
                    {`${translate('common.reply')}`}
                  </Button>
                )}
              </Box>
            </Box>
          )}
          {replyComments.length !== 0 && (
            <Button
              className="button__show-reply"
              size="small"
              variant="text"
              color="inherit"
              onClick={() => {
                if (handleOpenListReply) {
                  handleOpenListReply(comment._id);
                }
              }}>
              <Iconify
                icon={
                  openReplyList ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'
                }
              />
              {`${replyComments.length} ${translate('common.reply')} `}
            </Button>
          )}
        </Box>
      </ListItem>
      <CommentsPopupMenu
        isOwner={isOwner}
        openPopover={openPopover}
        onClosePopover={handleClosePopover}
        values={comment}
        deleteComment={() => deleteComment(comment._id, fatherId)}
        handleEditPost={() => handleClickButtonEdit(comment._id)}
      />

      <Divider />
    </>
  );
}
