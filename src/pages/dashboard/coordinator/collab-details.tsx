
import { alpha, Theme } from '@mui/material/styles';
// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';
// Theme
import { useTheme } from '@mui/material/styles';
// Container
import ForgeContainer from 'src/containers/forge/forge.container';
import { Box, Card } from '@mui/material';
import { useEffect } from 'react';

// zustand store
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';

PdfCollaborationPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PdfCollaborationPage() {
  const { translate } = useLocales();

  const {
    setPreviewUrn,
  } = useForgeViewState(
    (state) => ({
      setPreviewUrn: state.setPreviewUrn,
    }),
    shallow
  );
  
  useEffect(() => {
    setPreviewUrn('');
  }, []);

  return (
    <>
      <Head>
        <title> {`${translate('coordinator.collaboration')}`} </title>
      </Head>
      <Card sx={{
          height: '96vh',
          display: 'flex',
          borderRadius: 1,
        }}
      >
        <ForgeContainer />
      </Card>
    </>
  );
}
