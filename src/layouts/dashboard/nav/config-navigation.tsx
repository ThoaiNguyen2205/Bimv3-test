// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// enums
import { UserClassEnum, AppIMEI } from 'src/shared/enums';
// icons
import NAV_ICONS from "src/layouts/dashboard/nav/navIcon";
// type
import { NavListProps } from 'src/components/nav-section';
// apis
import { IBimnextApp } from 'src/shared/types/bimnextApp';

const addAppMenu = (imei: string): any => {

  let nav: NavListProps = {
    title: '',
    path: '',
    show: UserClassEnum.User,
  };

  switch (imei) {
    case AppIMEI.Cloud:
      nav = {
        title: 'nav.cloud',
        path: PATH_DASHBOARD.cloud.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.cloud,
        children: [
          { title: 'nav.file_manager', path: PATH_DASHBOARD.cloud.filesManager, show: UserClassEnum.User },
          { title: 'nav.request', path: PATH_DASHBOARD.cloud.requests, show: UserClassEnum.User },
          { title: 'nav.trash', path: PATH_DASHBOARD.cloud.trash, show: UserClassEnum.Admin },
        ],
      };
      return nav;
    case AppIMEI.Coordination:
      nav = {
        title: 'nav.coordination',
        path: PATH_DASHBOARD.coordinator.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.coordination,
        children: [
          { title: 'nav.collaboration', path: PATH_DASHBOARD.coordinator.collaborations, show: UserClassEnum.User },
          { title: 'nav.rfi_reports', path: PATH_DASHBOARD.coordinator.rfiReports, show: UserClassEnum.User },
          { title: 'nav.clashing', path: PATH_DASHBOARD.coordinator.clashing, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.TakeOff:
      nav = {
        title: 'nav.take_off',
        path: PATH_DASHBOARD.takeoff.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.takeoff,
        children: [
          { title: 'nav.source', path: PATH_DASHBOARD.takeoff.sources, show: UserClassEnum.User },
          { title: 'nav.quantity_table', path: PATH_DASHBOARD.takeoff.quantity, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.Schedule:
      nav = {
        title: 'nav.schedule',
        path: PATH_DASHBOARD.schedules.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.schedule,
        children: [
          { title: 'nav.planning', path: PATH_DASHBOARD.schedules.planning, show: UserClassEnum.User },
          { title: 'nav.color_report', path: PATH_DASHBOARD.schedules.colorreport, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.Sheet:
      nav = {
        title: 'nav.sheets',
        path: PATH_DASHBOARD.schedules.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.sheet,
        children: [
          { title: 'nav.sheets', path: PATH_DASHBOARD.schedules.planning, show: UserClassEnum.User },
          // { title: 'nav.color_report', path: PATH_DASHBOARD.schedules.colorreport, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.MethodStatement:
      nav = {
        title: 'nav.method_statement',
        path: PATH_DASHBOARD.method.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.method,
        children: [
          { title: 'nav.method_statement', path: PATH_DASHBOARD.method.bymodel, show: UserClassEnum.User },
          // { title: 'nav.color_report', path: PATH_DASHBOARD.schedules.colorreport, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.ProjectHistory:
      nav = {
        title: 'nav.project_histories',
        path: PATH_DASHBOARD.projectHistory.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.history,
        children: [
          { title: 'nav.project_histories', path: PATH_DASHBOARD.projectHistory.planning, show: UserClassEnum.User },
          // { title: 'nav.rfi_reports', path: PATH_DASHBOARD.coordinator.rfiReports, show: UserClassEnum.User },
          // { title: 'nav.clashing', path: PATH_DASHBOARD.coordinator.clashing, show: UserClassEnum.User },
        ],
      };
      return nav;
    case AppIMEI.CombineData:
      nav = {
        title: 'nav.combine_data',
        path: PATH_DASHBOARD.combineData.root,
        show: UserClassEnum.User,
        icon: NAV_ICONS.combine,
        children: [
          // { title: 'nav.collaboration', path: PATH_DASHBOARD.coordinator.collaborations, show: UserClassEnum.User },
          { title: 'nav.combine_data', path: PATH_DASHBOARD.combineData.colorreport, show: UserClassEnum.User },
          // { title: 'nav.clashing', path: PATH_DASHBOARD.coordinator.clashing, show: UserClassEnum.User },
        ],
      };
      return nav;
  }
}

const addSiteMenu = (imei: string): any => {
  switch (imei) {
    case AppIMEI.Report360:
      return { title: 'nav.reports360', path: PATH_DASHBOARD.site.report360s, show: UserClassEnum.User };
    case AppIMEI.PointCloud:
      return { title: 'nav.point_cloud', path: PATH_DASHBOARD.site.pointClouds, show: UserClassEnum.User };
  }
}

const getNavMenu = (data: IBimnextApp[]) => {
  const items: any = [];

  if (data.filter((e) => e.AppIMEI === AppIMEI.Cloud).length > 0) {
    items.push(
      {
        title: 'nav.discussion',
        path: PATH_DASHBOARD.information.discussions,
        show: UserClassEnum.User,
        icon: NAV_ICONS.discussions,
      },
      {
        title: 'nav.calendar',
        path: PATH_DASHBOARD.information.calendar,
        show: UserClassEnum.User,
        icon: NAV_ICONS.calendar,
      },
    );
  }

  for (const appi of data) {
    const item = addAppMenu(appi.AppIMEI);
    if (item !== undefined) {
      items.push(item);
    }
  }

  let siteNav: NavListProps = {
    title: 'nav.site',
    path: PATH_DASHBOARD.site.root,
    show: UserClassEnum.User,
    icon: NAV_ICONS.site,
    children: [],
  };

  for (const appi of data) {
    const item = addSiteMenu(appi.AppIMEI);
    if (item !== undefined) {
      siteNav.children.push(item);
    }
  }

  if (siteNav.children.length > 0) {
    items.push(siteNav);
  }
  
  const navConfig = [
    {
      subheader: 'nav.general',
      items: [
        { title: 'nav.dashboard', path: PATH_DASHBOARD.general.dashboard, show: UserClassEnum.User, icon: NAV_ICONS.dashboard },
        // { title: 'nav.discussion', path: PATH_DASHBOARD.general.discussions, show: UserClassEnum.User, icon: NAV_ICONS.discussions },
        // { title: 'nav.calendar', path: PATH_DASHBOARD.general.calendar, show: UserClassEnum.User, icon: NAV_ICONS.calendar },
      ],
      show: UserClassEnum.User,
    },
    {
      subheader: 'nav.internal',
      items: [
        {
          title: 'nav.member',
          path: PATH_DASHBOARD.member.users,
          icon: NAV_ICONS.member,
          children: [
            { title: 'nav.users', path: PATH_DASHBOARD.member.users, show: UserClassEnum.Admin },
          ],
          show: UserClassEnum.Admin,
        },
        {
          title: 'nav.settings',
          path: PATH_DASHBOARD.generalSettings.root,
          icon: NAV_ICONS.settings,
          children: [
            { title: 'nav.properties', path: PATH_DASHBOARD.generalSettings.properties, show: UserClassEnum.Admin },
            { title: 'nav.property_settings', path: PATH_DASHBOARD.generalSettings.propertySettings, show: UserClassEnum.Admin },
            { title: 'nav.logs', path: PATH_DASHBOARD.generalSettings.systemlogs, show: UserClassEnum.Admin },
            { title: 'nav.upgrade_v3', path: PATH_DASHBOARD.generalSettings.upgradev3, show: UserClassEnum.Admin },
          ],
          show: UserClassEnum.Admin
        },
      ],
      show: UserClassEnum.Admin,
    },
  ];

  navConfig.splice(1, 0, {
    subheader: 'nav.project_manager',
    items: items,
    show: UserClassEnum.User,
  })


  return navConfig;
}

export { getNavMenu };