import { useEffect, useState } from 'react';
// @mui
import { Box } from '@mui/material';
// context
import { useSnackbar } from 'notistack';
//locales
import { useLocales } from '../../../../locales';
//type
import { IComment, ICommentReqCreate } from '../../../../shared/types/comment';
import { AuthUserType } from '../../../../auth/types';
import { IUser } from '../../../../shared/types/user';
//api
import commentsApi from '../../../../api/commentsApi';
//component
import { useTable } from '../../../../components/table';
import CommentItem from './CommentItem';
import PostReplyCommentItem from './PostReplyCommentItem';
import CommentPaginationCustom from './CommentPaginationCustom';
import useCommentStore from '../../../../redux/commentStore';

// ------------------------------------------------------------

type Props = {
  createdBy: string;
  deleteComment: (commentId: string | null, fatherId: string) => void;
  comment: IComment;
  fatherId: string;
  getAllComments: VoidFunction;
  createComment: (jsonObj: ICommentReqCreate) => void;
  editComment: (id: string, jsonObj: ICommentReqCreate) => Promise<void>;
  user: AuthUserType;
};
type ILocalState = {
  replyComments: IComment[];
  replyContent: string;
  openPopover: HTMLElement | null;
  tagUser: string;
};
export default function PostCommentItem({
  createdBy,
  deleteComment,
  comment,
  fatherId,
  getAllComments,
  createComment,
  editComment,
  user
}: Props) {
  const [localState, setLocalState] = useState<ILocalState>({
    replyComments: [],
    replyContent: '',
    openPopover: null,
    tagUser: `@${(comment.createdBy as IUser).username}`
  });

  const {
    openReply,
    openReplyList,
    isEdit,
    setClickButtonReply,
    setClickButtonEdit,
    setOpenReplyList,
    setCloseReply
  } = useCommentStore((state) => ({
    openReply: state.openReply,
    openReplyList: state.openReplyList,
    isEdit: state.isEdit,
    setClickButtonReply: state.setClickButtonReply,
    setClickButtonEdit: state.setClickButtonEdit,
    setOpenReplyList: state.setOpenReplyList,
    setCloseReply: state.setCloseReply
  }));
  const table = useTable({ defaultRowsPerPage: 10 });
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const {
    page,
    rowsPerPage,
    //
    setPage,
    onChangePage,
    onChangeRowsPerPage
  } = table;
  const isCanEdit =
    user?.id === createdBy || user?.id === (comment.createdBy as IUser)._id;
  const isOwner = user?.id === (comment.createdBy as IUser)._id;

  /*---------------HANDLE API------------------ */
  //handle get reply comment
  const getReplyComments = async () => {
    const params = { fatherId: comment._id, sortType: 'desc' };
    const respon = await commentsApi.getAllComments(params);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyComments: respon.data
    }));
  };
  //handle create rep comment
  const handleCreateReply = () => {
    const newComment: ICommentReqCreate = {
      content: localState.replyContent,
      fatherId: comment._id,
      createdBy: user?.id
    };
    createComment(newComment);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: ''
    }));
    setCloseReply();
    setOpenReplyList(comment._id);
    getReplyComments();
    enqueueSnackbar(`${translate('blog.created_success')}`);
  };
  //handle edit rep comment
  const handleEditComment = () => {
    const newCommentUpdate = {
      fatherId: fatherId,
      content: localState.replyContent,
      createdBy: user?.id
    };
    editComment(comment._id, newCommentUpdate);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: ''
    }));
    getAllComments();
    enqueueSnackbar(`${translate('documents.edit_success')}`);
  };
  /*---------------HANDLE LOCAL------------------ */
  //handle list rep comment
  const handleOpenListReply = (id: string) => {
    setOpenReplyList(id);
  };

  const handleReplyContent = (value: string) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: value
    }));
  };
  //handle open form input create
  const handleClickButtonReply = (id: string) => {
    setClickButtonReply(id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: `${localState.tagUser} `
    }));
  };
  //handle open form input reply
  const handleClickButtonEdit = (id: string) => {
    setClickButtonEdit(id);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      replyContent: comment.content
    }));
  };
  //handle cancel/reset form
  const handleCancelButton = () => {
    setCloseReply(),
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        replyContent: ''
      }));
  };
  //handle open/close popover
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
  // render reply comment
  useEffect(() => {
    getReplyComments();
  }, []);

  return (
    <Box className="comments__list-item">
      <CommentItem
        isCanEdit={isCanEdit}
        isOwner={isOwner}
        comment={comment}
        handleOpenPopover={handleOpenPopover}
        handleClickButtonReply={handleClickButtonReply}
        replyComments={localState.replyComments}
        handleOpenListReply={handleOpenListReply}
        openReplyList={openReplyList}
        openPopover={localState.openPopover}
        handleClosePopover={handleClosePopover}
        handleClickButtonEdit={handleClickButtonEdit}
        deleteComment={deleteComment}
        fatherId={fatherId}
        openReply={openReply}
        replyContent={localState.replyContent}
        handleReplyContent={handleReplyContent}
        isEdit={isEdit}
        handleEditComment={handleEditComment}
        handleCreateReply={handleCreateReply}
        handleCancelButton={handleCancelButton}
      />
      {openReplyList === comment._id &&
        localState.replyComments.length !== 0 && (
          <Box className="comments__list-reply">
            {localState.replyComments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((repComment) => (
                <PostReplyCommentItem
                  setPageReply={setPage}
                  createdBy={createdBy}
                  fatherId={comment._id}
                  repComment={repComment}
                  createComment={createComment}
                  replyContent={localState.replyContent}
                  editComment={editComment}
                  getReplyComments={getReplyComments}
                  user={user}
                />
              ))}
            {localState.replyComments.length > 10 && (
              <Box className="comments__pagination">
                <CommentPaginationCustom
                  count={localState.replyComments?.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={onChangePage}
                  onRowsPerPageChange={onChangeRowsPerPage}
                  onClose={() => {
                    setOpenReplyList('');
                  }}
                />
              </Box>
            )}
          </Box>
        )}
    </Box>
  );
}
