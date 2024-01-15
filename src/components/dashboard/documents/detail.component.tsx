import { useState, useEffect } from 'react';
//mui
import { Box, Grid, Card, Stack, Typography, Container } from '@mui/material';
import { TreeView } from '@mui/lab';
//next
import Head from 'next/head';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// locales
import { useLocales } from '../../../locales';
//context
import { useSettingsContext } from '../../../components/settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
//types
import { IUser } from '../../../shared/types/user';
//utils
import { fDate, fDateVi } from '../../../utils/formatTime';
//components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import Label from '../../../components/label';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs/CustomBreadcrumbs';
import {
  IDocDetailAttribute,
  IDocDetailFunction
} from '../../../containers/dashboard/documents/detail.container';
import EmptyContent from '../../../components/empty-content/EmptyContent';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
// sections

import { BlockTreeView } from '../../../sections/@dashboard/documents';
import MarkDown from '../../../components/markdown/Markdown';
import { CommentsBox } from '../../../components/comment';
import { Page404 } from '../../../sections/@dashboard/share/error';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

interface IDocDetailProps {
  props: IDocDetailAttribute;
  func: IDocDetailFunction;
}
type ILocalState = {
  isScroll: boolean;
};
export default function DocDetailComponent({ props, func }: IDocDetailProps) {
  const { translate, currentLang } = useLocales();
  const { themeStretch } = useSettingsContext();

  const isDesktop = useResponsive('down', 'md');
  const isAuthor =
    props.localState.document?.isPublish === null &&
    (props.localState.document?.createdBy as IUser)?.id !== props.user?.id;

  const isShare = props.localState.usersInDoc.filter(
    (user) => (user.user as IUser)._id === props.user?.id
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isScroll: false
  });
  // handle scroll
  isDesktop &&
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

  if (isAuthor && isShare.length === 0) {
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
      <Box className="document-detail">
        <Container
          maxWidth={themeStretch ? false : 'lg'}
          className="document-detail__container">
          <CustomBreadcrumbs
            className="document-detail__breadcrumbs breadcrumbs"
            heading={`${translate('blog.post_detail')}`}
            links={[
              {
                name: `${props.translate('nav.dashboard')}`,
                href: PATH_DASHBOARD.root
              },
              {
                name: `${props.translate('documents.document')}`,
                href: PATH_DASHBOARD.document.homepage
              },
              { name: props.localState.document?.title }
            ]}
          />
          <Grid container spacing={3} className="document-detail__grid">
            <Grid
              item
              xs={12}
              md={4}
              className="document-detail__grid-item document-detail__grid-index">
              {isDesktop && localState.isScroll && props.localState.content ? (
                <Box className="item-card-fixed">
                  {props.localState.selectedTitle}
                </Box>
              ) : (
                <Card className="item-card">
                  <BlockTreeView sx={{ padding: '0 !important' }}>
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
              className="document-detail__grid-item document-detail__grid-content">
              <Card className="item-card">
                {!props.localState.content ? (
                  <Stack>
                    <EmptyContent
                      title={`${translate('common.no_data')}`}
                      sx={{
                        '& span.MuiBox-root': { height: 160 }
                      }}
                    />
                  </Stack>
                ) : (
                  <>
                    {props.localState.isLoading === true ? (
                      <LoadingWindow />
                    ) : (
                      <>
                        <Box className="item-card__note">
                          <Box className="item-card__note-version">
                            <Typography>
                              {`${translate('documents.versions')}`}
                            </Typography>
                            <Label
                              className="item-card__version-label"
                              variant="filled"
                              color="success">
                              {props.localState.versionNote}
                            </Label>
                          </Box>

                          <Typography className="item-card__note-createdAt">
                            {`${translate('documents.create_at')} : ${
                              (currentLang.value === 'en' &&
                                fDate(props.localState.createdAt)) ||
                              (currentLang.value === 'vi' &&
                                fDateVi(props.localState.createdAt)) ||
                              fDate(props.localState.createdAt)
                            }`}
                          </Typography>
                        </Box>

                        <MarkDown
                          className="item-card__markdown"
                          children={decodeURIComponent(
                            props.localState.content
                          )}
                        />

                        <Box className="item-card__comment">
                          <CommentsBox
                            createdBy={
                              (props.docIndexes[0]?.createdBy as IUser)?.id
                            }
                            deleteComment={func.handleOpenDeleteConfirm}
                            commentsTotal={props.localState.comments.length}
                            createComment={func.handleCreateComment}
                            fatherId={props.localState.selectedNode}
                            getAllComments={() =>
                              func.getAllComments(props.localState.selectedNode)
                            }
                            comments={props.localState.comments}
                            table={props.table}
                            editComment={func.handleEditComment}
                            user={props.user}
                          />
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
          <ConfirmDialog {...props.localState.dataDialog} />
        </Container>
      </Box>
    </>
  );
}
