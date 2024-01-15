import { useCallback, useEffect, useState } from 'react';
//mui
import { Button } from '@mui/material';
//next
import { TFunctionDetailedResult } from 'i18next';
import { NextRouter, useRouter } from 'next/router';
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar
} from 'notistack';
//locales
import { useLocales } from '../../../locales';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//type
import { AuthUserType } from '../../../auth/types';
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import { IBlogShareDialog } from '../../../sections/@dashboard/blog/dialog/CopyLinkDialog';
import { IComment, ICommentReqCreate } from '../../../shared/types/comment';
import { IBlog } from '../../../shared/types/blog';
import { IDocCategory } from '../../../shared/types/docCategory';
import { IGroupInFolder } from '../../../shared/types/groupInFolder';
import { IUser } from '../../../shared/types/user';
//api
import blogsApi from '../../../api/blogsApi';
import commentsApi from '../../../api/commentsApi';
//components
import BlogDetailComponent from '../../../components/dashboard/blog/detail.component';
import { TableProps, useTable } from '../../../components/table';
import { PATH_DASHBOARD } from 'src/routes/paths';

//--------------------------------------------------------------
export type IDetailAttribute = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  title: string | string[] | undefined;
  user: AuthUserType;
  setPublish: boolean;
  table: TableProps;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  router: NextRouter;
};
export type IDetailFunction = {
  getPost: () => Promise<void>;
  getRelatedPosts: () => Promise<void>;
  handleCommentInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getLatestPosts: () => Promise<void>;
  handleOpenShare: (blog: IBlog | null) => void;
  handleCreateComment: (jsonObj: ICommentReqCreate) => Promise<void>;
  getAllComments: (fatherId: string) => Promise<void>;
  handleEditComment: (id: string, comment: ICommentReqCreate) => Promise<void>;
  handleDeleteComment: (commentId: string, fatherId: string) => Promise<void>;
  handleOpenDeleteConfirm: (commentId: string | null, fatherId: string) => void;
  handleDeleteReplyComment: (repCommentId: string) => Promise<void>;
  handleOpenRepDeleteConfirm: (commentId: string | null) => void;
  // loadDetailsInfo: () => Promise<void>;
  handleLoginToCommentRedirect: () => void;
};
type ILocalState = {
  isDashboard: boolean;
  comments: IComment[];

  loadingPost: boolean;
  errorMsg: boolean;
  relatedPosts: IBlog[];
  latestPosts: IBlog[];
  post: IBlog | null;
  commentContent: string;
  groupsInFolder: IGroupInFolder[];
  dataDialogShare: IBlogShareDialog;
  openReplyList: boolean;
  openFormReply: boolean;
  dataDialog: ConfirmDialogProps;
  replyContent: string;
};
//---------------------------------------------------------------
const detailAttribute = (isDashboard: boolean): IDetailAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    isDashboard: isDashboard,
    comments: [],
    loadingPost: true,
    errorMsg: true,
    relatedPosts: [],
    latestPosts: [],
    post: null,
    dataDialogShare: {
      open: false,
      onClose: () => {},
      blog: null
    },
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    commentContent: '',
    groupsInFolder: [],
    openReplyList: false,
    openFormReply: false,
    replyContent: ''
  });

  const {
    query: { title }
  } = useRouter();
  const router = useRouter();

  const table = useTable({ defaultRowsPerPage: 10 });
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const setPublish =
    localState.post?.isPublish === null &&
    (localState.post.createdBy as IUser).id !== user?.id;
  return {
    localState,
    setLocalState,
    title,
    user,
    setPublish,
    table,
    enqueueSnackbar,
    translate,
    router,
  };
};

