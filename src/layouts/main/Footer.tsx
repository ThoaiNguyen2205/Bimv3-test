// next
import NextLink from 'next/link';
import { useRouter } from 'next/router';
// @mui
import { Box, Grid, Link, Stack, Divider, Container, Typography, IconButton } from '@mui/material';
// routes
import { PATH_PAGE } from '../../routes/paths';
// _mock
import { _socials } from '../../_mock/arrays';
// components
import Logo from '../../components/logo';
import Iconify from '../../components/iconify';
import FullLogo from 'src/components/logo/FullLogo';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

const LINKS = [
  {
    key: 'bimnext',
    headline: 'landingpage.bimnext',
    children: [
      { key: 'about_us', name: 'landingpage.about_us', href: PATH_PAGE.about },
      { key: 'contact_us', name: 'landingpage.contact_us', href: PATH_PAGE.contact },
      { key: 'faqs', name: 'landingpage.faqs', href: PATH_PAGE.faqs },
    ],
  },
  {
    key: 'legal',
    headline: 'landingpage.legal',
    children: [
      { key: 'term_condition', name: 'landingpage.terms_and_condition', href: '#' },
      { key: 'policy', name: 'landingpage.policy', href: '#' },
    ],
  },
  {
    key: 'contact',
    headline: 'landingpage.contact',
    children: [
      { key: 'email', name: 'landingpage.email', href: '#' },
      { key: 'address', name: 'landingpage.address', href: '#' },
    ],
  },
];

// ----------------------------------------------------------------------

export default function Footer() {
  const { pathname } = useRouter();
  const { translate } = useLocales();

  const isHome = pathname === '/';

  const simpleFooter = (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Container>
        <FullLogo sx={{ mb: 1, mx: 'auto' }} />

        <Typography variant="caption" component="div">
          © Đã đăng ký Bản quyền
          <br /> Sản phẩm của&nbsp;
          <Link href="https://dpunity.com/"> dpunity.com </Link>
        </Typography>
      </Container>
    </Box>
  );

  const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Divider />

      <Container sx={{ pt: 10 }}>
        <Grid
          container
          justifyContent={{
            xs: 'center',
            md: 'space-between',
          }}
          sx={{
            textAlign: {
              xs: 'center',
              md: 'left',
            },
          }}
        >
          <Grid item xs={12} sx={{ mb: 3 }}>
            <FullLogo sx={{ mx: { xs: 'auto', md: 'inherit' } }} />
          </Grid>

          <Grid item xs={8} md={3}>
            <Typography variant="body2" sx={{ pr: { md: 5 } }}>
              {`${translate('landingpage.starting_point')}`}
            </Typography>

            <Stack
              spacing={1}
              direction="row"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{
                mt: 5,
                mb: { xs: 5, md: 0 },
              }}
            >
              {_socials.map((social) => (
                <IconButton key={social.name}>
                  <Iconify icon={social.icon} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack
              spacing={5}
              justifyContent="space-between"
              direction={{ xs: 'column', md: 'row' }}
            >
              {LINKS.map((list) => (
                <Stack
                  key={list.headline}
                  spacing={2}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography component="div" variant="overline">
                    {`${translate(list.headline)}`}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.key}
                      component={NextLink}
                      href={link.href}
                      color="inherit"
                      variant="body2"
                    >
                      {`${translate(link.name)}`}
                    </Link>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          component="div"
          sx={{
            mt: 10,
            pb: 5,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          © 2021. All rights reserved
        </Typography>
      </Container>
    </Box>
  );

  return isHome ? simpleFooter : mainFooter;
}
