// @mui
import { Box, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';
// ----------------------------------------------------------------------

type Props = {
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children, illustration }: Props) {
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      <StyledSection>
        <Box
          component="img"
          src="/logo/logo_full.png"
            sx={{
              width: 200,
              display: 'inline-flex',
              cursor: 'pointer',
            }}
          >
        </Box>

        {(illustration !== '') ?
          <Image
            disabledEffect
            visibleByDefault
            alt="auth"
            src={illustration}
            sx={{ minWidth: 600, maxWidth: 1200 }}
          />
          : null
        }

        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
    </StyledRoot>
  );
}