const detailFunction = ({
  props,
  state,
  setState
}: {
  props: IDetailAttribute;
  state: ILocalState;
  setState: Function;
}): IDetailFunction => {
  /*----------------HANDLE CALL API---------------- */
  // handle get Post
  const getPost = useCallback(async () => {
    try {
      const response = await blogsApi.getReadById(props.title as string);

      setState((prevState: ILocalState) => ({
        ...prevState,
        loadingPost: false,
        post: response
      }));
    } catch (error) {
      console.error(error);
      setState((prevState: ILocalState) => ({
        ...prevState,
        loadingPost: false,
        errorMsg: false
      }));
    }
  }, [props.title]);
  //handle related post
  const getRelatedPosts = async () => {
    try {
      const param = {
        category: (props.localState.post?.category as IDocCategory)._id
      };
      const response = await blogsApi.getAllBlogs(param);
      const filterPostsPublish = response.data.filter(
        (post) => post.isPublish !== null
      );
      const newRelatedPost = filterPostsPublish.filter(
        (post) => post._id !== props.title
      );
      setState((prevState: ILocalState) => ({
        ...prevState,
        relatedPosts: newRelatedPost
      }));
    } catch (error) {
      console.error(error);
    }
  };
  //handle latest post
  const getLatestPosts = async () => {
    try {
      const response = await blogsApi.getAllBlogs(null);
      const filterPostsPublish = response.data.filter(
        (post) => post.isPublish !== null
      );
      const newRelatedPost = filterPostsPublish.filter(
        (post) => post._id !== props.title
      );
      setState((prevState: ILocalState) => ({
        ...prevState,
        latestPosts: newRelatedPost
      }));
    } catch (error) {
      console.error(error);
    }
  };

  // create comment
  const handleCreateComment = async (jsonObj: ICommentReqCreate) => {
    const newCommentReqCreate: ICommentReqCreate = {
      content: jsonObj.content,
      fatherId: jsonObj.fatherId,
      createdBy: jsonObj.createdBy
    };
    await commentsApi.postCreate(newCommentReqCreate);
    // getAllComments(fatherId);
  };
  //get comments by id
  const getAllComments = async (fatherId: string) => {
    const params = {
      fatherId: fatherId,
      sortType: 'desc'
    };
    const response = await commentsApi.getAllComments(params);
    setState((prevState: ILocalState) => ({
      ...prevState,
      comments: response.data
    }));
  };
  //handle edit comment
  const handleEditComment = async (id: string, comment: ICommentReqCreate) => {
    await commentsApi.updateById(id, comment);
  };
  //handle delete comment
  const handleDeleteComment = async (commentId: string, fatherId: string) => {
    await commentsApi.deleteById(commentId);
    getAllComments(fatherId);
    handleOpenDeleteConfirm(null, fatherId);
    props.table.setPage(0);
  };
  //hanlde delete reply comment
  const handleDeleteReplyComment = async (repCommentId: string) => {
    await commentsApi.deleteById(repCommentId);
    getAllComments(repCommentId);
    handleOpenRepDeleteConfirm(null);
  };
  /*------------HANDLE LOCAL----------- */

  //handle comment input
  const handleCommentInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      commentContent: event.target.value
    }));
  };
  //handle share form
  const handleOpenShare = (blog: IBlog | null) => {
    let dataDialog: IBlogShareDialog = {
      open: false,
      onClose: () => handleOpenShare(null),
      blog: null
    };
    if (blog === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialogShare: dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenShare(null),
      blog: blog
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialogShare: dataDialog
    }));
  };
  ////handle open confirm del comment

  const handleOpenDeleteConfirm = (
    commentId: string | null,
    fatherId: string
  ) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleOpenDeleteConfirm(null, fatherId)
    };
    if (commentId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenDeleteConfirm(null, fatherId),
      title: `${props.translate('blog.delete_comment')}`,
      content: `${props.translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            if (commentId !== null) {
              await handleDeleteComment(commentId, fatherId);
              props.enqueueSnackbar(
                `${props.translate('documents.delete_success')}`,
                {
                  variant: 'success'
                }
              );
            }
          }}>
          {`${props.translate('common.delete')}`}
        </Button>
      )
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };

  //handle open confirm del reply comment
  const handleOpenRepDeleteConfirm = (commentId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleOpenRepDeleteConfirm(null)
    };
    if (commentId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenRepDeleteConfirm(null),
      title: `${props.translate('blog.delete_comment')}`,
      content: `${props.translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            if (commentId !== null) {
              await handleDeleteReplyComment(commentId);
              props.enqueueSnackbar(
                `${props.translate('documents.delete_success')}`,
                {
                  variant: 'success'
                }
              );
            }
          }}>
          {`${props.translate('common.delete')}`}
        </Button>
      )
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };

  const handleLoginToCommentRedirect = () => {
    props.router.push(PATH_DASHBOARD.blog.view(props.title as string));
  }

  return {
    getPost,
    getRelatedPosts,
    handleCommentInput,
    getLatestPosts,
    handleOpenShare,
    handleCreateComment,
    getAllComments,
    handleEditComment,
    handleDeleteComment,
    handleOpenDeleteConfirm,
    handleDeleteReplyComment,
    handleOpenRepDeleteConfirm,
    handleLoginToCommentRedirect,
  };
};
//----------------------------------------------------------------
const BlogDetailContainer = (isDashboard: boolean) => {
  let props = detailAttribute(isDashboard);
  const { localState, setLocalState, user } = props;
  let func = detailFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  //render Detail post
  useEffect(() => {
    if (props.title) {
      func.getPost();
    }
  }, [func.getPost, props.title]);
  //render related post
  useEffect(() => {
    func.getRelatedPosts();
  }, [props.title]);
  useEffect(() => {
    func.getLatestPosts();
  }, [props.title]);
  //render all comments
  useEffect(() => {
    func.getAllComments(props.title as string);
  }, []);

  return (
    <>
      <BlogDetailComponent props={props} func={func} />
    </>
  );
};
export default BlogDetailContainer;
