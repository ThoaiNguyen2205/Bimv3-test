import { ApexOptions } from 'apexcharts';
import { useState } from 'react';
// @mui
import { Card, Container, CardHeader, Box, Button, CardProps } from '@mui/material';
// components
import { CustomSmallSelect } from '../../../../components/custom-input';
import Chart, { useChart } from '../../../../components/chart';
import { IBlog } from 'src/shared/types/blog';
import { BlogPostCard } from '../../blog';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import { useRouter } from 'next/router';
import { PATH_DASHBOARD } from 'src/routes/paths';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  blogs: IBlog[];
}

export default function AppBlogs({ blogs, ...other }: Props) {
  const { translate } = useLocales();
  const router = useRouter();

  const onReadMore = () => {
    router.push(PATH_DASHBOARD.blog.posts);
  }
  return (
    <Card {...other}>
      <CardHeader
        title={`${translate('common.tech_blog')}`}
        // subheader={subheader}
        action={
          <Button
            startIcon={<Iconify icon="mdi:read-more" />}
            sx={{ pl: 3, pr: 3 }}
            onClick={onReadMore}
          >
            {`${translate('common.read_more')}`}
          </Button>
        }
      />
      <Box className="blog-posts">
        <Container className="blog-posts__container"
        >
          <Box className="blog-posts__content">
            <Box className="blog-posts__grid">
              <Box className="blog-posts__grid-container">
                <Box className='blog-posts__list blog-posts__list-latest'>
                  {blogs && blogs.map((post, index) => (
                    <Box key={index} className='blog-posts__list-item list__item-latest'>
                      <BlogPostCard isDashboard={true} post={post} index={index} page={0} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Card>
  );
}
