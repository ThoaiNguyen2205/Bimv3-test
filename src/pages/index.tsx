// next
import Head from 'next/head';
// @mui
import { Box } from '@mui/material';
// layouts
import MainLayout from '../layouts/main';
// components
import ScrollProgress from '../components/scroll-progress';
// sections
import {
  HomeHero,
  HomeMinimal,
  HomeDarkMode,
  HomeLookingFor,
  HomeForDesigner,
  HomeColorPresets,
  HomePricingPlans,
  HomeAdvertisement,
  HomeCleanInterfaces,
  HomeHugePackElements,
} from '../sections/home';

// ----------------------------------------------------------------------

HomePage.getLayout = (page: React.ReactElement) => <MainLayout> {page} </MainLayout>;

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Head>
        <title> BIMNEXT 3.0 </title>
      </Head>

      <ScrollProgress />

      <HomeHero />

      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        <HomeMinimal />

        {/* <HomeHugePackElements /> */}

        {/* <HomeForDesigner /> */}

        {/* <HomeDarkMode /> */}

        {/* <HomeColorPresets /> */}

        {/* <HomeCleanInterfaces /> */}

        <HomePricingPlans />

        <HomeLookingFor />

        <HomeAdvertisement />
      </Box>
    </>
  );
}
