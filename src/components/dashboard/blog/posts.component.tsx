import React from 'react';
//mui
import { Box, Button, Container, Stack } from '@mui/material';
//next
import NextLink from 'next/link';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//context
import { useSettingsContext } from '../../../components/settings';
//type
import {
  IBlogAttribute,
  IBlogFunction
} from '../../../containers/dashboard/blog/posts.container';
//component
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import EmptyContent from '../../../components/empty-content/EmptyContent';
//section
import {
  BlogNewPostButton,
  BlogPostGridView
} from '../../../sections/@dashboard/blog';
import { BoxTableSearch } from '../../../sections/@dashboard/share/search-table';

//------------------------------------
type IBlogComponent = {
  props: IBlogAttribute;
  func: IBlogFunction;
};
//--------------------------------------
export default function PostsComponent({ props, func }: IBlogComponent) {
  const { themeStretch } = useSettingsContext();
  return (
    <Box className="blog-posts">
      <Container
        maxWidth={themeStretch ? false : 'lg'}
        className="blog-posts__container">
        <CustomBreadcrumbs
          className="blog-posts__container-breadcrumbs breadcrumsbs"
          heading="Blog"
          links={[
            {
              name: `${props.translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root
            },
            {
              name: 'Blog',
              href: PATH_DASHBOARD.blog.root
            }
          ]}
          action={
            <Box className="blog-posts__container-action breadcrumbs__action">
              <Button
                component={NextLink}
                href={PATH_DASHBOARD.blog.personal}
                variant="outlined"
                color="inherit"
                className="breadcrumbs-button button__posts "
                onClick={() => {
                  props.setIsMyPostsPage(true);
                }}>
                {`${props.translate('blog.my_posts')}`}
              </Button>
              <BlogNewPostButton />
            </Box>
          }
        />
        <Box className="blog-posts__content">
          <Stack className="blog-posts__content-search">
            <BoxTableSearch
              sortBy={props.localState.sortBy}
              table={props.table}
              getAllSearch={func.getPostsSearch}
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
          {props.localState.loading ? (
            <LoadingWindow />
          ) : !props.isNotFound ? (
            <Box className="blog-posts__grid">
              <BlogPostGridView isDashboard={true} table={props.table} tableData={props.posts} />
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
      </Container>
    </Box>
  );
}
