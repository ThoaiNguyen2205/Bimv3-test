// react
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import * as Yup from 'yup';
// react-color
// @ts-ignore
import { TwitterPicker } from 'react-color';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import {
  List,
  Stack,
  Dialog,
  Button,
  LinearProgress,
  Grid,
  DialogProps,
  DialogTitle,
  DialogContent,
  InputAdornment,
  Typography,
  Tab,
  Box
} from '@mui/material';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import { TreeView } from '@mui/lab';
// hooks
import useResponsive from '../../../../hooks/useResponsive';
// apis
import uploadsApi from '../../../../api/uploadsApi';
import docCategoriesApi from '../../../../api/docCategoriesApi';
// locales
import { useLocales } from '../../../../locales';
// AuthContext
import { useAuthContext } from '../../../../auth/useAuthContext';
// sections
import BlockTreeView from '../BlockTreeView';
import StyledTreeItem from '../../../treeview/StyledTreeItem';
// components
import { ConfirmDialogProps } from '../../../../components/confirm-dialog/types';
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import CategoryItem from '../CategoryItem';
import ConfirmDialog from '../../../../components/confirm-dialog';

import { UploadLandscape } from '../../../../components/upload';

// type
import {
  IDocCategory,
  IDocCategoryReqCreate,
  IDocCategoryResGetAll,
  IDocCategoryTreeData
} from '../../../../shared/types/docCategory';
import { IUser } from '../../../../shared/types/user';
// store
import useDocCategory from '../../../../redux/docCategoryStore';

// ----------------------------------------------------------------------

type ILocalState = {
  categoriesTree: IDocCategoryTreeData[];
  myCategories: IDocCategory[];
  selectedFather: IDocCategory | null;
  isEdit: boolean;
  avatarUrl: string;
  checkUpload: boolean;
  progressShow: boolean;
  progress: number;
  displayColorPicker: boolean;
  pickedColor: string;
  openConfirm: boolean;
  //
  selectedNode: string;
  valueTab: string;
  dataDialog: ConfirmDialogProps;
};

type FormValuesProps = {
  name: string;
  description: string;
};

// ----------------------------------------------------------------------

