import { forwardRef } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { Box, Link, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const FullLogo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const FullLogo = (
      <Box
      component="img"
      src="/logo/logo_full.png"
        sx={{
          width: 140,
          // height: 40,
          display: 'inline-flex',
          cursor: 'pointer',
          ...sx,
        }}
        {...other}
      >
      </Box>
    );

    if (disabledLink) {
      return FullLogo;
    }

    return (
      <Link component={NextLink} href="/" sx={{ display: 'contents' }}>
        {FullLogo}
      </Link>
    );
  }
);

export default FullLogo;
