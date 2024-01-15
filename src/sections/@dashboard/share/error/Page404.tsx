import { m } from 'framer-motion';
// next
import Head from 'next/head';
import NextLink from 'next/link';
// @mui
import { Box, Button, Typography } from '@mui/material';
// components

import { PageNotFoundIllustration } from '../../../../assets/illustrations';
import { MotionContainer, varBounce } from '../../../../components/animate';
import CompactLayout from '../../../../layouts/compact/CompactLayout';
// assets
// ----------------------------------------------------------------------
Page404.getLayout = (page: React.ReactElement) => (
  <CompactLayout>{page}</CompactLayout>
);
// ----------------------------------------------------------------------
type Props = {
  linkTo: string;
  title: string;
  description: string;
  button: string;
};
export default function Page404({ linkTo, description, title, button }: Props) {
  return (
    <>
      <Head>
        <title> 404 Page Not Found | BIMNEXT V3</title>
      </Head>
      <Box className="page-404">
        <MotionContainer className="page-404__container">
          <m.div variants={varBounce().in}>
            <Typography variant="h4" paragraph className="page-404__title">
              {title}
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography className="page-404__description">
              {description}
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <PageNotFoundIllustration className="page-404__image" />
          </m.div>

          <Button
            component={NextLink}
            href={linkTo}
            size="medium"
            variant="contained"
            className="page-404__button">
            {button}
          </Button>
        </MotionContainer>
      </Box>
    </>
  );
}
