import { m } from 'framer-motion';
// next
import NextLink from 'next/link';
// @mui
import { useTheme } from '@mui/material/styles';
import { Button, Box, Container, Stack } from '@mui/material';
// utils
import { bgGradient } from '../../utils/cssStyles';
// routes
import { PATH_AUTH, PATH_DASHBOARD, PATH_FREE_VERSION, PATH_MINIMAL_ON_STORE } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import Image from '../../components/image';
import { MotionViewport, varFade } from '../../components/animate';
// Locales
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

export default function HomeAdvertisement() {
  const theme = useTheme();

  return (
    <Container component={MotionViewport}>
      <Stack
        alignItems="center"
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: theme.palette.primary.main,
            endColor: theme.palette.primary.dark,
          }),
          borderRadius: 2,
          pb: { xs: 5, md: 0 },
        }}
      >
        <Content />
        <Description />
      </Stack>
    </Container>
  );
}

// ----------------------------------------------------------------------

function Description() {
  // const { translate } = useLocales();
  return (
    <Box
      sx={{
        textAlign: {
          xs: 'center',
          md: 'left',
        },
      }}
    >
      <Box
        component={m.div}
        variants={varFade().inDown}
        sx={{ color: 'common.white', mb: 5, typography: 'h2' }}
      >
        Khám phá 
        <br /> Bimnext ngay
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        spacing={2}
      >
        <m.div variants={varFade().inRight}>
          <Button
            component={NextLink}
            href={PATH_AUTH.register}
            color="inherit"
            size="large"
            variant="contained"
            startIcon={<Iconify icon="ion:rocket-outline" width={24} />}
            sx={{
              color: 'grey.800',
              bgcolor: 'common.white',
            }}
          >
            Đăng ký tài khoản
          </Button>
        </m.div>

        <m.div variants={varFade().inRight}>
          <Button
            color="inherit"
            size="large"
            variant="outlined"
            target="_blank"
            rel="noopener"
            component={NextLink}
            href={PATH_DASHBOARD.root}
            startIcon={<Iconify icon="material-symbols-light:space-dashboard" width={24} />}
            endIcon={<Iconify icon="eva:external-link-fill" width={16} sx={{ mr: 0.5 }} />}
            sx={{ color: 'common.white', '&:hover': { borderColor: 'currentColor' } }}
          >
            Bảng điều khiển
          </Button>
        </m.div>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function Content() {
  return (
    <Stack component={m.div} variants={varFade().inUp} alignItems="center">
      <m.div
        animate={{
          y: [-20, 0, -20],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Image
          visibleByDefault
          disabledEffect
          alt="rocket"
          src="/assets/images/home/rocket.png"
          sx={{ maxWidth: 460 }}
        />
      </m.div>
    </Stack>
  );
}
