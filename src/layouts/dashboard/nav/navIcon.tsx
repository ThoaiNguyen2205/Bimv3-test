// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.gif`} sx={{ width: 1, height: 1 }} />
);

const NAV_ICONS = {
  dashboard: icon('ic_dashboard'),
  cloud: icon('ic_cloud'),
  discussions: icon('ic_discussions'),
  calendar: icon('ic_calendar'),
  member: icon('ic_member'),
  settings: icon('ic_general_settings'),
  coordination: icon('ic_coordination'),
  takeoff: icon('ic_takeoff'),
  schedule: icon('ic_schedule'),
  sheet: icon('ic_sheet'),
  method: icon('ic_method'),
  site: icon('ic_site'),
  combine: icon('ic_combine'),
  history: icon('ic_history'),
  superadmin: icon('ic_admin'),

  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  
};

export default NAV_ICONS;
