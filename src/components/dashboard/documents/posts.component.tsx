import React from 'react';
// @mui
import { Container, Box, Button, Stack, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
//next
import { useRouter } from 'next/router';
import NextLink from 'next/link';
//context
import { useSettingsContext } from '../../settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//types
import {
  IDocPostsAttribute,
  IDocPostsFunction
} from '../../../containers/dashboard/documents/posts.container';
// components
import Iconify from '../../iconify';
import ConfirmDialog from '../../confirm-dialog';
import CustomBreadcrumbs from '../../custom-breadcrumbs';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
import EmptyContent from '../../../components/empty-content/EmptyContent';
// sections
import {
  NewDocumentDialog,
  DocumentGridView,
  CategoriesDialog,
  MenuPopupButton
} from '../../../sections/@dashboard/documents';
import { BoxTableSearch } from '../../../sections/@dashboard/share/search-table';

type IDocumentsComponent = {
  props: IDocPostsAttribute;
  func: IDocPostsFunction;
};
//------------------------------------------------
function DocPostsComponent({ props, func }: IDocumentsComponent) {
  const { themeStretch } = useSettingsContext();
  const router = useRouter();
  const isDesktopMd = useResponsive('down', 'md');
  return (
    <Box className="documents-posts">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          className="breadcrumsbs documents-posts__breadcrumsbs"
          heading={`${props.translate('documents.document_manager')}`}
          links={[
            {
              name: `${props.translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            { name: `${props.translate('documents.document')}` }
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
                  component={NextLink}
                  href={PATH_DASHBOARD.document.personal}
                  className="button__create button__personal"
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon="eva:file-text-outline" />}>
                  {`${props.translate('blog.my_posts')}`}
                </Button>
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

        <Box className="documents-posts__content">
          <Stack className="documents-posts__search">
            <Stack className="documents-posts__search-form">
              <BoxTableSearch
                sortBy={props.localState.sortBy}
                table={props.table}
                getAllSearch={func.getDocsSearch}
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
          </Stack>
          {props.localState.loading ? (
            <LoadingWindow />
          ) : !props.isNotFound ? (
            <Box className="documents-posts__grid">
              <DocumentGridView
                table={props.table}
                tableData={props.documents}
                isNotFound={props.isNotFound}
              />
            </Box>
          ) : (
            <Stack>
              <EmptyContent
                title={`${props.translate('common.no_data')}`}
                sx={{
                  '& span.MuiBox-root': { height: 160 }
                }}
              />
            </Stack>
          )}
        </Box>
        <Box className="documents-posts__dialog">
          <CategoriesDialog
            open={props.localState.openCategoriesDialog}
            onClose={() => func.handleCategoriesDialog(false)}
          />

          <NewDocumentDialog
            open={props.localState.openNewDocumentDialog}
            onClose={() => func.handleNewDocument(null)}
          />

          {/* Confirm Delete */}
          <ConfirmDialog {...props.localState.dataDialog} />
          <MenuPopupButton
            isPostsPage={true}
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

DocPostsComponent.propTypes = {};

export default DocPostsComponent;
