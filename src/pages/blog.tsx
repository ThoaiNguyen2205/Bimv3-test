// next
import Head from 'next/head';
// @mui
import { Box, Container } from '@mui/material';
// layouts
import MainLayout from '../layouts/main';
// sections
import { useCallback, useEffect, useState } from 'react';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import { BlogPostGridView } from 'src/sections/@dashboard/blog';
import { useTable } from 'src/components/table';
import { IBlog } from 'src/shared/types/blog';
import blogsApi from 'src/api/blogsApi';
// ----------------------------------------------------------------------

HomeBlogPage.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

// ----------------------------------------------------------------------
export type ILocalState = {
  loading: boolean;
  posts: IBlog[];
};

export default function HomeBlogPage() {
  const table = useTable({ defaultRowsPerPage: 9 });

  const [localState, setLocalState] = useState<ILocalState>({
    loading: false,
    posts: [],
  });

  const getPosts = useCallback(async () => {
    const response = await blogsApi.getAllBlogs(null);
    const newPosts = response.data.filter((post) => post.isPublish !== null);
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      loading: false,
      posts: newPosts,
    }));
  }, []);

  useEffect(() => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      loading: true,
    }));
    getPosts();
  }, [getPosts]);

  return (
    <>
      <Head>
        <title> Blog </title>
      </Head>

      <Box className="blog-posts">
        <Container
          className="blog-posts__container"
        >
          <Box className="blog-posts__content">
            {localState.loading ? (
              <Box className="blog-posts__loading">
                <LoadingWindow />
              </Box>
            ) : (
              <Box className="blog-posts__grid">
                <BlogPostGridView isDashboard={false} table={table} tableData={localState.posts} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

    </>
  );
}
