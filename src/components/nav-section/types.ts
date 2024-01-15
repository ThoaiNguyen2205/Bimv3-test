import { StackProps, ListItemButtonProps } from '@mui/material';
// enums
import { UserClassEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

export type INavItem = {
  item: NavListProps;
  depth: number;
  open?: boolean;
  active?: boolean;
  isExternalLink?: boolean;
};

export type NavItemProps = INavItem & ListItemButtonProps;

export type NavListProps = {
  title: string;
  path: string;
  show: UserClassEnum;
  icon?: React.ReactElement;
  info?: React.ReactElement;
  caption?: string;
  disabled?: boolean;
  roles?: string[];
  children?: any;
};


export interface NavSectionProps extends StackProps {
  data: {
    subheader: string;
    items: any; // NavListProps[]
    show: UserClassEnum;
  }[];
}
