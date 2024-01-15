// @mui
import { Box, List } from '@mui/material';
// @types
import { IComment, ICommentReqCreate } from '../../../../shared/types/comment';
import { AuthUserType } from '../../../../auth/types';
//component

import {
  TablePaginationCustom,
  TableProps
} from '../../../../components/table';
import PostCommentItem from './PostCommentItem';
// ----------------------------------------------------------------------

type Props = {
  createdBy: string;
  deleteComment: (commentId: string | null, fatherId: string) => void;
  fatherId: string;
  getAllComments: VoidFunction;
  createComment: (jsonObj: ICommentReqCreate) => void;
  comments: IComment[];
  table: TableProps;
  editComment: (id: string, jsonObj: ICommentReqCreate) => Promise<void>;
  user: AuthUserType;
};

//-----------------------------------------------
export default function PostCommentList({
  createdBy,
  deleteComment,
  getAllComments,
  comments,
  fatherId,
  createComment,
  table,
  editComment,
  user
}: Props) {
  const {
    page,
    rowsPerPage,
    //
    onChangePage,
    onChangeRowsPerPage
  } = table;
  return (
    <List disablePadding>
      {comments
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((comment) => {
          return (
            <Box key={comment._id}>
              <PostCommentItem
                deleteComment={deleteComment}
                comment={comment}
                fatherId={fatherId}
                createdBy={createdBy}
                getAllComments={getAllComments}
                createComment={createComment}
                editComment={editComment}
                user={user}
              />
            </Box>
          );
        })}
      {comments.length > 10 && (
        <TablePaginationCustom
          count={comments.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      )}
    </List>
  );
}
