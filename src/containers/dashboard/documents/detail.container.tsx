import React, { useEffect, useState } from 'react';
//mui
import { Button } from '@mui/material';
//next
import { TFunctionDetailedResult } from 'i18next';
import { useRouter } from 'next/router';
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
//types
import { IBimDocument } from '../../../shared/types/bimDocument';
import { IComment, ICommentReqCreate } from '../../../shared/types/comment';
import {
  IDocIndex,
  IDocIndexResGetAll,
  IDocIndexTreeData
} from '../../../shared/types/docIndex';
import { IUserInDocument } from '../../../shared/types/usersInDocument';
import { AuthUserType } from '../../../auth/types';
//api
import bimDocumentsApi from '../../../api/bimDocumentsApi';
import commentsApi from '../../../api/commentsApi';
import docContentsApi from '../../../api/docContentsApi';
import docIndexsApi from '../../../api/docIndexsApi';
import usersInDocumentsApi from '../../../api/usersInDocumentsApi';
//stores
import { shallow } from 'zustand/shallow';
import useDocIndex from '../../../redux/docIndexStore';
import useCommentStore from '../../../redux/commentStore';
//components
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import DocDetailComponent from '../../../components/dashboard/documents/detail.component';
import { TableProps, useTable } from '../../../components/table';
//sections
import StyledTreeItem from '../../../sections/treeview/StyledTreeItem';

//------------------------------

