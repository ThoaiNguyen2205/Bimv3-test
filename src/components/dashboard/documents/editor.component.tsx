import React, { useEffect, useState } from 'react';
//mui
import { LoadingButton, TreeView } from '@mui/lab';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
//next
import dynamic from 'next/dynamic';
import Head from 'next/head';
//hook
import useResponsive from '../../../hooks/useResponsive';
//locales
import { useLocales } from '../../../locales';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//context
import { useSettingsContext } from '../../../components/settings';
//types
import {
  IDocEditorAttribute,
  IDocEditorFuntion,
  IDocTitle
} from '../../../containers/dashboard/documents/editor.container';
import { IDocIndex } from '../../../shared/types/docIndex';
import { IUser } from '../../../shared/types/user';
//components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import Iconify from '../../../components/iconify/Iconify';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog/ConfirmDialog';
//sections
import {
  BlockTreeView,
  VersionsDialog
} from '../../../sections/@dashboard/documents';
import { Page404 } from '../../../sections/@dashboard/share/error';
const RHFSunEditor = dynamic(
  () => import('../../../components/hook-form/RHFSunEditor'),
  { ssr: false }
);
//--------------------------------------

type IDocEditorProps = {
  props: IDocEditorAttribute;
  func: IDocEditorFuntion;
};
type ILocalState = {
  isScroll: boolean;
};
//--------------------------------------
export default function DocEditorComponent({ props, func }: IDocEditorProps) {
  const { themeStretch } = useSettingsContext();
  const isDesktopMd = useResponsive('down', 'md');
  const { translate } = useLocales();
  const [localState, setLocalState] = useState<ILocalState>({
    isScroll: false
  });
  const isAuthor =
    (props.localState.document?.createdBy as IUser)?.id === props.user?.id;
  const isShare = props.localState.usersInDoc.filter(
    (user) =>
      (user.user as IUser)._id === props.user?.id && user.isEdit === true
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 150) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          isScroll: true
        }));
      } else {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          isScroll: false
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isAuthor && isShare.length === 0) {
    return (
      <Page404
        linkTo={PATH_DASHBOARD.document.root}
        title={`${translate('blog.page_not_found')}`}
        description={`${translate('blog.content_error')}`}
        button={`${translate('documents.back_to_documents')}`}
      />
    );
  }
  return (
    <>
      <Head>
        <title>{`${props.localState.document?.title} | BIMNEXT V3`}</title>
      </Head>
      <Box className="document-editor">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            className="document-editor__breadcrumbs breadcrumsbs"
            heading={`${translate('documents.editor')}`}
            links={[
              {
                name: `${
                  (props.localState.docTitle as IDocTitle)?.categoryName
                }`
              },
              {
                name: `${
                  (props.localState.docTitle as IDocTitle)?.categoryTitle
                }`
              }
            ]}
          />
          <Grid container spacing={3} className="document-editor__grid">
            <Grid
              item
              xs={12}
              md={4}
              className="document-editor__grid-item document-editor__grid-index">
              {isDesktopMd && localState.isScroll && props.content ? (
                <Box className="item-card-fixed">
                  {props.selectedDocIndex?.title}
                </Box>
              ) : (
                <Card className="item-card">
                  <Stack
                    direction="row"
                    spacing={1}
                    className="item-card__form">
                    <TextField
                      className="item-card__form-index"
                      size="small"
                      variant="outlined"
                      label={`${translate('documents.index')}`}
                      value={props.indexName}
                      onChange={func.onIndexNameUpdate}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:rename-box" width={24} />
                          </InputAdornment>
                        )
                      }}
                    />
                    <TextField
                      className="item-card__form-order"
                      size="small"
                      variant="outlined"
                      label={`${translate('documents.order')}`}
                      value={props.order}
                      onChange={func.onOrderUpdate}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify
                              icon="mdi:order-numeric-ascending"
                              width={24}
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    className="item-card__action">
                    {props.localState.isSelectNode ? (
                      <Button
                        className="button__cancel"
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<Iconify icon="basil:cancel-outline" />}
                        onClick={() => func.cancelEdit()}>
                        {`${translate('documents.cancel_selected')}`}
                      </Button>
                    ) : null}
                    <Box className="item-card__action-flexGrow" />

                    <ButtonGroup
                      className="button__group"
                      variant="outlined"
                      color="primary"
                      size="small">
                      <LoadingButton
                        className="button__group-add"
                        size="small"
                        variant="contained"
                        startIcon={
                          <Iconify
                            className="button-add_icon"
                            icon="clarity:employee-group-solid"
                          />
                        }
                        loading={props.localState.isProcessing}
                        onClick={func.onAddIndex}>
                        {`${translate('documents.add')}`}
                      </LoadingButton>
                      <LoadingButton
                        className="button__group-edit"
                        size="small"
                        variant="outlined"
                        // startIcon={<Iconify icon='clarity:employee-group-solid' width={16} height={16} />}
                        loading={props.localState.isProcessing}
                        onClick={func.onEditIndex}
                        // onClick={onEditIndex}
                      >
                        {`${translate('documents.edit')}`}
                      </LoadingButton>

                      <Button
                        className="button__group-delete"
                        onClick={() =>
                          func.handleOpenDeleteConfirm(
                            (props.selectedDocIndex as IDocIndex)._id
                          )
                        }>{`${translate('documents.delete')}`}</Button>
                    </ButtonGroup>
                  </Stack>

                  <BlockTreeView
                    // className="item-card__content"
                    // title={`${translate('documents.existing_categories')}`}
                    sx={{ padding: '0 !important' }}>
                    <Scrollbar className="item-card__scrollbar">
                      <TreeView
                        className="item-card__scrollbar-treeview"
                        aria-label="doc-categories"
                        // defaultExpanded={['0']}
                        defaultCollapseIcon={
                          <Iconify
                            className="icon-collapse"
                            icon="ic:round-arrow-drop-down"
                          />
                        }
                        defaultExpandIcon={
                          <Iconify
                            className="icon-expand"
                            icon="ic:round-arrow-right"
                          />
                        }
                        // defaultEndIcon={<Iconify icon="gis:point" width={24} />}
                        defaultEndIcon={<Box className="icon-end" />}
                        selected={props.localState.selectedNode}>
                        {func.renderCategoriesTree(
                          props.localState.contentsTree
                        )}
                      </TreeView>
                    </Scrollbar>
                  </BlockTreeView>
                </Card>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
              className="document-editor__grid-item document-editor__grid-editor">
              <Card className="item-card">
                <Stack spacing={4} className="item-card__editor">
                  <Typography
                    className="item-card__editor-title"
                    variant="subtitle2">
                    {props.selectedDocIndex?.title}
                  </Typography>
                  <Box className="item-card__editor-form">
                    <RHFSunEditor
                      value={decodeURIComponent(props.content)}
                      height={'300'}
                      handleEditorChange={func.handleChangeContent}
                    />
                  </Box>
                </Stack>
              </Card>
              <Stack className="item-action">
                <Stack className="item-action__version">
                  <TextField
                    className="item-action__version-form"
                    size="small"
                    name="versionnotes"
                    variant="outlined"
                    label={`${translate('documents.version_notes')}`}
                    value={props.versionNotes}
                    onChange={func.onVersionNotesUpdate}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="fluent:text-description-rtl-20-filled"
                            width={24}
                          />
                        </InputAdornment>
                      )
                    }}
                  />
                  <Tooltip
                    className="item-action__version-popup"
                    title={`${translate('documents.versions')}`}
                    placement="top">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        func.handleOpenVersion(true);
                        if (props.localState.idIndex) {
                          func.getVersionsIndex({
                            index: props.localState.idIndex
                          });
                        }
                      }}>
                      <Iconify icon="ri:more-2-fill" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack className="item-action__button">
                  <LoadingButton
                    className="item-action__button-save action__button"
                    // sx={{ fontSize: '14px', paddingY: '4px' }}
                    type="submit"
                    variant="contained"
                    loading={props.localState.isProcessing}
                    onClick={func.onSaveContent}>
                    {`${translate('documents.save')}`}
                  </LoadingButton>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          {/* Confirm Delete */}
          <ConfirmDialog {...props.localState.dataDialog} />

          {/* Confirm Delete */}
          <VersionsDialog
            open={props.localState.openVersions}
            onClose={() => func.handleOpenVersion(false)}
            title={(props.localState.docTitle as IDocTitle)?.categoryTitle}
            index={props.selectedDocIndex?.title as string}
            docVersions={props.localState.docVersions}
            idIndex={props.localState.idIndex}
            getVersions={() =>
              func.getVersionsIndex({
                index: props.localState.idIndex
              })
            }
            handleReturnVersion={() =>
              func.treeItemOnClick(props.localState.contentsTree[0].node._id)
            }
          />
        </Container>
      </Box>
    </>
  );
}
