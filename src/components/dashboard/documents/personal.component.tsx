import React from 'react';
//mui
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Container, Fab, Stack, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
//locales
import { useLocales } from '../../../locales';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//contexts
import { useSettingsContext } from '../../../components/settings';
//hooks
import useResponsive from '../../../hooks/useResponsive';
//types
import {
  IProDocumentsAttribute,
  IProDocumentsFunction
} from '../../../containers/dashboard/documents/personal.container';
//components
import ConfirmDialog from '../../../components/confirm-dialog/ConfirmDialog';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import Iconify from '../../../components/iconify/Iconify';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
//sections
import {
  CategoriesDialog,
  MenuPopupButton,
  NewDocumentDialog
} from '../../../sections/@dashboard/documents';
import {
  DocumentListView,
  InvitationsDialog,
  PermitDialog
} from '../../../sections/@dashboard/documents';
import { BoxTableSearch } from '../../../sections/@dashboard/share/search-table';
import { BoxInfoCover } from '../../../sections/@dashboard/share/dialog';
type IProDocumentsComponent = {
  props: IProDocumentsAttribute;
  func: IProDocumentsFunction;
};

export default function DocPersonalComponent({
  props,
  func
}: IProDocumentsComponent) {
  const { translate } = useLocales();
  const { themeStretch } = useSettingsContext();
  const [value, setValue] = React.useState('1');
  const isDesktopMd = useResponsive('down', 'md');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <Box className="documents-personal">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          className="breadcrumsbs documents-personal__breadcrumsbs"
          heading={`${props.translate('documents.document_manager')}`}
          links={[
            {
              name: `${props.translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            {
              name: `${props.translate('documents.document')}`,
              href: PATH_DASHBOARD.document.homepage
            },
            { name: `${props.translate('blog.my_posts')}` }
          ]}
          action={
            isDesktopMd ? (
              <Box className="documents-posts__breadcrumsbs-action breadcrumbs__action">
                <Fab
                  size="small"
                  color="primary"
                  aria-label="add"
                  onClick={func.handleOpenPopover}>
                  <AddIcon />
                </Fab>
              </Box>
            ) : (
              <Box className="documents-posts__breadcrumsbs-action breadcrumbs__action">
                <Button
                  className="button__create button__create-category"
                  variant="contained"
                  startIcon={
                    <Iconify icon="fluent:document-ribbon-32-regular" />
                  }
                  onClick={() => func.handleCategoriesDialog(true)}>
                  {`${props.translate('documents.category')}`}
                </Button>
                <Button
                  className="button__create button__create-doccument"
                  variant="contained"
                  startIcon={<Iconify icon="ion:document-attach-outline" />}
                  onClick={() => func.openEditProjectDialog(null, true, false)}>
                  {`${props.translate('documents.new_doc')}`}
                </Button>
              </Box>
            )
          }
        />
        <Box className="documents-personal__search">
          <Stack className="documents-personal__search-form">
            <BoxTableSearch
              sortBy={props.localState.sortBy}
              table={props.table}
              getAllSearch={func.getDocsSearchByUser}
              handleSearchKeyName={func.handleSearchKeyName}
              handleChangeSortBy={func.handleChangeSortBy}
              sortOptions={props.SORT_OPTIONS}
              categoryOptions={props.CATEGORIES_OPTIONS}
              keySearch={props.localState.keySearch}
              filterCategory={props.localState.filterCategory}
              handleFilterCategory={func.handleFilterCategory}
              resetForm={func.handleResetFilter}
              isFiltered={props.isFiltered}
              datePicker={props.datePicker}
            />
          </Stack>
        </Box>
        <Box className="documents-personal__content">
          {props.loading ? (
            <LoadingWindow />
          ) : (
            <Box className="documents-personal__content-tabs">
              <TabContext value={value}>
                <Box className="documents-tabs__context">
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example">
                    <Tab label={`${translate('blog.my_posts')}`} value="1" />
                    <Tab
                      label={`${translate('documents.posts_share')}`}
                      value="2"
                    />
                  </TabList>
                </Box>
                <TabPanel value="1" className="tab-panel tab-panel-1">
                  <DocumentListView
                    table={props.table}
                    tableData={props.documents}
                    dataFiltered={props.documents}
                    isNotFound={props.isNotFound}
                    showEditDocument={func.handleNewDocument}
                    onDeleteDocument={func.handleDeleteConfirm}
                    jumpToEditor={func.handleEditDocument}
                    onShareDocument={func.handleOpenShareForm}
                    onSetPermit={func.handleOpenPermitForm}
                    viewCover={func.handleOpenViewCover}
                    resetFormEditor={func.resetFormEditor}
                  />
                </TabPanel>
                <TabPanel value="2" className="tab-panel tab-panel-2">
                  <DocumentListView
                    table={props.table}
                    tableData={props.localState.documentsShare}
                    dataFiltered={props.localState.documentsShare}
                    isNotFound={props.isNotFoundShare}
                    showEditDocument={func.handleNewDocument}
                    onDeleteDocument={func.handleDeleteConfirm}
                    jumpToEditor={func.handleEditDocument}
                    onShareDocument={func.handleOpenShareForm}
                    onSetPermit={func.handleOpenPermitForm}
                    viewCover={func.handleOpenViewCover}
                    resetFormEditor={func.resetFormEditor}
                  />
                </TabPanel>
              </TabContext>
            </Box>
          )}
        </Box>

        <Box className="doccument__dialog">
          <CategoriesDialog
            open={props.localState.openCategoriesDialog}
            onClose={() => func.handleCategoriesDialog(false)}
          />

          <NewDocumentDialog
            open={props.localState.openNewDocumentDialog}
            isEdit={props.localState.isEdit}
            onClose={() => func.handleNewDocument(null)}
          />

          {/* Confirm Delete */}
          <ConfirmDialog {...props.localState.dataDialog} />

          <InvitationsDialog
            open={props.localState.openShare}
            onClose={func.handleCloseShareForm}
            document={props.selectedDocument}
          />

          <PermitDialog
            open={props.localState.openPermission}
            onClose={func.handleClosePermitForm}
          />
          <BoxInfoCover {...props.localState.dataDialogView} />
          <MenuPopupButton
            isPostsPage={false}
            handleCategoriesDialog={func.handleCategoriesDialog}
            openEditProjectDialog={func.openEditProjectDialog}
            open={props.localState.openPopover}
            onClose={func.handleClosePopover}
          />
        </Box>
      </Container>
    </Box>
  );
}