export type IDocDetailAttribute = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  title: string | string[] | undefined;
  docIndexes: IDocIndex[];
  setDocIndexes: (docIndexs: IDocIndex[]) => void;
  selectedDocIndex: IDocIndex | null;
  setSelectedDocIndex: (docIndex: IDocIndex | null) => void;
  table: TableProps;
  user: AuthUserType;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  setIsLoadingComment: (value: boolean) => void;
  setCloseReply: () => void;
};
export type IDocDetailFunction = {
  getContentsTree: () => Promise<void>;
  treeItemOnClick: (id: string) => Promise<void>;
  renderCategoriesTree: (treeData: IDocIndexTreeData[]) => JSX.Element[];
  getAllComments: (fatherId: string) => Promise<void>;
  handleCreateComment: (jsonObj: ICommentReqCreate) => Promise<void>;
  handleDeleteComment: (commentId: string, fatherId: string) => Promise<void>;
  handleEditComment: (id: string, comment: ICommentReqCreate) => Promise<void>;
  handleOpenDeleteConfirm: (commentId: string | null, fatherId: string) => void;
  loadUsersInDocument: () => Promise<void>;
  getDocumentById: () => Promise<void>;
};
type ILocalState = {
  isLoading: boolean;
  document: IBimDocument | null;
  contentsTree: IDocIndexTreeData[];
  usersInDoc: IUserInDocument[];
  content: string;
  versionNote: string;
  selectedNode: string;
  docContent: IDocIndexTreeData | null;
  comments: IComment[];
  dataDialog: ConfirmDialogProps;
  createdAt: Date | null;
  selectedTitle: string;
};
const docDetailAttribute = (): IDocDetailAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    isLoading: false,
    document: null,
    contentsTree: [],
    usersInDoc: [],
    content: '',
    versionNote: '',
    selectedNode: '',
    docContent: null,
    comments: [],
    dataDialog: {
      open: false,
      onClose: () => {}
    },
    createdAt: null,
    selectedTitle: ''
  });
  const { translate } = useLocales();
  const table = useTable({ defaultRowsPerPage: 10 });
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { docIndexes, setDocIndexes, selectedDocIndex, setSelectedDocIndex } =
    useDocIndex(
      (state) => ({
        docIndexes: state.datas,
        setDocIndexes: state.setDatas,
        selectedDocIndex: state.selectedData,
        setSelectedDocIndex: state.setSelectedData
      }),
      shallow
    );
  const { setIsLoadingComment, setCloseReply } = useCommentStore(
    (state) => ({
      setIsLoadingComment: state.setIsLoading,
      setCloseReply: state.setCloseReply
    }),
    shallow
  );
  const {
    query: { title }
  } = useRouter();
  return {
    localState,
    setLocalState,
    translate,
    title,
    docIndexes,
    setDocIndexes,
    selectedDocIndex,
    setSelectedDocIndex,
    table,
    user,
    enqueueSnackbar,
    setIsLoadingComment,
    setCloseReply
  };
};
const docDetalFunction = ({
  props,
  state,
  setState
}: {
  props: IDocDetailAttribute;
  state: ILocalState;
  setState: Function;
}): IDocDetailFunction => {
  /* ================HANDLE API ================ */

  //handle content tree
  const getContentsTree = async () => {
    const params = {
      document: props.title as string
    };
    const apiRes: IDocIndexResGetAll = await docIndexsApi.getAllIndexs(params);
    props.setDocIndexes(apiRes.data);
    const apiTreeData: IDocIndexTreeData[] = await docIndexsApi.getTreeData(
      props.title as string
    );
    setState((prevState: ILocalState) => ({
      ...prevState,
      contentsTree: apiTreeData
    }));
  };
  const getDocumentById = async () => {
    const res = await bimDocumentsApi.getReadById(props.title as string);
    setState((prevState: ILocalState) => ({
      ...prevState,
      document: res
    }));
  };
  // create comment
  const handleCreateComment = async (jsonObj: ICommentReqCreate) => {
    props.setIsLoadingComment(true);
    const newCommentReqCreate: ICommentReqCreate = {
      content: jsonObj.content,
      fatherId: jsonObj.fatherId,
      createdBy: jsonObj.createdBy
    };
    await commentsApi.postCreate(newCommentReqCreate);
    // getAllComments(fatherId);
    props.setIsLoadingComment(false);
  };
  //handle edit comment
  const handleEditComment = async (id: string, comment: ICommentReqCreate) => {
    props.setIsLoadingComment(true);
    await commentsApi.updateById(id, comment);
    props.setIsLoadingComment(false);
    props.setCloseReply();
  };
  //handle click tree item
  const treeItemOnClick = async (id: string) => {
    const catFilter = props.docIndexes.filter((e) => e._id === id);
    if (catFilter.length > 0) {
      props.setSelectedDocIndex(catFilter[0]);
      setState((prevState: ILocalState) => ({
        ...prevState,
        isLoading: true
      }));

      // Tải dữ liệu content:
      const params = {
        index: catFilter[0]._id
      };
      const contentRes = await docContentsApi.getAllContents(params);
      const newContent =
        contentRes.data.length > 0 ? contentRes.data[0].content : '';
      const newVersion = contentRes.data[0]?.versionNotes
        ? contentRes.data[0].versionNotes
        : '';
      const newCreatedAt = contentRes.data[0]?.createdAt
        ? contentRes.data[0].createdAt
        : '';
      const newTitle = (contentRes.data[0]?.index as IDocIndex)?.title
        ? (contentRes.data[0]?.index as IDocIndex).title
        : '';

      setState((prevState: ILocalState) => ({
        ...prevState,
        //
        isSelectNode: true,
        selectedNode: catFilter[0]._id,
        isSelectIndex: true,
        idIndex: catFilter[0]._id,
        //
        content: newContent,
        versionNote: newVersion,
        createdAt: newCreatedAt,
        selectedTitle: newTitle,
        isLoading: false
      }));
    }

    getAllComments(catFilter[0]._id);
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
  //handle delete comment
  const handleDeleteComment = async (commentId: string, fatherId: string) => {
    props.setIsLoadingComment(true);
    await commentsApi.deleteById(commentId);
    getAllComments(fatherId);
    handleOpenDeleteConfirm(null, fatherId);
    props.table.setPage(0);
    props.setIsLoadingComment(false);
  };
  // handle user in document
  const loadUsersInDocument = async () => {
    const param = {
      document: props.title as string
    };
    const res = await usersInDocumentsApi.getUsersInDocument(param);
    setState((prevState: ILocalState) => ({
      ...prevState,
      usersInDoc: res.data
    }));
  };

  /* ==================HANDLE LOCAL================ */
  //handle render tree
  const renderCategoriesTree = (treeData: IDocIndexTreeData[]) =>
    treeData.map((category) => (
      <StyledTreeItem
        key={category.node._id}
        nodeId={category.node._id}
        labelText={category.node.title}
        // avatar={category.node.avatar}
        // labelIcon={'material-symbols:content-paste-rounded'}
        // labelInfo={category.node.order.toString()}
        color="00AB55"
        bgColor="#3be79036"
        colorForDarkMode="00AB55"
        bgColorForDarkMode="#3be79036"
        onClick={() => treeItemOnClick(category.node._id)}
        // isFirstItem={category.node._id === treeData[0].node._id}
      >
        {category.children.length > 0 ? (
          <>{renderCategoriesTree(category.children)}</>
        ) : null}
      </StyledTreeItem>
    ));
  //handle open delete confirm
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

  return {
    getContentsTree,
    treeItemOnClick,
    renderCategoriesTree,
    handleCreateComment,
    getAllComments,
    handleDeleteComment,
    handleOpenDeleteConfirm,
    handleEditComment,
    loadUsersInDocument,
    getDocumentById
  };
};
const DocDetailContainer = () => {
  let props = docDetailAttribute();
  const { localState, setLocalState } = props;

  let func = docDetalFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  useEffect(() => {
    func.getContentsTree();
    func.loadUsersInDocument();
    func.getDocumentById();
  }, []);
  useEffect(() => {
    if (
      !props.localState.selectedNode &&
      props.localState.contentsTree.length > 0
    ) {
      func.treeItemOnClick(props.localState.contentsTree[0].node._id);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        selectedNode: props.localState.contentsTree[0].node._id
      }));
    }
  }, [props.localState.contentsTree]);
  return <DocDetailComponent props={props} func={func} />;
};
export default DocDetailContainer;
