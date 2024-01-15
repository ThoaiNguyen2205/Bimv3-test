// next
import NextLink from 'next/link';
// @mui
import {
  Box,
  Card,
  Avatar,
  Typography,
  CardContent,
  Stack,
  Link
} from '@mui/material';
// routes
import { PATH_BLOG, PATH_DASHBOARD } from '../../../../routes/paths';
//locales
import { useLocales } from '../../../../locales';
// hooks
import useResponsive from '../../../../hooks/useResponsive';
// utils
import { fDate, fDateVi } from '../../../../utils/formatTime';
import { fShortenNumber } from '../../../../utils/formatNumber';
// @types
import { IDocCategory } from '../../../../shared/types/docCategory';
import { IUser } from '../../../../shared/types/user';
import { IBlog } from '../../../../shared/types/blog';
// components
import Iconify from '../../../../components/iconify';
import TextMaxLine from '../../../../components/text-max-line';
import SvgColor from '../../../../components/svg-color';
import Label from '../../../../components/label/Label';

// ----------------------------------------------------------------------
type Props = {
  isDashboard: boolean;
  post: IBlog;
  index?: number;
  page?: number;
};

export default function BlogPostCard({ isDashboard, post, index, page }: Props) {
  const isDesktop = useResponsive('up', 'xl');
  const linkTo = PATH_DASHBOARD.blog.view(post._id);
  const homeLinkTo = PATH_BLOG.view(post._id);
  const {
    cover,
    title,
    views,
    comments,
    createdBy,
    category,
    createdAt,
    _id,
    description
  } = post;
  const latestPost = isDesktop
    ? index === 0 || index === 1 || index === 2 || index === 3 || index === 4
    : index === 0 || index === 1 || index === 2;
  if (latestPost && page === 0) {
    return (
      <Link
        component={NextLink}
        href={isDashboard ? linkTo : homeLinkTo}
        color="inherit"
        className="blog__item-link">
        <Card className="blog-card__overlay">
          <Box className="blog-card__author">
            <Avatar
              className="blog-card__author-avatar"
              alt={(createdBy as IUser).avatar}
              src={`${process.env.REACT_APP_APIFILE}images/${
                (createdBy as IUser).avatar
              }`}
            />
          </Box>

          <PostContent
            title={title}
            view={views}
            comment={comments}
            category={(category as IDocCategory).name}
            description={description}
            index={index}
            createdAt={createdAt}
            id={_id}
          />

          <Box className="blog-card__bg-overlay" />

          <img
            className="blog-card__bg-image"
            alt="cover"
            src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
          />
        </Card>
      </Link>
    );
  }

  return (
    <Box className="blog__item">
      <Link
        component={NextLink}
        href={isDashboard ? linkTo : homeLinkTo}
        color="inherit"
        className="blog__item-link">
        <Card className="blog-card">
          <Box className="blog-card__author">
            <SvgColor
              className="blog-card__author-svg"
              src="/assets/shape_avatar.svg"
              sx={{ color: 'background.paper' }}
            />

            <Avatar
              className="blog-card__author-avatar"
              alt={(createdBy as IUser).avatar}
              src={`${process.env.REACT_APP_APIFILE}images/${
                (createdBy as IUser).avatar
              }`}
            />
            <Box className="blog-card__author-cover">
              <img
                className="cover__image"
                alt="cover"
                src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
              />
            </Box>
          </Box>

          <PostContent
            title={title}
            view={views}
            comment={comments}
            id={_id}
            category={(category as IDocCategory).name}
            description={description}
            createdAt={createdAt}
          />
        </Card>
      </Link>
    </Box>
  );
}

// ----------------------------------------------------------------------

type PostContentProps = {
  title: string;
  view: number;
  comment: number;
  category: string;
  description: string;
  createdAt: Date | string | number;
  index?: number;
  id: string;
};

export function PostContent({
  title,
  createdAt,
  index,
  view,
  comment,
  id,
  category,
  description
}: PostContentProps) {
  const isDesktopMd = useResponsive('up', 'md');
  const isDesktopSm = useResponsive('down', 'sm');
  const isDesktopXl = useResponsive('up', 'xl');
  const { currentLang } = useLocales();
  const postOverlayLarge = index === 0;

  const postsOverlaySmall = index === 1 || index === 2;
  const postOverlay = isDesktopXl
    ? index === 0 || index === 1 || index === 2 || index === 3 || index === 4
    : index === 0 || index === 1 || index === 2;
  const POST_INFO = [
    { id: 'comment', value: comment, icon: 'eva:message-circle-fill' },
    { id: 'view', value: view, icon: 'eva:eye-fill' }
  ];
  return (
    <CardContent className="blog-card__content">
      <TextMaxLine
        persistent={postOverlay || isDesktopSm ? false : true}
        line={2}
        className="blog-card__content-title"
        variant={isDesktopMd && postOverlayLarge ? 'h4' : 'h6'}>
        {title}
      </TextMaxLine>
      <Label
        className="blog-card__content-category"
        variant={`${postOverlay ? 'filled' : 'soft'}`}
        color="success">
        {category}
      </Label>
      <TextMaxLine
        persistent={postOverlay || isDesktopSm ? false : true}
        line={postsOverlaySmall ? 1 : 2}
        className="blog-card__content-description"
        variant={isDesktopMd && postOverlayLarge ? 'body1' : 'body2'}>
        {description}
      </TextMaxLine>
      <Box className="blog-card__content-footer">
        <Typography className="blog-card__content-createdAt" variant="caption">
          {(currentLang.value === 'en' && fDate(createdAt)) ||
            (currentLang.value === 'vi' && fDateVi(createdAt)) ||
            fDate(createdAt)}
        </Typography>
        <Stack className="blog-card__info-list">
          {POST_INFO.map((info) => (
            <Stack
              className="blog-card__info-item"
              key={info.id}
              direction="row"
              sx={{ typography: 'caption' }}>
              <Iconify icon={info.icon} className="blog-card__item-icon" />
              {fShortenNumber(info.value)}
            </Stack>
          ))}
        </Stack>
      </Box>
    </CardContent>
  );
}
