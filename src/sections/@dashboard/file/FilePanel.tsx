import NextLink from 'next/link';
// @mui
import { Stack, Button, Typography, StackProps, IconButton } from '@mui/material';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  title: string;
  subTitle?: string;
  collapse?: boolean;
  onCollapse?: VoidFunction;
}

export default function FilePanel({
  title,
  subTitle,
  collapse,
  onCollapse,
  sx,
  ...other
}: Props) {
  return (
    <Stack direction="row" alignItems="center" sx={{ mb: 1, ...sx }} {...other}>
      <Stack flexGrow={1}>
        <Stack direction="row" alignItems="center" spacing={1} flexGrow={1} sx={{ ml: 3 }} >
          <Typography variant="h6"> {title} </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.disabled', ml: 3, mt: 0.5 }}>
          <i>{subTitle}</i>
        </Typography>
      </Stack>

      {onCollapse && (
        <IconButton onClick={onCollapse}>
          <Iconify icon={collapse ? 'eva:chevron-down-fill' : 'eva:chevron-up-fill'} />
        </IconButton>
      )}
    </Stack>
  );
}
