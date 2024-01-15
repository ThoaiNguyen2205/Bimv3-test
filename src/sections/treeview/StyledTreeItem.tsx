// @mui
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  // labelIcon: React.ElementType<SvgIconProps>;
  labelIcon?: string;
  avatar?: string;
  labelInfo?: string;
  labelText: string;
  onClick?: VoidFunction;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderRadius: theme.spacing(2),
    paddingRight: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 5,
    // paddingLeft: 20,
    // borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

export default function StyledTreeItem(props: StyledTreeItemProps) {
  const theme = useTheme();
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    avatar,
    labelInfo,
    labelText,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const styleProps = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  return (
    <StyledTreeItemRoot
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2,
            pr: 2,
          }}
        >
          {LabelIcon !== undefined ? (
            <Box color="inherit" sx={{ mr: 1 }}>
              <Iconify icon={LabelIcon} width={24} />
            </Box>
          ) : null}
          {avatar !== undefined ? (
            <Box color="inherit" sx={{ mr: 1 }}>
              <Avatar
                alt={labelText}
                src={process.env.REACT_APP_APIFILE + 'images/' + avatar}
                sx={{ width: 24, height: 24 }}
              />
            </Box>
          ) : null}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={styleProps}
      {...other}
    />
  );
}
