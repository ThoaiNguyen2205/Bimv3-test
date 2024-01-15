import React from 'react';
//mui
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Stack
} from '@mui/material';
//next
import Head from 'next/head';
//locales
import { useLocales } from '../../../locales';
//context
import { useSettingsContext } from '../../../components/settings';
//hook
import useResponsive from '../../../hooks/useResponsive';
//router
import { PATH_DASHBOARD } from '../../../routes/paths';
//type
import { IUser } from '../../../shared/types/user';
import {
  IDetailAttribute,
  IDetailFunction
} from '../../../containers/dashboard/blog/detail.container';
//component
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import ConfirmDialog from '../../../components/confirm-dialog/ConfirmDialog';
//section
import {
  BlogCarouselCenterMode,
  BlogPostCard,
  BlogPostCover,
  CopyLinkDialog
} from '../../../sections/@dashboard/blog';
import { Page404 } from '../../../sections/@dashboard/share/error';
import { CommentsBox } from '../../../components/comment';
import MarkDown from '../../../components/markdown/Markdown';
import Iconify from 'src/components/iconify';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';

//----------------------------------------

type IDetailComponent = {
  props: IDetailAttribute;
  func: IDetailFunction;
};
//-------------------------------
export default function BlogDetailComponent({ props, func }: IDetailComponent) {
  const { themeStretch } = useSettingsContext();
  const { translate } = useLocales();
  const isDesktopSm = useResponsive('down', 'sm');
  const isDesktopMd = useResponsive('down', 'md');
  if (props.setPublish) {
    return (
      <Page404
        linkTo={PATH_DASHBOARD.blog.root}
        title={`${translate('blog.page_not_found')}`}
        description={`${translate('blog.content_error')}`}
        button={`${translate('blog.go_to_blog')}`}
      />
    );
  }
  return (
    <>
      <Head>
        <title>{`Blog: ${
          props.localState.post?.title || ''
        }`}</title>
      </Head>
      <Box className="blog-detail">
        {props.localState.loadingPost ? 
          <Box className="blog-detail__loading">
            <LoadingWindow />
          </Box>
          :
          <Container
            maxWidth={themeStretch ? false : 'lg'}
            className="blog-detail__container"
          >
            {props.localState.isDashboard ?
              <CustomBreadcrumbs
                className="blog-detail__breadcrumbs"
                heading={`${translate('blog.post_detail')}`}
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
                    name: props.localState.post?.title
                  }
                ]}
              />
              : null
            }
            <Grid container spacing={3} className="blog-detail__content">
              <Grid item xs={12} className="blog-detail__post">
                {props.localState.post && (
                  <Stack className="blog-detail__post-content">
                    <Box className="blog-detail__post-cover">
                      <BlogPostCover
                        post={props.localState.post}
                        openDialogShare={func.handleOpenShare}
                      />
                    </Box>

                    <MarkDown
                      className="blog-detail__post-body"
                      children={decodeURIComponent(
                        props.localState.post.content as string
                      )}
                    />

                    {(props.localState.isDashboard === false) ?
                      <Stack direction="row" justifyContent="flex-end" sx={{ p: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={func.handleLoginToCommentRedirect}
                          startIcon={<Iconify icon="solar:login-3-line-duotone" />}
                        >
                          {`${translate('blog.login_to_comment')}`}
                        </Button>
                      </Stack>
                      : null
                    }
                  </Stack>
                )}
              </Grid>
              {/* <Grid item xs={4} className="blog-deltail__popular">
                <Card className="blog-detail__popular-box" color="background.paper">
                  <Typography className="blog-detail__popular-title" variant="h4">
                    {`${translate('blog.most_viewed')}`}
                  </Typography>
                  <Box className="blog-detail__popular-list">
                    {localState.popularPosts.map((post, index) => {
                      return (
                        <Box className="blog-detail__popular-item">
                          <BlogCardPopular post={post} />
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              </Grid> */}
              {props.localState.isDashboard ?
                <>
                  {props.localState.post?.isComment !== null && (
                    <CommentsBox
                      createdBy={(props.localState.post?.createdBy as IUser)?.id}
                      // post={props.localState.post}
                      deleteComment={func.handleOpenDeleteConfirm}
                      commentsTotal={props.localState.comments.length}
                      createComment={func.handleCreateComment}
                      fatherId={props.title as string}
                      getAllComments={() =>
                        func.getAllComments(props.title as string)
                      }
                      comments={props.localState.comments}
                      table={props.table}
                      editComment={func.handleEditComment}
                      user={props.user}
                    />
                  )}
                </>
                : null
              }

              <Grid item xs={12} className="blog-detail__related">
                <Card className="blog-detail__related-box">
                  <CardHeader
                    title={`${translate('blog.related_post')}`}
                    className="blog-detail__related-header"
                  />

                  <CardContent className="blog-detail__related-content">
                    {!props.localState.relatedPosts.length ? (
                      <Box className="blog-detail__related-list carousel__center">
                        <BlogCarouselCenterMode
                          isDashboard={props.localState.isDashboard}
                          data={props.localState.latestPosts.slice(0, 5)}
                        />
                      </Box>
                    ) : (
                      <>
                        {props.localState.relatedPosts.length > 3 ? (
                          <Box className="blog-detail__related-list carousel__center">
                            <BlogCarouselCenterMode
                              isDashboard={props.localState.isDashboard}
                              data={props.localState.relatedPosts}
                            />
                          </Box>
                        ) : (
                          <>
                            {props.localState.relatedPosts.length > 2 &&
                            isDesktopMd ? (
                              <Box className="blog-detail__related-list carousel__center">
                                <BlogCarouselCenterMode
                                  isDashboard={props.localState.isDashboard}
                                  data={props.localState.relatedPosts}
                                />
                              </Box>
                            ) : (
                              <>
                                {props.localState.relatedPosts.length > 1 &&
                                isDesktopSm ? (
                                  <Box className="blog-detail__related-list carousel__center">
                                    <BlogCarouselCenterMode
                                      isDashboard={props.localState.isDashboard}
                                      data={props.localState.relatedPosts}
                                    />
                                  </Box>
                                ) : (
                                  <Grid
                                    container
                                    spacing={2}
                                    className="blog-detail__related-list related__list">
                                    {props.localState.relatedPosts.map(
                                      (post, index) => (
                                        <Grid
                                          item
                                          xs={12}
                                          sm={6}
                                          lg={4}
                                          key={index}>
                                          <BlogPostCard isDashboard={true} post={post} />
                                        </Grid>
                                      )
                                    )}
                                  </Grid>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        }
        <CopyLinkDialog {...props.localState.dataDialogShare} />
        <ConfirmDialog {...props.localState.dataDialog} />
      </Box>
    </>
  );
}
