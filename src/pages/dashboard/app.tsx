// next
import Head from 'next/head';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Stack, Button } from '@mui/material';
// auth
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// _mock_
import {
  _appFeatured,
  _appAuthors,
  _appInstalled,
  _appRelated,
  _appInvoices,
} from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
// sections
import {
  AppWidget,
  AppWelcome,
  AppFeatured,
  AppNewInvoice,
  AppTopAuthors,
  AppTopRelated,
  AppAreaInstalled,
  AppWidgetSummary,
  AppCurrentDownload,
  AppTopInstalledCountries,
  AppActiveProjects,
  AppUsedStorages,
  AppUsedCredits,
  AppBlogs,
} from '../../sections/@dashboard/general/app';
// assets
import { SeoIllustration } from '../../assets/illustrations';

import { useLocales } from 'src/locales';
import { useEffect, useState } from 'react';
import { IContract } from 'src/shared/types/contract';
import notificationsApi from 'src/api/notificationsApi';
import { IDashboardData } from 'src/shared/types/notification';
import { IBlog } from 'src/shared/types/blog';

// ----------------------------------------------------------------------

GeneralAppPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

type ILocalState = {
  contract: IContract | null,
  projects: { label: string, value: number}[],
  storages: { label: string, value: number}[],
  credits: { label: string, value: number}[],
  blogs: IBlog[],
}


export default function GeneralAppPage() {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [localState, setLocalState] = useState<ILocalState>({
    contract: null,
    projects: [],
    storages: [],
    credits: [],
    blogs: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const cusId = (user?.customer !== null) ? user?.customer._id : 'none';
      const dashboardRes: IDashboardData = await notificationsApi.getDashboardData(cusId);
      
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        contract: dashboardRes.contract,
        projects: dashboardRes.projects,
        storages: dashboardRes.storages,
        credits: dashboardRes.credits,
        blogs: dashboardRes.blogs,
      }));
    }
    loadData();
  }, []);
    
  return (
    <>
      <Head>
        <title>BIMNEXT V3</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'} sx={{ pl: '5px !important', pr: '5px !important' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <AppWelcome
              title={`Welcome back! \n ${user?.username}`}
              description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
              img={
                <SeoIllustration
                  sx={{
                    p: 3,
                    width: 360,
                    margin: { xs: 'auto', md: 'inherit' },
                  }}
                />
              }
              action={<Button variant="contained">Go Now</Button>}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <AppFeatured list={_appFeatured} />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <AppBlogs blogs={localState.blogs} />
          </Grid>

          {/* <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title={`${translate('dashboard.used_storage')}`}
              percent={2.6}
              total={18765}
              chart={{
                colors: [theme.palette.primary.main],
                series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
              }}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title={`${translate('dashboard.active_users')}`}
              percent={0.2}
              total={4876}
              chart={{
                colors: [theme.palette.info.main],
                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
              }}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={4}>
            <AppWidgetSummary
              title={`${translate('dashboard.convert_credit')}`}
              percent={-0.1}
              total={678}
              chart={{
                colors: [theme.palette.warning.main],
                series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
            />
          </Grid> */}
          
          <Grid item xs={12} md={12} lg={12}>
            <AppAreaInstalled
              title="Area Installed"
              subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  {
                    year: '2019',
                    data: [
                      { name: 'Asia', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
                      { name: 'America', data: [10, 34, 13, 56, 77, 88, 99, 77, 45] },
                      { name: 'Canada', data: [37, 43, 45, 13, 88, 56, 43, 79, 87] },
                    ],
                  },
                  {
                    year: '2020',
                    data: [
                      { name: 'Asia', data: [148, 91, 69, 62, 49, 51, 35, 41, 10] },
                      { name: 'America', data: [45, 77, 99, 88, 77, 56, 13, 34, 10] },
                    ],
                  },
                ],
              }}
            />
          </Grid>

          {(user?.customer !== null) ?
            <>
              <Grid item xs={12} md={4} lg={4}>
                <AppActiveProjects
                  title={`${translate('dashboard.limit_projects')} ${localState.contract?.projectNumber}`}
                  chart={{
                    colors: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.info.main,
                      theme.palette.error.main,
                      theme.palette.warning.main,
                      theme.palette.success.main,
                    ],
                    series: localState.projects,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <AppUsedStorages
                  title={`${translate('dashboard.limit_storage')} ${localState.contract?.storage} GB`}
                  chart={{
                    colors: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.info.main,
                      theme.palette.error.main,
                      theme.palette.warning.main,
                      theme.palette.success.main,
                    ],
                    series: localState.storages,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <AppUsedCredits
                  title={`${translate('dashboard.convert_credit')} ${localState.contract?.forgeCredit}`}
                  chart={{
                    colors: [
                      theme.palette.primary.main,
                      theme.palette.secondary.main,
                      theme.palette.info.main,
                      theme.palette.error.main,
                      theme.palette.warning.main,
                      theme.palette.success.main,
                    ],
                    series: localState.credits,
                  }}
                />
              </Grid>
            </>
            : null
          }

          

          {/* <Grid item xs={12} lg={8}>
            <AppNewInvoice
              title="New Invoice"
              tableData={_appInvoices}
              tableLabels={[
                { id: 'id', label: 'Invoice ID' },
                { id: 'category', label: 'Category' },
                { id: 'price', label: 'Price' },
                { id: 'status', label: 'Status' },
                { id: '' },
              ]}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppTopRelated title="Top Related Applications" list={_appRelated} />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppTopInstalledCountries title="Top Installed Countries" list={_appInstalled} />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <AppTopAuthors title="Top Authors" list={_appAuthors} />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
            <Stack spacing={3}>
              <AppWidget
                title="Conversion"
                total={38566}
                icon="eva:person-fill"
                chart={{
                  series: 48,
                }}
              />

              <AppWidget
                title="Applications"
                total={55566}
                icon="eva:email-fill"
                color="info"
                chart={{
                  series: 75,
                }}
              />
            </Stack>
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
