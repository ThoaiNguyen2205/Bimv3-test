import React from 'react';
//mui
import { Box, Button, Container, Stack } from '@mui/material';
//next
import NextLink from 'next/link';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//locales
import { useLocales } from '../../../locales';
//context
import { useSettingsContext } from '../../../components/settings';
//types
import {
  IPersonalAttribure,
  IPersonalFunction
} from '../../../containers/dashboard/blog/personal.container';
//components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
import ConfirmDialog from '../../../components/confirm-dialog/ConfirmDialog';
//sections
import {
  BlogNewPostButton,
  BlogPostListView,
  CopyLinkDialog
} from '../../../sections/@dashboard/blog';
import { BoxTableSearch } from '../../../sections/@dashboard/share/search-table';
import { BoxInfoCover } from '../../../sections/@dashboard/share/dialog';
//-----------------------------------------
type IPersonalComponen = {
  props: IPersonalAttribure;
  func: IPersonalFunction;
};
export default function BlogPersonalComponent({
  props,
  func
}: IPersonalComponen) {
  const { themeStretch } = useSettingsContext();
  const { translate } = useLocales();
  return (
    <div className="blog-personal">
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        className="blog-personal__header">
        <CustomBreadcrumbs
          className="blog-personal__breadcrumbs breadcrumbs"
          heading={`${translate('blog.my_posts')}`}
          links={[
            {
              name: `${translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            {
              name: 'Blog',
              href: PATH_DASHBOARD.blog.root
            },
            {
              name: `${translate('blog.my_posts')}`
            }
          ]}
          action={
            <Box className="blog-personal-breadcrumbs__action  breadcrumbs__action">
              {!props.isMyPostsPage && (
                <Button
                  component={NextLink}
                  href={PATH_DASHBOARD.blog.posts}
                  variant="outlined"
                  color="inherit"
                  className="breadcrumbs-button button__posts"
                  onClick={() => {
                    props.setIsMyPostsPage(true);
                  }}>
                  {`${translate('blog.my_posts')}`}
                </Button>
              )}
              <BlogNewPostButton />
            </Box>
          }
        />
        <Stack className="blog-personal__search blog-posts__search">
          <Stack className="blog-personal__search-form">
            <BoxTableSearch
              sortBy={props.localState.sortBy}
              table={props.table}
              getAllSearch={func.getPostsSearchByUser}
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
        ) : (
          <Box className="blog-personal__content">
            <BlogPostListView
              table={props.table}
              tableData={props.posts}
              isNotFound={props.isNotFound}
              openShareForm={func.handleOpenShareForm}
              deletePostConfirm={func.handleDeletePostConfirm}
              handleEditPost={func.handleEditPost}
              handlePreview={func.handlePreview}
              openViewCover={func.handleOpenViewCover}
            />
          </Box>
        )}
        <ConfirmDialog {...props.localState.dataDialog} />
        <CopyLinkDialog {...props.localState.dataDialogShare} />
        <BoxInfoCover {...props.localState.dataDialogView} />
      </Container>
    </div>
  );
}