export interface CategoryDialogProps extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}
export default function CategoriesDialog({
  open,
  onClose,
  ...other
}: CategoryDialogProps) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const isDesktop = useResponsive('up', 'lg');

  const {
    docCategories,
    selectedDocCategory,
    setDocCategories,
    setSelectedDocCategory
  } = useDocCategory(
    (state) => ({
      docCategories: state.datas,
      selectedDocCategory: state.selectedData,
      setDocCategories: state.setDatas,
      setSelectedDocCategory: state.setSelectedData
    }),
    shallow
  );
  const [localState, setLocalState] = useState<ILocalState>({
    categoriesTree: [],
    myCategories: [],
    selectedFather: null,
    isEdit: false,
    avatarUrl: process.env.REACT_APP_APIFILE + 'images/doccategory.jpg',
    checkUpload: false,
    progressShow: false,
    progress: 0,
    displayColorPicker: false,
    pickedColor: selectedDocCategory?.color || '#00AB55',
    openConfirm: false,
    //
    selectedNode: '',
    valueTab: '1',
    dataDialog: {
      open: false,
      onClose: () => {}
    }
  });
  const editGroupSchema = Yup.object().shape({
    name: Yup.string()
      .max(20, translate('documents.category_name_maxlength'))
      .required(translate('documents.category_name_required')),
    description: Yup.string()
      .max(200, translate('documents.category_description_maxlength'))
      .required(translate('documents.category_description_required'))
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedDocCategory?.name || '',
      description: selectedDocCategory?.description || ''
    }),
    [selectedDocCategory]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(editGroupSchema),
    defaultValues
  });

  const {
    reset,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = methods;
  /* ================HANDLE API ================== */

  //handle get categories
  const loadAllCategories = useCallback(async () => {
    const apiRes: IDocCategoryResGetAll =
      await docCategoriesApi.getAllDocCategories(null);
    setDocCategories(apiRes.data);

    const myCats = apiRes.data.filter(
      (item) => (item.createdBy as IUser)._id === user?.id
    );
    const apiTreeData: IDocCategoryTreeData[] =
      await docCategoriesApi.getTreeData();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      categoriesTree: apiTreeData,
      myCategories: myCats
    }));
  }, []);
  //handle submit
  const onSubmit = async (data: any) => {
    let avatar = 'doccategory.jpg';
    if (localState.isEdit && selectedDocCategory !== null) {
      avatar = selectedDocCategory.avatar;
    }

    if (localState.checkUpload) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        progressShow: true
      }));
      const formData = new FormData();
      formData.append('image', localState.avatarUrl);
      const onUploadProgress = (e: any) => {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          progress: Math.round((100 * e.loaded) / e.total)
        }));
      };
      const ufileResponse = await uploadsApi.uploadImage(
        formData,
        onUploadProgress
      );
      avatar = ufileResponse.filename;
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        progressShow: false
      }));
    }

    if (localState.isEdit && selectedDocCategory !== null) {
      const newCategoryReq: IDocCategoryReqCreate = {
        father: selectedDocCategory.father,
        name: data.name,
        description: data.description,
        avatar: avatar,
        color: localState.pickedColor,
        createdBy: user?.id
      };
      await docCategoriesApi.updateById(
        selectedDocCategory._id,
        newCategoryReq
      );
      enqueueSnackbar(`${translate('documents.modify_success')}`, {
        variant: 'success'
      });
    } else {
      // Kiểm tra tên trùng
      const checkNames = await docCategoriesApi.getAllDocCategories(data.name);
      if (checkNames.data.length > 0) {
        enqueueSnackbar(`${translate('documents.similar_catagory_name')}`, {
          variant: 'error'
        });
        return;
      }
      const newCategoryReq: IDocCategoryReqCreate = {
        father: '',
        name: data.name,
        description: data.description,
        avatar: avatar,
        color: localState.pickedColor,
        createdBy: user?.id
      };
      if (localState.selectedFather !== null) {
        newCategoryReq.father = localState.selectedFather._id;
      }
      await docCategoriesApi.postCreate(newCategoryReq);
      enqueueSnackbar(`${translate('documents.add_success')}`, {
        variant: 'success'
      });
    }

    loadAllCategories();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      avatarUrl: process.env.REACT_APP_APIFILE + 'images/doccategory.jpg',
      checkUpload: false,
      pickedColor: '#00AB55',
      isEdit: false
    }));
    setSelectedDocCategory(null);
    reset(defaultValues);
    setValue('name', '');
    setValue('description', '');
    cancelFather();
  };
  /* =============HANDLE LOCAL ============ */

  //handle cancel edit
  const cancelEdit = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isEdit: false,
      checkUpload: false,
      pickedColor: '#00AB55'
    }));
    setSelectedDocCategory(null);
    setValue('name', '');
    setValue('description', '');
  };
  //handle cancel father
  const cancelFather = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedFather: null,
      selectedNode: ''
    }));
  };
  //handle edit category
  const handleEditDocCategory = (category: IDocCategory) => {
    setSelectedDocCategory(category);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isEdit: true,
      pickedColor: category.color
    }));
  };
  //handle confirm
  const handleOpenConfirm = (category: IDocCategory) => {
    setSelectedDocCategory(category);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openConfirm: true
    }));
  };

  const handleCloseConfirm = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openConfirm: false
    }));
    setValue('name', '');
    setValue('description', '');
  };
  //handle deleted category
  const onDeleteDocCategory = async (category: IDocCategory, id: string) => {
    if (selectedDocCategory) {
      const deleteGroup = await docCategoriesApi.deleteById(id);
      if (deleteGroup) {
        loadAllCategories();
        handleCloseConfirm();
        setSelectedDocCategory(null);
        setValue('name', '');
        setValue('description', '');
      }
      enqueueSnackbar(`${translate('documents.delete_success')}`, {
        variant: 'success'
      });
      cancelFather();
      cancelEdit();
      handleOpenDeleteConfirm(category, null);
    }
  };
  //handle drop avatar
  const handleDropAvatar = useCallback((acceptedFiles: any) => {
    const file = acceptedFiles[0];
    if (file) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: Object.assign(file, {
          preview: URL.createObjectURL(file)
        }),
        checkUpload: true
      }));
    }
  }, []);
  //handle click treeitem
  const treeItemOnClick = (id: string) => {
    const catFilter = docCategories.filter((e) => e._id === id);
    if (catFilter.length > 0) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,

        selectedFather: catFilter[0],
        selectedNode: catFilter[0]._id
      }));
    }
  };
  //handle categories tree
  const renderCategoriesTree = (treeData: IDocCategoryTreeData[]) =>
    treeData.map((category) => (
      <StyledTreeItem
        key={category.node._id}
        nodeId={category.node._id}
        labelText={category.node.name}
        avatar={category.node.avatar}
        // labelIcon={'ic:round-info'}
        labelInfo={category.node.posts.toString()}
        color={category.node.color}
        bgColor="#3be79036"
        colorForDarkMode={category.node.color}
        bgColorForDarkMode="#3be79036"
        onClick={() => {
          treeItemOnClick(category.node._id);
          cancelEdit();
        }}>
        {category.children.length > 0 ? (
          <>{renderCategoriesTree(category.children)}</>
        ) : null}
      </StyledTreeItem>
    ));
  //handle change tab
  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      valueTab: newValue
    }));
    // cancelFather();
  };
  //handle delete confirm
  const handleOpenDeleteConfirm = (
    category: IDocCategory,
    id: string | null
  ) => {
    setSelectedDocCategory(category);
    let dataDialog: ConfirmDialogProps = {
      open: false,
      onClose: () => handleOpenDeleteConfirm(category, null)
    };
    if (id === null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        dataDialog
      }));
      return;
    }
    dataDialog = {
      open: true,
      onClose: () => handleOpenDeleteConfirm(category, null),
      title: `${translate('documents.category')} ${category.name}`,
      content: `${translate('common.delete_confirm')}`,
      action: (
        <Button
          variant="contained"
          color="error"
          onClick={() => onDeleteDocCategory(category, id)}>
          {`${translate('common.delete')}`}
        </Button>
      )
    };
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      dataDialog
    }));
  };
  useEffect(() => {
    loadAllCategories();
  }, []);

  useEffect(() => {
    if (selectedDocCategory !== null && localState.isEdit === true) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl:
          process.env.REACT_APP_APIFILE + 'images/' + selectedDocCategory.avatar
      }));
    } else {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        avatarUrl: process.env.REACT_APP_APIFILE + 'images/doccategory.jpg'
      }));
    }
  }, [localState.isEdit, selectedDocCategory]);

  useEffect(() => {
    if (selectedDocCategory !== null) {
      reset(defaultValues);
    }
  }, [selectedDocCategory]);
  return (
    <Dialog
      className="category-dialog"
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('documents.category')}`} </DialogTitle>
        <DialogContent className="category-dialog__content">
          <Grid container spacing={2} className="content-grid">
            <Grid item xs={12} md={6} className="content-grid__tabs">
              <Box
                sx={{ typography: 'body1' }}
                className="content-grid__tabs-box">
                <TabContext value={localState.valueTab}>
                  <Box className="tabs-context">
                    <TabList
                      className="tabs-context__list"
                      onChange={handleChangeTab}
                      aria-label="lab API tabs example">
                      <Tab
                        label={`${translate('common.all')}`}
                        value="1"
                        className="tabs-context__list-item"
                      />
                      <Tab
                        label={`${translate('documents.my_category')}`}
                        value="2"
                        className="tabs-context__list-item"
                      />
                    </TabList>
                  </Box>
                  <TabPanel value="1" className="tabs-panel">
                    <BlockTreeView sx={{ padding: '0 !important' }}>
                      <Scrollbar
                        // sx={{ height: 65 * 6, p: 2 }}
                        className="tabs-panel__scrollbar">
                        <TreeView
                          className="tabs-panel__scrollbar-list"
                          aria-label="doc-categories"
                          // defaultExpanded={['0']}
                          defaultCollapseIcon={
                            <Iconify
                              className="collapse-icon"
                              icon="ic:round-arrow-drop-down"
                            />
                          }
                          defaultExpandIcon={
                            <Iconify
                              className="expand-icon"
                              icon="ic:round-arrow-right"
                            />
                          }
                          // defaultEndIcon={<Iconify icon="gis:point" width={24} />}
                          defaultEndIcon={<Box className="end-icon" />}
                          // sx={{ flexGrow: 1, maxWidth: 800, overflowY: 'auto' }}
                          selected={localState.selectedNode}>
                          {renderCategoriesTree(localState.categoriesTree)}
                        </TreeView>
                      </Scrollbar>
                    </BlockTreeView>
                  </TabPanel>
                  <TabPanel value="2" className="tabs-panel panel-2">
                    {/* <Stack direction="row" sx={{ mt: 1 }}> */}
                    <Scrollbar
                      className="tabs-panel-2__scrollbar"
                      sx={
                        {
                          // height: 65 * 6,
                          // backgroundColor: 'rgba(145, 158, 171, 0.04)',
                          // border: '1px solid rgba(145, 158, 171, 0.24)',
                          // borderRadius: '12px',
                          // p: 2
                        }
                      }>
                      <List
                        disablePadding
                        className="tabs-panel-2__scrollbar-list">
                        {localState.myCategories.map((category) => (
                          <CategoryItem
                            key={category._id}
                            category={category}
                            onEdit={() => {
                              handleEditDocCategory(category);
                              treeItemOnClick(category._id);
                            }}
                            onDelete={() => {
                              handleOpenDeleteConfirm(category, category._id);
                            }}
                          />
                        ))}
                      </List>
                    </Scrollbar>
                    {/* </Stack> */}
                  </TabPanel>
                  <Stack className="tabs-footer">
                    <Typography className="tabs-footer__text" variant="caption">
                      {`${translate('documents.selected_category')} ${
                        localState.selectedFather === null
                          ? ''
                          : localState.selectedFather.name
                      }`}
                    </Typography>
                    <Button
                      className="tabs-footer__button"
                      variant="outlined"
                      color="inherit"
                      startIcon={<Iconify icon="basil:cancel-outline" />}
                      onClick={() => cancelFather()}>
                      {`${translate('documents.cancel_selected')}`}
                    </Button>
                  </Stack>
                </TabContext>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} className="content-grid__form">
              <Stack className="form__upload">
                <UploadLandscape
                  file={localState.avatarUrl}
                  onDrop={handleDropAvatar}
                  helperText={
                    <Typography className="form__upload-note" variant="caption">
                      {`${translate('customers.file_accepted')}`}
                    </Typography>
                  }
                  sx={{ height: 330 }}
                />
                {localState.progressShow ? (
                  <LinearProgress
                    variant="determinate"
                    value={localState.progress}
                    color="success"
                  />
                ) : null}
              </Stack>
              <Stack direction="row" spacing={1} className="form__title">
                <Box className="form__title-color">
                  <Box
                    className="color-selected"
                    onClick={() => {
                      setLocalState((prevState: ILocalState) => ({
                        ...prevState,
                        displayColorPicker: true
                      }));
                    }}
                    sx={{
                      backgroundColor: localState.pickedColor,
                      color: localState.pickedColor
                    }}
                  />
                  {localState.displayColorPicker ? (
                    <Box className="color-dialog">
                      <Box
                        className="color-dialog__close"
                        onClick={() => {
                          setLocalState((prevState: ILocalState) => ({
                            ...prevState,
                            displayColorPicker: false
                          }));
                        }}
                      />
                      <TwitterPicker
                        className="color-dialog__item"
                        color={localState.pickedColor}
                        onChange={(e: any) => {
                          setLocalState((prevState: ILocalState) => ({
                            ...prevState,
                            pickedColor: e.hex
                          }));
                        }}
                      />
                    </Box>
                  ) : (
                    <></>
                  )}
                </Box>
                <RHFTextField
                  className="form__title-input"
                  size="small"
                  name="name"
                  variant="outlined"
                  fullWidth
                  label={`${translate('customers.name')}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:rename-box" width={24} />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
              <Stack className="form__description">
                <RHFTextField
                  className="form__description-input"
                  size="small"
                  name="description"
                  variant="outlined"
                  fullWidth
                  label={`${translate('common.description')}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          className="form__description-icon"
                          icon="fluent:text-description-rtl-20-filled"
                          width={24}
                        />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
              <Stack className="form__button">
                {localState.isEdit ? (
                  <LoadingButton
                    className="form__button-cancel button-small"
                    variant="outlined"
                    color="error"
                    startIcon={<Iconify icon="ooui:cancel" />}
                    onClick={cancelEdit}>
                    {`${translate('common.cancel')}`}
                  </LoadingButton>
                ) : null}
                <Box className="form__button-flex-grow" />
                {onClose && (
                  <Button
                    className="form__button-close button-small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon="mdi:exit-to-app" />}
                    onClick={onClose}>
                    {`${translate('common.close')}`}
                  </Button>
                )}
                <LoadingButton
                  className="form__button-submit button-small"
                  type="submit"
                  variant="contained"
                  startIcon={<Iconify icon="clarity:employee-group-solid" />}
                  loading={isSubmitting}>
                  {localState.isEdit
                    ? `${translate('common.modify')}`
                    : `${translate('common.add')}`}
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <ConfirmDialog {...localState.dataDialog} />
      </FormProvider>
    </Dialog>
  );
}
