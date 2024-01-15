// @mui
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
// utils
import { bgBlur } from '../../../../utils/cssStyles';
// auth
import { useAuthContext } from '../../../../auth/useAuthContext';
// components
import Image from '../../../../components/image';
import { CustomAvatar } from '../../../../components/custom-avatar';
import { UserClassEnum } from 'src/shared/enums';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  '&:before': {
    // ...bgBlur({
    //   color: theme.palette.grey[900],
    // }),
    top: 0,
    zIndex: 9,
    content: "''",
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
}));

const StyledInfo = styled('div')(({ theme }) => ({
  left: 0,
  right: 0,
  zIndex: 99,
  position: 'absolute',
  marginTop: theme.spacing(5),
  [theme.breakpoints.up('md')]: {
    right: 'auto',
    display: 'flex',
    alignItems: 'center',
    left: theme.spacing(3),
    bottom: theme.spacing(3),
  },
}));

// ----------------------------------------------------------------------

export default function ProfileCover() {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  console.log(user?.class.uclass);
  
  return (
    <StyledRoot>
      <StyledInfo>
        <CustomAvatar
          src={process.env.REACT_APP_APIFILE + 'images/' + user?.avatar}
          alt='avatar'
          name={user?.username}
          sx={{
            mx: 'auto',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: 'common.white',
            width: { xs: 80, md: 128 },
            height: { xs: 80, md: 128 },
          }}
        />

        <Box
          sx={{
            ml: { md: 3 },
            mt: { xs: 1, md: 0 },
            color: 'common.white',
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography variant="h4">{user?.username}</Typography>

          <Typography sx={{ opacity: 0.72 }}>{(user?.class.uclass === UserClassEnum.Admin) ? `${translate('common.admin')}` : `${translate('common.user')}`}</Typography>
        </Box>
      </StyledInfo>

      <Image
        alt="cover"
        src={process.env.REACT_APP_APIFILE + 'images/' + user?.cover}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: 'absolute',
        }}
      />
    </StyledRoot>
  );
}
