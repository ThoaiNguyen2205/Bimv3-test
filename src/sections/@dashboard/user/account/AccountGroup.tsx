import { useCallback, useEffect, useState } from 'react';
// @mui
import { Avatar, Box, Card, Button, Typography, Stack, Divider } from '@mui/material';
// @types
import { IUserAccountBillingAddress } from '../../../../@types/user';
// components
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
// apis
import userclassesApi from 'src/api/userclassesApi';
// locales
import { useLocales } from 'src/locales';
// auth
import { useAuthContext } from 'src/auth/useAuthContext';
// type
import { IUclass } from 'src/shared/types/uclass';
import { IUser } from 'src/shared/types/user';
import UserCard from './UserCard';
import { DeleteData } from 'src/shared/types/deleteData';
// ----------------------------------------------------------------------

type Props = {
  addressBook: IUserAccountBillingAddress[];
};

type LocalState = {
  groupUsers: IUclass[];
}

export default function AccountGroup({ addressBook }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const [localState, setLocalState] = useState<LocalState>({
    groupUsers: [],
  });

  const loadGroupUsers = useCallback(async () => {
    if (user !== null) {
      if (user.group !== null) {
        const param = { 
          groupId: user.group._id,
        }
        const ucRes = await userclassesApi.getUserClass(param);
        setLocalState((prevState: LocalState) => ({ ...prevState, groupUsers: ucRes.data }));
      } else {
        setLocalState((prevState: LocalState) => ({ ...prevState, groupUsers: [] }));
      }
    }
  }, [user]);

  useEffect(() => {
    loadGroupUsers();
  }, [user]);

  const onSetKeyPerson = async (id: string) => {
    const ucFilter = localState.groupUsers.filter((uci: IUclass) => uci._id === id);
    if (ucFilter.length > 0) {
      const selectedUclass = ucFilter[0];
      
      if ((selectedUclass.user as IUser)._id === user?.id) {
        enqueueSnackbar(`${translate('user.key_person_warning')}`, { variant: 'warning' });
      } else {
        const deleteData: DeleteData = {
          deletedByName: user?.username,
          deletedById: user?.id,
        }
        const updateUclass = await userclassesApi.setKeyById(selectedUclass?._id, deleteData);
        if (updateUclass) {
          loadGroupUsers();
        }
      }
      
    }
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {(user?.group === null) ? 'Chưa gia nhập nhóm' : `${translate('nav.group')} ${user?.group.groupname}`}
        </Typography>

        {(user?.group === null) ? 
          <></>
          :
          <Avatar
            alt={user?.group.groupName}
            src={process.env.REACT_APP_APIFILE + '/images/' + user?.group.logo}
            sx={{ mr: 2, width: 52, height: 52 }}
          />
        }
      </Stack>

      <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {(localState.groupUsers.length < 1) ? 
          <EmptyContent
            title={`${translate('common.no_data')}`}
            sx={{
              '& span.MuiBox-root': { height: 160 },
            }}
          />
          :
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {localState.groupUsers
              .map((member) => (
                <UserCard
                  key={member._id}
                  user={member.user as IUser}
                  uclass={member.uclass}
                  isKey={member.isKey}
                  currentUserKey={user?.isKey}
                  onSetKeyPerson={() => onSetKeyPerson(member._id)}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        }
      </Stack>
    </Card>
  );
}
