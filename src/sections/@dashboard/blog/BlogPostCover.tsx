// @mui
import { Box, Avatar, SpeedDial, Typography } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// utils
import { fDate, fDateVi } from '../../../utils/formatTime';
//locales
import { useLocales } from '../../../locales';
//type
import { IDocCategory } from '../../../shared/types/docCategory';
import { IBlog } from '../../../shared/types/blog';
import { IBimDocument } from '../../../shared/types/bimDocument';
import { IUser } from '../../../shared/types/user';
// components
import Iconify from '../../../components/iconify';
import Label from '../../../components/label/Label';

// ----------------------------------------------------------------------

type Props = {
  post: IBimDocument;
  openDialogShare: (blog: IBlog | null) => void;
};
export default function BlogPostCover({ post, openDialogShare }: Props) {
  const { cover, title, createdBy, createdAt, category } = post;
  const { currentLang } = useLocales();
  const isDesktop = useResponsive('up', 'sm');
  return (
    <Box className="post-cover__box">
      <Box className="post-cover__box-header">
        <Typography variant="h4" className="header__cover-title">
          {title}
        </Typography>
        <Label
          variant="filled"
          color="success"
          className="header__cover-category">
          {(category as IDocCategory).name}
        </Label>
      </Box>

      <Box className="post-cover__box-footer">
        <Box className="footer-author">
          <Avatar
            className="footer-author__avatar"
            alt={(createdBy as IUser).username}
            src={`${process.env.REACT_APP_APIFILE}images/${
              (createdBy as IUser).avatar
            }`}
          />

          <Box className="footer-author__text">
            <Typography
              variant="subtitle2"
              className="footer-author__text-name">
              {(createdBy as IUser).fullname}
            </Typography>

            <Typography
              variant="caption"
              className="footer-author__text-createAt">
              {(currentLang.value === 'en' && fDate(createdAt)) ||
                (currentLang.value === 'vi' && fDateVi(createdAt)) ||
                fDate(createdAt)}
            </Typography>
          </Box>
        </Box>

        <SpeedDial
          className="footer-share"
          onClick={() => openDialogShare(post)}
          direction={isDesktop ? 'left' : 'up'}
          ariaLabel="Share post"
          icon={<Iconify icon="eva:share-fill" />}
          sx={{ '& .MuiSpeedDial-fab': { width: 35, height: 35 } }}></SpeedDial>
      </Box>

      <Box className="post-cover__box-overlay" />

      <img
        className="post-cover__box-image "
        alt="cover"
        src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
      />
    </Box>
  );
}
