import { useRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Paper,
  Link,
  CardContent,
  Typography,
  Avatar
} from '@mui/material';
//next
import NextLink from 'next/link';
//type
import { IBimDocument } from '../../../../shared/types/bimDocument';

import { IUser } from '../../../../shared/types/user';
//router
import { PATH_BLOG, PATH_DASHBOARD } from '../../../../routes/paths';
//utils
import { fDate, fDateVi } from '../../../../utils/formatTime';
//config
import { DIMENSION } from '../../../../config-global';
//locales
import { useLocales } from '../../../../locales';
//component
import TextMaxLine from '../../../../components/text-max-line';
import Carousel, { CarouselArrows } from '../../../../components/carousel';

// ----------------------------------------------------------------------

type Props = {
  isDashboard: boolean;
  data: IBimDocument[];
};

export default function BlogCarouselCenterMode({ isDashboard, data }: Props) {
  const carouselRef = useRef<Carousel | null>(null);

  const theme = useTheme();

  const carouselSettings = {
    slidesToShow: 4,
    centerMode: true,
    centerPadding: '60px',
    rtl: Boolean(theme.direction === 'rtl'),
    responsive: [
      {
        breakpoint: DIMENSION.D_DESKTOP_MD,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: DIMENSION.D_TABLET,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: DIMENSION.D_MOBILE,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  const handlePrev = () => {
    carouselRef.current?.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current?.slickNext();
  };

  return (
    <Box className="carousel__container">
      <CarouselArrows filled onNext={handleNext} onPrevious={handlePrev}>
        <Carousel
          ref={carouselRef}
          {...carouselSettings}
          className="carousel__container-content">
          {data.map((item, index) => (
            <Box key={index} className="carousel__list">
              <CarouselItem isDashboard={isDashboard} item={item} />
            </Box>
          ))}
        </Carousel>
      </CarouselArrows>
    </Box>
  );
}
// ----------------------------------------------------------------------

// type CarouselItemProps = {
//   title: string;
//   description: string;
//   cover: string;
// };

function CarouselItem({ isDashboard, item }: { isDashboard: boolean, item: IBimDocument }) {
  const theme = useTheme();
  const { currentLang } = useLocales();
  const { cover, title, _id, createdBy, createdAt } = item;

  const linkTo = PATH_DASHBOARD.blog.view(_id);
  const homeLinkTo = PATH_BLOG.view(_id);
  return (
    <Link
      component={NextLink}
      href={isDashboard ? linkTo : homeLinkTo}
      color="inherit"
      className="carousel__list-link">
      <Paper className="carousel__list-item item__card">
        <img
          alt={title}
          src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
          className="item__card-image"
        />
        <CardContent className="item__card-content">
          <TextMaxLine className="item__card-title" variant="h5" paragraph>
            {title}
          </TextMaxLine>

          <Box className="item__card-author">
            <Avatar
              alt={(createdBy as IUser).username}
              src={`${process.env.REACT_APP_APIFILE}images/${
                (createdBy as IUser).avatar
              }`}
              className="card__author-avatar"
            />

            <Box className="card__author-text">
              <Typography variant="subtitle2" className="card__author-name">
                {(createdBy as IUser).fullname}
              </Typography>

              <Typography variant="caption" className="card__author-createAt">
                {(currentLang.value === 'en' && fDate(createdAt)) ||
                  (currentLang.value === 'vi' && fDateVi(createdAt)) ||
                  fDate(createdAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Paper>
    </Link>
  );
}
