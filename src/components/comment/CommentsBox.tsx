import React from 'react';
//mui
import { Box, Grid, Stack, Typography } from '@mui/material';
//locales
//store
import { shallow } from 'zustand/shallow';
import useCommentStore from '../../redux/commentStore';
import { useLocales } from '../../locales';
//type
import { IComment, ICommentReqCreate } from '../../shared/types/comment';
import { TableProps } from '../table';
import { AuthUserType } from '../../auth/types';
//section
import {
  PostCommentForm,
  PostCommentList
} from '../../sections/@dashboard/share/comment';
//component
import LoadingWindow from '../loading-screen/LoadingWindow';

//-----------------------------
type Props = {
  createdBy: string;
  deleteComment: (commentId: string | null, fatherId: string) => void;
  commentsTotal: number | undefined;
  comments: IComment[];
  createComment: (jsonObj: ICommentReqCreate) => Promise<void>;
  fatherId: string;
  getAllComments: VoidFunction;
  table: TableProps;
  editComment: (id: string, comment: ICommentReqCreate) => Promise<void>;
  user: AuthUserType;
};
//------------------------------------
export default function CommentsBox({
  createdBy,
  deleteComment,
  commentsTotal,
  comments,
  table,
  createComment,
  fatherId,
  getAllComments,
  editComment,
  user
}: Props) {
  const { translate } = useLocales();
  const { isLoadingComment } = useCommentStore(
    (state) => ({
      isLoadingComment: state.isLoading
    }),
    shallow
  );
  return (
    <Grid item xs={12} className="comments">
      <Stack direction="row" className="comments__head">
        <Typography variant="h4" className="comments__head-title">{`${translate(
          'common.comment'
        )}`}</Typography>
        <Typography variant="subtitle2" className="comments__head-total">
          ({commentsTotal})
        </Typography>
      </Stack>
      <Box className="comments__form">
        <PostCommentForm
          createComment={createComment}
          fatherId={fatherId}
          getAllComments={getAllComments}
          user={user}
        />
      </Box>
      {isLoadingComment ? (
        <LoadingWindow />
      ) : (
        <Stack className="comments__list">
          {comments && (
            <PostCommentList
              createdBy={createdBy}
              getAllComments={getAllComments}
              deleteComment={deleteComment}
              fatherId={fatherId}
              comments={comments}
              table={table}
              createComment={createComment}
              editComment={editComment}
              user={user}
            />
          )}
        </Stack>
      )}
    </Grid>
  );
}
