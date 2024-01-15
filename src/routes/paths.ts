import { paramCase } from 'src/utils/changeCase';
// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_BLOG = '/blog';
const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password')
};

export const PATH_BLOG = {
  root: ROOTS_BLOG,
  view: (id: string) => path(ROOTS_BLOG, `/post/${id}`),
};

export const PATH_PAGE = {
  homepage: '/',
  features: '/features',
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  policy: 'policy',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  tutorials: '/tutorials',
  request: '/request',
  discussion: '/discussion',
  services: {
    root: '/services',
    bimconsulting: '/bim-consulting',
    modeling: '/modeling',
    coordination: '/coordination',
    clashing: '/clashing',
    laserscan: '/laserscan',
    report360: '/report360',
    sitedrone: '/api',
    api: '/sitedrone',
    sitecamera: '/sitecamera',
    scantobim: '/scantobim',
    digitaltwin: '/digitaltwin'
  }
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    dashboard: path(ROOTS_DASHBOARD, '/app'),
    cloud: path(ROOTS_DASHBOARD, '/files-manager')
  },
  information: {
    root: path(ROOTS_DASHBOARD, '/app'),
    discussions: path(ROOTS_DASHBOARD, '/discussions'),
    calendar: path(ROOTS_DASHBOARD, '/calendar')
  },
  member: {
    root: path(ROOTS_DASHBOARD, '/member'),
    users: path(ROOTS_DASHBOARD, '/member/users'),
    groups: path(ROOTS_DASHBOARD, '/member/groups')
  },
  generalSettings: {
    root: path(ROOTS_DASHBOARD, '/general-settings'),
    properties: path(ROOTS_DASHBOARD, '/general-settings/properties'),
    propertySettings: path(
      ROOTS_DASHBOARD,
      '/general-settings/property-settings'
    ),
    systemlogs: path(ROOTS_DASHBOARD, '/general-settings/system-logs'),
    upgradev3: path(ROOTS_DASHBOARD, '/general-settings/upgrade-v3'),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`)
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    homepage: path(ROOTS_DASHBOARD, '/blog/posts'),
    personal: path(ROOTS_DASHBOARD, '/blog/personal'),
    new: path(ROOTS_DASHBOARD, '/blog/new'),
    title: (id: string) => path(ROOTS_DASHBOARD, `/blog/edit/${id}`),
    view: (id: string) => path(ROOTS_DASHBOARD, `/blog/post/${id}`),
    demoView: path(
      ROOTS_DASHBOARD,
      '/blog/post/apply-these-7-secret-techniques-to-improve-event'
    ),
  },
  document: {
    // root: path(ROOTS_DASHBOARD, '/documents'),
    homepage: path(ROOTS_DASHBOARD, '/documents/posts'),
    posts: path(ROOTS_DASHBOARD, '/documents/posts'),
    personal: path(ROOTS_DASHBOARD, '/documents/personal'),
    // new: path(ROOTS_DASHBOARD, '/documents/new'),
    // view: (title: string) => path(ROOTS_DASHBOARD, `/documents/post/${title}`),
    root: `${ROOTS_DASHBOARD}/documents`,
    new: `${ROOTS_DASHBOARD}/documents/new`,
    details: (title: string) =>
      `${ROOTS_DASHBOARD}/documents/post/${paramCase(title)}`,
    edit: (title: string) =>
      `${ROOTS_DASHBOARD}/documents/edit/${paramCase(title)}`
  },
  cloud: {
    root: path(ROOTS_DASHBOARD, '/cloud'),
    filesManager: path(ROOTS_DASHBOARD, '/cloud/files-manager'),
    send: path(ROOTS_DASHBOARD, '/cloud/sendfile'),
    requests: path(ROOTS_DASHBOARD, '/cloud/requests'),
    requestDetails: path(ROOTS_DASHBOARD, '/cloud/request-details'),
    reviews: path(ROOTS_DASHBOARD, '/cloud/reviews'),
    reports: path(ROOTS_DASHBOARD, '/cloud/reports'),
    trash: path(ROOTS_DASHBOARD, '/cloud/trash')
  },
  projects: {
    root: path(ROOTS_DASHBOARD, '/projects'),
    list: path(ROOTS_DASHBOARD, '/projects/list'),
    forms: path(ROOTS_DASHBOARD, '/projects/forms')
  },
  coordinator: {
    root: path(ROOTS_DASHBOARD, '/coordinator'),
    collaborations: path(ROOTS_DASHBOARD, '/coordinator/collaborations'),
    collaborationDetails: path(ROOTS_DASHBOARD, '/coordinator/collab-details'),
    rfiReports: path(ROOTS_DASHBOARD, '/coordinator/rfi-reports'),
    clashing: path(ROOTS_DASHBOARD, '/coordinator/clashing')
  },
  takeoff: {
    root: path(ROOTS_DASHBOARD, '/takeoff'),
    sources: path(ROOTS_DASHBOARD, '/takeoff/sources'),
    quantity: path(ROOTS_DASHBOARD, '/takeoff/quantity')
  },
  schedules: {
    root: path(ROOTS_DASHBOARD, '/schedules'),
    planning: path(ROOTS_DASHBOARD, '/schedules/planning'),
    planningDetails: path(ROOTS_DASHBOARD, '/schedules/planningdetails'),
    colorreport: path(ROOTS_DASHBOARD, '/schedules/colorreport')
  },
  site: {
    root: path(ROOTS_DASHBOARD, '/digital-site'),
    pointClouds: path(ROOTS_DASHBOARD, '/digital-site/pointclouds'),
    pointCloudDetails: path(ROOTS_DASHBOARD, '/digital-site/pcd-details'),
    report360s: path(ROOTS_DASHBOARD, '/digital-site/reports360'),
    report360sDetails: path(ROOTS_DASHBOARD, '/digital-site/r360-details'),
  },
  projectHistory: {
    root: path(ROOTS_DASHBOARD, '/project-history'),
    planning: path(ROOTS_DASHBOARD, '/project-history/planning'),
    planningDetails: path(ROOTS_DASHBOARD, '/project-history/planningdetails'),
    colorreport: path(ROOTS_DASHBOARD, '/project-history/colorreport')
  },
  combineData: {
    root: path(ROOTS_DASHBOARD, '/combine-data'),
    planning: path(ROOTS_DASHBOARD, '/combine-data/planning'),
    planningDetails: path(ROOTS_DASHBOARD, '/combine-data/planningdetails'),
    colorreport: path(ROOTS_DASHBOARD, '/combine-data/colorreport')
  },
  method: {
    root: path(ROOTS_DASHBOARD, '/method-statement'),
    bymodel: path(ROOTS_DASHBOARD, '/method-statement/by-model')
    // planningDetails: path(ROOTS_DASHBOARD, '/method-statement/planningdetails'),
    // colorreport: path(ROOTS_DASHBOARD, '/method-statement/colorreport'),
  },
  // kanban: path(ROOTS_DASHBOARD, '/kanban'),
  // permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  // blank: path(ROOTS_DASHBOARD, '/blank'),
  // mail: {
  //   root: path(ROOTS_DASHBOARD, '/mail'),
  //   all: path(ROOTS_DASHBOARD, '/mail/all'),
  // },
  // chat: {
  //   root: path(ROOTS_DASHBOARD, '/chat'),
  //   new: path(ROOTS_DASHBOARD, '/chat/new'),
  //   view: (name: string) => path(ROOTS_DASHBOARD, `/chat/${name}`),
  // },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    new: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    view: (name: string) =>
      path(ROOTS_DASHBOARD, `/e-commerce/product/${name}`),
    edit: (name: string) =>
      path(ROOTS_DASHBOARD, `/e-commerce/product/${name}/edit`),
    demoEdit: path(
      ROOTS_DASHBOARD,
      '/e-commerce/product/nike-blazer-low-77-vintage/edit'
    ),
    demoView: path(
      ROOTS_DASHBOARD,
      '/e-commerce/product/nike-air-force-1-ndestrukt'
    )
  },
  // invoice: {
  //   root: path(ROOTS_DASHBOARD, '/invoice'),
  //   list: path(ROOTS_DASHBOARD, '/invoice/list'),
  //   new: path(ROOTS_DASHBOARD, '/invoice/new'),
  //   view: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}`),
  //   edit: (id: string) => path(ROOTS_DASHBOARD, `/invoice/${id}/edit`),
  //   demoEdit: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1/edit'),
  //   demoView: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5'),
  // },
  superadmin: {
    root: path(ROOTS_DASHBOARD, '/bimnextadmin/users'),
    users: path(ROOTS_DASHBOARD, '/bimnextadmin/users'),
    customers: path(ROOTS_DASHBOARD, '/bimnextadmin/customers'),
    systems: path(ROOTS_DASHBOARD, '/bimnextadmin/systems')
  }
};

export const PATH_DOCS = {
  root: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog'
};

export const PATH_ZONE_ON_STORE =
  'https://mui.com/store/items/zone-landing-page/';

export const PATH_MINIMAL_ON_STORE =
  'https://mui.com/store/items/minimal-dashboard/';

export const PATH_FREE_VERSION =
  'https://mui.com/store/items/minimal-dashboard-free/';

export const PATH_FIGMA_PREVIEW =
  'https://www.figma.com/file/rWMDOkMZYw2VpTdNuBBCvN/%5BPreview%5D-Minimal-Web.26.11.22?node-id=0%3A1&t=ya2mDFiuhTXXLLF1-1';
