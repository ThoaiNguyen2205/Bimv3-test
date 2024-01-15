// routes
import { PATH_AUTH, PATH_DOCS, PATH_PAGE, PATH_BLOG } from '../../../routes/paths';
// config
import { PATH_AFTER_LOGIN } from '../../../config-global';
// components
import Iconify from '../../../components/iconify';

import { UserClassEnum } from 'src/shared/enums';

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'menu.home',
    icon: <Iconify icon={'eva:home-fill'} />,
    path: PATH_PAGE.homepage,
    show: UserClassEnum.User,
    // children: [],
  },
  {
    title: 'nav.blog',
    icon: <Iconify icon={'ic:round-topic'} />,
    path: PATH_BLOG.root,
    show: UserClassEnum.User,
    // children: [],
  },
  {
    title: 'menu.services',
    path: '/services',
    icon: <Iconify icon={'carbon:cloud-satellite-services'} />,
    show: UserClassEnum.User,
    children: [
      {
        subheader: 'menu.bim',
        items: [
          { 
            title: 'menu.bim_consultant',
            path: PATH_PAGE.services.bimconsulting,
            icon: <Iconify icon={'carbon:report'} sx={{ mr:1 }}/>,
            show: UserClassEnum.User,
          },
          {
            title: 'menu.modeling',
            path: PATH_PAGE.services.modeling,
            icon: <Iconify icon={'iconoir:3d-three-pts-box'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.coordination',
            path: PATH_PAGE.services.coordination,
            icon: <Iconify icon={'fluent:people-edit-20-regular'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          {
            title: 'menu.clashing',
            path: PATH_PAGE.services.clashing,
            icon: <Iconify icon={'fluent:column-edit-24-filled'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.api',
            path: PATH_PAGE.services.api,
            icon: <Iconify icon={'carbon:gateway-api'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
        ],
        show: UserClassEnum.User,
      },
      {
        subheader: 'menu.site',
        items: [
          { 
            title: 'menu.laser_scan',
            path: PATH_PAGE.services.laserscan,
            icon: <Iconify icon={'ion:scan-circle-outline'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.report_360',
            path: PATH_PAGE.services.report360,
            icon: <Iconify icon={'gis:360'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.drone_services',
            path: PATH_PAGE.services.sitedrone,
            icon: <Iconify icon={'healthicons:drone-outline'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          {
            title: 'menu.site_camera',
            path: PATH_PAGE.services.sitecamera,
            icon: <Iconify icon={'icon-park-outline:surveillance-cameras-one'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.scan2bim',
            path: PATH_PAGE.services.scantobim,
            icon: <Iconify icon={'mdi:cube-scan'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.digital_twin',
            path: PATH_PAGE.services.digitaltwin,
            icon: <Iconify icon={'fluent:copy-select-20-filled'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
        ],
        show: UserClassEnum.User,
      },
      {
        subheader: 'menu.support',
        items: [
          { 
            title: 'menu.docs',
            path: PATH_DOCS.root,
            icon: <Iconify icon={'gala:file-doc'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },            
          { 
            title: 'menu.faqs',
            path: PATH_PAGE.faqs,
            icon: <Iconify icon={'wpf:faq'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.video_tutorials',
            path: PATH_PAGE.tutorials,
            icon: <Iconify icon={'akar-icons:video'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.request',
            path: PATH_PAGE.request,
            icon: <Iconify icon={'carbon:request-quote'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
          { 
            title: 'menu.discussion',
            path: PATH_PAGE.discussion,
            icon: <Iconify icon={'codicon:comment-discussion'} sx={{ mr:1 }} />,
            show: UserClassEnum.User,
          },
        ],
        show: UserClassEnum.User,
      },
      {
        subheader: 'Dashboard',
        items: [{ title: 'Dashboard', path: PATH_AFTER_LOGIN, show: UserClassEnum.User, }],
        show: UserClassEnum.User,
      },
    ],
  },
  {
    title: 'menu.contact',
    icon: <Iconify icon={'eva:book-open-fill'} />,
    path: PATH_PAGE.contact,
    show: UserClassEnum.User,
    // children: [],
  },
];

export default navConfig;
