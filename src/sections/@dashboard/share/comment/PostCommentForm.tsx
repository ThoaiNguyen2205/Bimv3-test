import { useState } from 'react';

// @mui
import { Box, Button, Typography } from '@mui/material';
//context
import { useSnackbar } from 'notistack';
//locales
import { useLocales } from '../../../../locales';
//type
import { ICommentReqCreate } from '../../../../shared/types/comment';
import { AuthUserType } from '../../../../auth/types';
// components
import CommentEditorForm from './editor/CommentFormEditor';

// ----------------------------------------------------------------------
type Props = {
  getAllComments: VoidFunction;
  createComment: (jsonObj: ICommentReqCreate) => Promise<void>;
  fatherId: string;
  user: AuthUserType;
};

type ILocalState = {
  content: string;
  isError: boolean;
};
export default function PostCommentForm({
  getAllComments,
  createComment,
  fatherId,
  user
}: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    content: '',
    isError: false
  });
  const { enqueueSnackbar } = useSnackbar();
  const handleSubmit = async () => {
    if (localState.content === '<p><br></p>' || localState.content === '') {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isError: true
      }));
      return;
    }
    const newComment: ICommentReqCreate = {
      content: localState.content,
      fatherId: fatherId,
      createdBy: user?.id
    };
    await createComment(newComment);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      content: ''
    }));
    enqueueSnackbar(`${translate('blog.created_success')}`);
    getAllComments();
  };
  const handleChangeMessage = (value: string) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      content: value
    }));
    if (localState.content !== '<p><br></p>') {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        isError: false
      }));
    }
  };
  return (
    <Box className="comments__form">
      <CommentEditorForm
        simple={false}
        id="comment"
        value={localState.content}
        onChange={handleChangeMessage}
        placeholder={`${translate('common.write_comment')}`}
      />
      {/* <RHFTextField
          name="comment"
          placeholder={`${translate('common.write_comment')}`}
          multiline
          rows={3}
          value={localState.content}
          onChange={handleContent}
        /> */}

      <Box className="comments__form-button">
        <Typography className="text-error">
          {localState.isError ? `${translate('blog.comment_required')}` : ''}
        </Typography>
        <Button
          className="button__submit"
          type="submit"
          variant="contained"
          onClick={handleSubmit}>
          {`${translate('blog.post_comment')}`}
        </Button>
      </Box>
    </Box>
  );
}
