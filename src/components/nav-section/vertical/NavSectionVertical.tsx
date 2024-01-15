// @mui
import { List, Stack } from '@mui/material';
// locales
import { useLocales } from '../../../locales';
// Auth
import { useAuthContext } from 'src/auth/useAuthContext';
//
import { NavSectionProps } from '../types';
import { StyledSubheader } from './styles';
import NavList from './NavList';
// enums
import { UserClassEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

export default function NavSectionVertical({ data, sx, ...other }: NavSectionProps) {

  const { translate } = useLocales();
  const { user } = useAuthContext();

  return (
    <>
      {data ? (
        <Stack sx={sx} {...other}>
          {data.map((group) => {
            const key = group.subheader || group.items[0].title;
            let showMe = false;
            if (user?.class === null) {
              if (group.show === UserClassEnum.Admin) {
                showMe = false;
              } else {
                showMe = true;
              }
            } else {
              showMe = group.show === user?.class?.uclass;
              if (user?.class?.uclass === UserClassEnum.Admin) showMe = true;
            }
            return (showMe &&
              <List key={key} disablePadding sx={{ px: 2 }}>
                {group.subheader && (
                  <StyledSubheader disableSticky>{`${translate(group.subheader)}`}</StyledSubheader>
                )}

                {group.items.map((list: any) => {
                  let showItem = false;
                  if (user?.class === null) {
                    if (list.show === UserClassEnum.Admin) {
                      showItem = false;
                    } else {
                      showItem = true;
                      // showItem = list.show === user?.class.uclass;
                      // if (user?.class.uclass === UserClassEnum.Admin) showItem = true;
                    }
                  } else {
                    showItem = list.show === user?.class.uclass;
                    if (user?.class.uclass === UserClassEnum.Admin) showItem = true;
                    if (user?.projectrole === UserClassEnum.Admin) showItem = true;
                  }
                  return (showItem &&
                    <NavList
                      key={list.title + list.path}
                      data={list}
                      depth={1}
                      hasChild={!!list.children}
                    />
                  )
                })}
              </List>
            );
          })}
        </Stack>
      ) : (
        <></>
      )}
    </>
  );
}
