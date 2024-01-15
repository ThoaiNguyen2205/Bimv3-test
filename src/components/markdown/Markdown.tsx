import ReactMarkdown from 'react-markdown';
// markdown plugins
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
// next
import NextLink from 'next/link';
// @mui
import { Link, Typography, Divider } from '@mui/material';
import { Box } from '@mui/system';
import { MarkdownProps } from '../../components/markdown';
import Image from '../../components/image/Image';
import StyledMarkdown from './styles';
//component

// ------------------------------------------------------
export default function MarkDown({ sx, ...other }: MarkdownProps) {
  return (
    <StyledMarkdown sx={sx}>
      <ReactMarkdown
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          [remarkGfm, { singleTilde: false }]
        ]}
        components={components}
        {...other}
      />
    </StyledMarkdown>
  );
}
// ----------------------------------------------------------------------

const components = {
  h1: ({ ...props }) => <Typography variant="h1" gutterBottom {...props} />,
  h2: ({ ...props }) => <Typography variant="h2" gutterBottom {...props} />,
  h3: ({ ...props }) => <Typography variant="h3" gutterBottom {...props} />,
  h4: ({ ...props }) => <Typography variant="h4" gutterBottom {...props} />,
  h5: ({ ...props }) => <Typography variant="h5" gutterBottom {...props} />,
  h6: ({ ...props }) => <Typography variant="h6" gutterBottom {...props} />,
  p: ({ ...props }) => <Typography paragraph {...props} />,
  hr: ({ ...props }) => <Divider sx={{ my: 3 }} {...props} />,
  img: ({ ...props }) => (
    <Box className="post-body__markdown">
      <Image
        className="post-body__markdown-img"
        alt={props.alt}
        ratio="16/9"
        {...props}
      />
    </Box>
  ),
  a: ({ ...props }) => {
    const isHttp = props.href.includes('http');

    return isHttp ? (
      <Box>
        <Link
          target="_blank"
          rel="noopener"
          {...props}
          className="markdown__link"
        />
      </Box>
    ) : (
      <Box>
        <Link component={NextLink} href={props.href} {...props}>
          {props.children}
        </Link>
      </Box>
    );
  }
};
