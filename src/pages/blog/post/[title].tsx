import BlogDetailContainer from 'src/containers/dashboard/blog/detail.container';
// layouts
import MainLayout from '../../../layouts/main';
import { Container } from '@mui/material';
// ----------------------------------------------------------------------

HomeBlogDetailPage.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

// ----------------------------------------------------------------------

export default function HomeBlogDetailPage() {
  return (
    <Container
      className="blog-posts__container"
    >
      <>
        {BlogDetailContainer(false)}
      </>
    </Container>
  )
}
