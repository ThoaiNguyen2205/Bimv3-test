import React, { Dispatch, SetStateAction, useState } from 'react';
//mui
import { Box, Button } from '@mui/material';
//type
import { AuthUserType } from '../../../../auth/types';
import { IUser } from '../../../../shared/types/user';
import { IComment, ICommentReqCreate } from '../../../../shared/types/comment';
//context
import { useSnackbar } from 'notistack';
//locales
import { useLocales } from '../../../../locales';
//api
import commentsApi from '../../../../api/commentsApi';
//component
import { ConfirmDialogProps } from '../../../../components/confirm-dialog/types';
import CommentItem from './CommentItem';
import ConfirmDialog from '../../../../components/confirm-dialog/ConfirmDialog';
//store
import { shallow } from 'zustand/shallow';
import useCommentStore from '../../../../redux/commentStore';
type Props = {
  createdBy: string;
  fatherId: string;
  replyContent: string;
  editComment: (id: string, comment: ICommentReqCreate) => Promise<void>;
  getReplyComments: VoidFunction;
  createComment: (jsonObj: ICommentReqCreate) => void;
  user: AuthUserType;
  repComment: IComment;
  setPageReply: Dispatch<SetStateAction<number>>;
};
type ILocalState = {
  openPopover: HTMLElement | null;
  replyComments: IComment[];
  replyContent: string;
  dataDialog: ConfirmDialogProps;
};
export default function PostReplyCommentItem({
  setPageReply,
  createdBy,
  getReplyComments,
  editComment,
  fatherId,
  repComment,
  user,
  createComment
}: Props) {
  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    replyComments: [],
    replyContent: '',
    dataDialog: {
      open: false,
      onClose: () => {}
    }
  });
  const {
    isEdit,
    openReply,
    setClickButtonReply,
    setClickButtonEdit,
    setCloseReply,
    setIsLoadingComment
  } = useCommentStore(
    (state) => ({
      isEdit: state.isEdit,
      openReply: state.openReply,
      setClickButtonReply: state.setClickButtonReply,
      setClickButtonEdit: state.setClickButtonEdit,
      setCloseReply: state.setCloseReply,
      setIsLoadingComment: state.setIsLoading
    }),
    shallow
  );
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const isCanEdit =
    user?.id === createdBy || user?.id === (repComment.createdBy as IUser)._id;
  const isOwner = user?.id === (repComment.createdBy as IUser)._id;

  /*----------------------HANDLE API --------------------- */
  //handle create rep comment
  const handleCreateReply = () => {
    const newComment: ICommentReqCreate = {
      content: localState.replyContent,
      fatherId: fatherId,
      createdBy: user?.id
    };
    createComment(newComment);
    getReplyComments();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: ''
    }));
    setCloseReply();
    enqueueSnackbar(`${translate('blog.created_success')}`);
  };
  //handle edit rep comment
  const handleEditReply = () => {
    const newReplyCommenUpdate: ICommentReqCreate = {
      fatherId: fatherId,
      content: localState.replyContent,
      createdBy: user?.id
    };
    editComment(repComment._id, newReplyCommenUpdate);
    getReplyComments();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: ''
    }));
  };
  //handle delete rep comment
  const handleDeleteReply = async (repCommentId: string) => {
    setIsLoadingComment(true);
    await commentsApi.deleteById(repCommentId);
    getReplyComments();
    handleDeleteConfirm(null);
    setPageReply(0);
    setIsLoadingComment(false);
  };
  /*--------------HANDLE LOCAL---------------- */
  const handleReplyContent = (value: string) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: value
    }));
  };
  //handle open form edit
  const handleClickButtonEdit = (id: string) => {
    setClickButtonEdit(id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: repComment.content
    }));
  };
  //handle open form create
  const handleClickButtonReply = (id: string) => {
    setClickButtonReply(id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: `@${(repComment.createdBy as IUser).username}`
    }));
  };
  //handle opne/close popover
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
  //handle open confirm del rep commnet
  const handleDeleteConfirm = (repCommentId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleDeleteConfirm(null)
    };
    if (repCommentId === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleDeleteConfirm(null),
      title: `${translate('blog.delete_comment')}`,
      content: `${translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            if (repCommentId !== null) {
              await handleDeleteReply(repCommentId);
              enqueueSnackbar(`${translate('documents.delete_success')}`, {
                variant: 'success'
              });
            }
          }}>
          {`${translate('common.delete')}`}
        </Button>
      )
    };
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };

  const handleCancelButton = () => {
    setCloseReply();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,

      replyContent: ''
    }));
  };
  return (
    <Box className="comments__list-item reply__list-item">
      <CommentItem
        isOwner={isOwner}
        isCanEdit={isCanEdit}
        comment={repComment}
        handleOpenPopover={handleOpenPopover}
        handleClickButtonReply={handleClickButtonReply}
        replyComments={localState.replyComments}
        openPopover={localState.openPopover}
        handleClosePopover={handleClosePopover}
        handleClickButtonEdit={handleClickButtonEdit}
        deleteComment={handleDeleteConfirm}
        fatherId={fatherId}
        openReply={openReply}
        replyContent={localState.replyContent}
        handleReplyContent={handleReplyContent}
        isEdit={isEdit}
        handleEditComment={handleEditReply}
        handleCreateReply={handleCreateReply}
        handleCancelButton={handleCancelButton}
        handleOpenListReply={undefined}
      />
      <ConfirmDialog {...localState.dataDialog} />
    </Box>
  );
}
