import React, { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
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
//type
import { AuthUserType } from '../../../auth/types';
import { ConfirmDialogProps } from '../../../components/confirm-dialog/types';
import { IBimDocument } from '../../../shared/types/bimDocument';
import { IDocCategory } from '../../../shared/types/docCategory';
import {
  IDocContent,
  IDocContentReqCreate,
  ITreeItem
} from '../../../shared/types/docContent';
import {
  IDocIndex,
  IDocIndexReqCreate,
  IDocIndexResGetAll,
  IDocIndexTreeData
} from '../../../shared/types/docIndex';
import { ISearchBy } from '../../../shared/types/searchBy';
import { IUserInDocument } from '../../../shared/types/usersInDocument';
//store
import useDocEditor from '../../../redux/docEditorStore/docEditorStore';
import useDocIndex from '../../../redux/docIndexStore';
//api
import bimDocumentsApi from '../../../api/bimDocumentsApi';
import docContentsApi from '../../../api/docContentsApi';
import docIndexsApi from '../../../api/docIndexsApi';
import usersInDocumentsApi from '../../../api/usersInDocumentsApi';
//context
import { useAuthContext } from '../../../auth/useAuthContext';
//component
import DocEditorComponent from '../../../components/dashboard/documents/editor.component';
//section
import StyledTreeItem from '../../../sections/treeview/StyledTreeItem';
//---------------------------------------
type IValueReset = {
  index: string;
  order: string;
  content: string;
  versionNotes: string;
};
export type IDocEditorAttribute = {
  localState: ILocalState;
  setLocalState: React.Dispatch<React.SetStateAction<ILocalState>>;
  user: AuthUserType;
  translate: (text: any, options?: any) => TFunctionDetailedResult<object>;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey;
  title: string | string[] | undefined;
  docIndexes: IDocIndex[];
  setDocIndexes: (docIndexs: IDocIndex[]) => void;
  selectedDocIndex: IDocIndex | null;
  setSelectedDocIndex: (docIndex: IDocIndex | null) => void;
  indexName: string;
  order: string;
  versionNotes: string;
  content: string;
  onIndexName: (newValue: string) => void;
  onOrderName: (newValue: string) => void;
  onVersionName: (newValue: string) => void;
  setItemTreeClick: (item: ITreeItem) => void;
  setIdVersionCreate: (newValue: string) => void;
};
export type IDocEditorFuntion = {
  loadDocumentsDetail: () => Promise<void>;
  loadAllContents: () => Promise<void>;
  onAddIndex: () => Promise<void>;
  onEditIndex: () => Promise<void>;
  onDeleteIndex: (indexId: string) => Promise<void>;
  onSaveContent: () => Promise<void>;
  treeItemOnClick: (id: string) => Promise<void>;
  renderCategoriesTree: (treeData: IDocIndexTreeData[]) => JSX.Element[];
  onIndexNameUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOrderUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVersionNotesUpdate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cancelEdit: () => void;
  handleChangeContent: (value: string) => void;
  handleOpenDeleteConfirm: (indexId: string | null) => void;
  getVersionsIndex: (data: ISearchBy) => Promise<void>;
  handleOpenVersion: (value: boolean) => void;
  loadUsersInDocument: () => Promise<void>;
};
export type IDocTitle = {
  categoryName: string;
  categoryTitle: string;
};
type ILocalState = {
  docVersions: IDocContent[];
  openVersions: boolean;
  document: IBimDocument | null;
  contentsTree: IDocIndexTreeData[];
  contentInput: string;
  //
  isSelectNode: boolean;
  isProcessing: boolean;
  selectedNode: string;
  isSelectIndex: boolean;
  valueReset: IValueReset;
  docTitle: IDocTitle | null;
  idIndex: string;
  dataDialog: ConfirmDialogProps;
  usersInDoc: IUserInDocument[];
};
const docEditorAttribute = (): IDocEditorAttribute => {
  const [localState, setLocalState] = useState<ILocalState>({
    docVersions: [],
    contentsTree: [],
    document: null,
    usersInDoc: [],
    openVersions: false,
    valueReset: {
      index: '',
      order: '',
      content: '',
      versionNotes: ''
    },

    contentInput: '',
    isSelectNode: false,
    isProcessing: false,
    selectedNode: '',
    isSelectIndex: false,
    docTitle: null,
    idIndex: '',
    dataDialog: {
      open: false,
      onClose: () => {}
    }
  });
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const {
    query: { title }
  } = useRouter();
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
  const {
    indexName,
    order,
    versionNotes,
    content,
    onIndexName,
    onOrderName,
    onVersionName,
    setItemTreeClick,
    setIdVersionCreate
  } = useDocEditor(
    (state) => ({
      indexName: state.indexName,
      order: state.order,
      versionNotes: state.versionNotes,
      content: state.content,
      onIndexName: state.onIndexName,
      onOrderName: state.onOrderName,
      onVersionName: state.onVersionName,
      setItemTreeClick: state.setItemTreeClick,
      setContent: state.setContent,
      setIdVersionCreate: state.setIdVersionCreate
    }),
    shallow
  );

  return {
    localState,
    setLocalState,
    user,
    translate,
    enqueueSnackbar,
    title,
    docIndexes,
    setDocIndexes,
    selectedDocIndex,
    setSelectedDocIndex,
    indexName,
    order,
    versionNotes,
    content,
    onIndexName,
    onOrderName,
    onVersionName,
    setItemTreeClick,
    setIdVersionCreate
  };
};
const docEditorFunction = ({
  props,
  state,
  setState
}: {
  props: IDocEditorAttribute;
  state: ILocalState;
  setState: Function;
}): IDocEditorFuntion => {
  /*=============== HANDLE API ============= */
  // handle load document detail
  const loadDocumentsDetail = async () => {
    const apiRes: IBimDocument = await bimDocumentsApi.getReadById(
      props.title as string
    );
    const categoryObj = apiRes.category as IDocCategory;
    setState((prevState: ILocalState) => ({
      ...prevState,
      docTitle: {
        categoryTitle: apiRes.title,
        categoryName: categoryObj.name
      },
      document: apiRes
    }));
  };
  //handle load all content
  const loadAllContents = async () => {
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
    //handle add index
  };
  const onAddIndex = async () => {
    if (props.indexName === '') {
      props.enqueueSnackbar(
        `${props.translate('documents.index_name_required')}`,
        {
          variant: 'warning'
        }
      );
      return;
    }
    if (props.order === '') {
      props.enqueueSnackbar(`${props.translate('documents.order_required')}`, {
        variant: 'warning'
      });
      return;
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      isProcessing: true
    }));
    const newContentData: IDocIndexReqCreate = {
      document: props.title as string,
      title: props.indexName,
      order: parseInt(props.order),
      createdBy: props.user?.id,
      updatedBy: props.user?.id
    };

    if (props.selectedDocIndex !== null) {
      newContentData.father = props.selectedDocIndex._id;
    }
    await docIndexsApi.postCreate(newContentData);
    loadAllContents();
    setState((prevState: ILocalState) => ({
      ...prevState,
      isProcessing: false
    }));
    props.setItemTreeClick(props.localState.valueReset);
    props.setSelectedDocIndex(null);
    props.enqueueSnackbar(`${props.translate('documents.add_success')}`, {
      variant: 'success'
    });
  };
  //handle edit index
  const onEditIndex = async () => {
    if (props.localState.isSelectIndex === true && props.indexName !== '') {
      setState((prevState: ILocalState) => ({
        ...prevState,
        isProcessing: true
      }));
      const newContentData: IDocIndexReqCreate = {
        father: props.selectedDocIndex?.father,
        document: props.title as string,
        title: props.indexName,
        order: parseInt(props.order),
        updatedBy: props.user?.id
      };
      await docIndexsApi.updateById(
        (props.selectedDocIndex as IDocIndex)._id,
        newContentData
      );
      loadAllContents();
      setState((prevState: ILocalState) => ({
        ...prevState,
        isProcessing: false
      }));
      // setResetValue();
      props.setSelectedDocIndex(null);
      props.enqueueSnackbar(`${props.translate('documents.edit_success')}`, {
        variant: 'success'
      });
      return;
    }
    props.enqueueSnackbar(
      `${props.translate('documents.edit_index_required')}`,
      {
        variant: 'warning'
      }
    );
  };
  //handle delete index
  const onDeleteIndex = async (indexId: string) => {
    try {
      await docIndexsApi.deleteById(indexId);
      loadAllContents();
      setState((prevState: ILocalState) => ({
        ...prevState,
        isProcessing: false
      }));
      props.setItemTreeClick(props.localState.valueReset);
      props.setSelectedDocIndex(null);
      props.enqueueSnackbar(`${props.translate('documents.delete_success')}`, {
        variant: 'success'
      });
    } catch (e: any) {
      props.enqueueSnackbar(e, { variant: 'error' });
    }
    handleOpenDeleteConfirm(null);
  };
  // handle save content
  const onSaveContent = async () => {
    if (props.versionNotes === '') {
      props.enqueueSnackbar(
        `${props.translate('documents.version_notes_required')}`,
        {
          variant: 'warning'
        }
      );
      return;
    }
    if (props.selectedDocIndex === null) {
      props.enqueueSnackbar(
        `${props.translate('documents.unselected_index')}`,
        {
          variant: 'warning'
        }
      );
      return;
    }
    setState((prevState: ILocalState) => ({
      ...prevState,
      isProcessing: false
    }));

    const newContentData: IDocContentReqCreate = {
      index: props.selectedDocIndex?._id,
      content: props.localState.contentInput,
      versionNotes: props.versionNotes,
      createdBy: props.user?.id
    };
    //Kiểm tra xem tên phiên bản đã tồn tại chưa
    const resVersion = await docContentsApi.getAllContents({
      index: props.selectedDocIndex._id
    });
    const findVersionNote = resVersion.data.find(
      (ver) => ver.versionNotes === props.versionNotes
    );
    if (!findVersionNote) {
      const newContent = await docContentsApi.postCreate(newContentData);
      props.enqueueSnackbar(
        `${props.translate('documents.save_content_successfull')}`
      );
      setState((prevState: ILocalState) => ({
        ...prevState,
        isProcessing: false,
        idVersion: newContent._id
      }));
      props.setIdVersionCreate(newContent._id);
      return;
    }
    props.enqueueSnackbar(
      `${props.translate('documents.version_save_required')}`,
      {
        variant: 'warning'
      }
    );
    setState((prevState: ILocalState) => ({
      ...prevState,
      isProcessing: false
    }));

    return;
  };
  // handle click tree item
  const treeItemOnClick = async (id: string) => {
    const catFilter = props.docIndexes.filter((e) => e._id === id);
    if (catFilter.length > 0) {
      props.setSelectedDocIndex(catFilter[0]);
      // Tải dữ liệu content:
      const params = {
        index: catFilter[0]._id
      };
      const contentRes = await docContentsApi.getAllContents(params);

      setState((prevState: ILocalState) => ({
        ...prevState,
        isSelectNode: true,
        selectedNode: catFilter[0]._id,
        isSelectIndex: true,
        idIndex: catFilter[0]._id
      }));
      const newContent =
        contentRes.data.length > 0 ? contentRes.data[0].content : '';
      const newVersion = contentRes.data[0]?.versionNotes
        ? contentRes.data[0].versionNotes
        : '';

      const treeItem: ITreeItem = {
        index: catFilter[0].title,
        order: catFilter[0].order.toString(),
        content: newContent,
        versionNotes: newVersion
      };
      props.setItemTreeClick(treeItem);
    }
  };
  // handle render tree
  const renderCategoriesTree = (treeData: IDocIndexTreeData[]) =>
    treeData.map((category) => (
      <StyledTreeItem
        key={category.node._id}
        nodeId={category.node._id}
        labelText={category.node.title}
        // avatar={category.node.avatar}
        // labelIcon={'material-symbols:content-paste-rounded'}
        labelInfo={category.node.order.toString()}
        color="00AB55"
        bgColor="#3be79036"
        colorForDarkMode="00AB55"
        bgColorForDarkMode="#3be79036"
        onClick={() => treeItemOnClick(category.node._id)}>
        {category.children.length > 0 ? (
          <>{renderCategoriesTree(category.children)}</>
        ) : null}
      </StyledTreeItem>
    ));
  const getVersionsIndex = async (data: ISearchBy) => {
    const res = await docContentsApi.getAllContents(data);
    setState((prevState: ILocalState) => ({
      ...prevState,
      docVersions: res.data
    }));
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
  /*==============HANDLE LOCAL ================ */
  // handle index name update
  const onIndexNameUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    props.onIndexName(newValue);
  };
  // handle order update
  const onOrderUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    props.onOrderName(newValue);
  };
  //handle version update
  const onVersionNotesUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    props.onVersionName(newValue);
  };
  // handle cancel edit
  const cancelEdit = () => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      selectedNode: '',
      isSelectNode: false,
      isSelectIndex: false
    }));
    props.setItemTreeClick(props.localState.valueReset);
    props.setSelectedDocIndex(null);
  };
  const handleChangeContent = (value: string) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      contentInput: encodeURIComponent(value)
    }));
  };
  const handleOpenDeleteConfirm = (indexId: string | null) => {
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleOpenDeleteConfirm(null)
    };
    if (indexId === null) {
      setState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenDeleteConfirm(null),
      title: `${props.translate('documents.index')} ${
        props.selectedDocIndex?.title
      }`,
      content: `${props.translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={() => onDeleteIndex(indexId)}>
          {`${props.translate('common.delete')}`}
        </Button>
      )
    };
    setState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };
  //handle open versions
  const handleOpenVersion = (value: boolean) => {
    setState((prevState: ILocalState) => ({
      ...prevState,
      openVersions: value
    }));
  };
  return {
    loadDocumentsDetail,
    loadAllContents,
    onAddIndex,
    onEditIndex,
    onDeleteIndex,
    onSaveContent,
    treeItemOnClick,
    renderCategoriesTree,
    onIndexNameUpdate,
    onOrderUpdate,
    onVersionNotesUpdate,
    cancelEdit,
    handleChangeContent,
    handleOpenDeleteConfirm,
    getVersionsIndex,
    handleOpenVersion,
    loadUsersInDocument
  };
};
//---------------------------------------
const DocEditorContainer = () => {
  let props = docEditorAttribute();
  const { localState, setLocalState } = props;
  let func = docEditorFunction({
    props,
    state: localState,
    setState: setLocalState
  });
  useEffect(() => {
    func.loadAllContents();
    func.loadUsersInDocument();
  }, [props.title]);
  useEffect(() => {
    func.loadDocumentsDetail();
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
  return <DocEditorComponent props={props} func={func} />;
};
export default DocEditorContainer;
