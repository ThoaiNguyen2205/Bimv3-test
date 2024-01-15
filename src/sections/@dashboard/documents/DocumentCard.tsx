import { useState, useEffect } from 'react';
// @mui
import {
  Avatar,
  Box,
  Card,
  Stack,
  CardProps,
  Typography,
  Link
} from '@mui/material';
//next
import NextLink from 'next/link';
//hooks
import useResponsive from '../../../hooks/useResponsive';
//routers
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import Label from '../../../components/label';
import SvgColor from '../../../components/svg-color';
import TextMaxLine from '../../../components/text-max-line/TextMaxLine';

// type
import { IDocCategory } from '../../../shared/types/docCategory';
import { IUserInDocument } from '../../../shared/types/usersInDocument';
import { IUser } from '../../../shared/types/user';
import { IBimDocument } from '../../../shared/types/bimDocument';
// locales
import { useLocales } from '../../../locales';
// utils
import { fDate, fDateVi } from '../../../utils/formatTime';
// api
import usersInDocumentsApi from '../../../api/usersInDocumentsApi';

// ----------------------------------------------------------------

type ILocalState = {
  openPopover: HTMLElement | null;
  showHover: boolean;
  usersInDoc: IUserInDocument[];
};

interface Props extends CardProps {
  document: IBimDocument;
}

export default function DocumentCard({
  document,

  sx,
  ...other
}: Props) {
  const { currentLang } = useLocales();
  const isDessktop = useResponsive('down', 'xl');
  const linkTo = PATH_DASHBOARD.document.details(document._id);
  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    showHover: false,
    usersInDoc: []
  });

  useEffect(() => {
    const loadUsersInDocument = async () => {
      const param = {
        document: document._id
      };
      const res = await usersInDocumentsApi.getUsersInDocument(param);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        usersInDoc: res.data
      }));
    };
    loadUsersInDocument();
  }, []);

  return (
    <Box className="document__item">
      <Link className="document__item-link" component={NextLink} href={linkTo}>
        <Card className="document-card">
          <Box className="document-card__cover">
            <SvgColor
              className="document-card__cover-svgColor"
              src="/assets/shape_avatar.svg"
              sx={{
                color: 'background.paper'
              }}
            />
            <Avatar
              className="document-card__cover-avatar"
              alt={(document.createdBy as IUser).username}
              src={`${process.env.REACT_APP_APIFILE}images/${
                (document.createdBy as IUser).avatar
              }`}
            />
            <Box className="document-card__cover-image">
              <img
                className="cover-image"
                alt={document.title}
                src={`${process.env.REACT_APP_APIFILE}images/${document.cover}`}
                // ratio="4/3"
              />
            </Box>
          </Box>
          <Box className="document-card__content">
            <Stack className="document-card__content-category">
              <Label variant="soft" color="success">
                {(document.category as IDocCategory).name}
              </Label>
            </Stack>
            <Stack className="document-card__content-title">
              <TextMaxLine
                line={2}
                persistent
                className="caption__title"
                variant={isDessktop ? 'h6' : 'h5'}>
                {document.title}
              </TextMaxLine>
            </Stack>

            <Stack className="document-card__content-description">
              <TextMaxLine
                persistent
                line={2}
                className="caption__description"
                variant={isDessktop ? 'caption' : 'body2'}>
                {document.description}
              </TextMaxLine>
            </Stack>
            <Box className="document-card__content-footer">
              <Stack className="card-footer__createdAt">
                <Typography noWrap variant="caption">
                  {(currentLang.value === 'en' && fDate(document.createdAt)) ||
                    (currentLang.value === 'vi' &&
                      fDateVi(document.createdAt)) ||
                    fDate(document.createdAt)}
                </Typography>
              </Stack>
              <Stack className="card-footer__list">
                <Box className="card-footer__list-item item__views">
                  <Iconify className="item__icon" icon={'solar:eye-bold'} />
                  <Typography noWrap variant="caption">
                    {document.views}
                  </Typography>
                </Box>
                <Box className="card-footer__list-item item__comments">
                  <Iconify
                    className="item__icon"
                    icon={'eva:message-circle-fill'}
                  />
                  <Typography noWrap variant="caption">
                    {document.comments}
                  </Typography>
                </Box>
                <Box className="card-footer__list-item item__shares">
                  <Iconify className="item__icon" icon={'eva:share-outline'} />
                  <Typography noWrap variant="caption">
                    {localState.usersInDoc.length}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Card>
      </Link>
    </Box>
  );
}
