import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
// @mui
import { Theme, alpha } from '@mui/material/styles';
import { Box, Divider, Grid, Typography, Stack, MenuItem, SxProps, Tooltip, Avatar } from '@mui/material';
// locales
import { useLocales } from '../../../locales';
// components
import Image from '../../../components/image';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/iconify/Iconify';
import { CustomAvatar } from '../../../components/custom-avatar';
import { useSnackbar } from '../../../components/snackbar';
// api
import userclassesApi from '../../../api/userclassesApi';
import usersApi from '../../../api/usersApi';
//
import { ICustomer, ICustomerResGetAll } from '../../../shared/types/customer';
// Auth context
import { AuthContext } from '../../../auth/JwtContext';
// locales
import { useAuthContext } from '../../../auth/useAuthContext';
import customersApi from '../../../api/customersApi';
// type
import { IUclass, IUclassResGetAll } from '../../../shared/types/uclass';
import { UserClassEnum } from '../../../shared/enums';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { IUser } from '../../../shared/types/user';
import { IProject } from '../../../shared/types/project';
// ----------------------------------------------------------------------

type ILocalState = {
  openPopover: HTMLElement | null;
  customers: Array<ICustomer>;
  selectedCustomer: string;
};

interface Props {
  sx?: SxProps<Theme>;
}

export default function CustomersPopover({ sx }: Props) {
  const { user, refresh } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    customers: [],
    selectedCustomer: '',
  });

  useEffect(() => {
    const loadCustomers = async () => {
      let params = { userId: user?.id };
      const ucRes: IUclassResGetAll = await userclassesApi.getUserClass(params) as IUclassResGetAll;
      const listCustomers: Array<ICustomer> = [];
      for (const uc of ucRes.data) {
        const customer: ICustomer = uc.customer as ICustomer;
        listCustomers.push(customer);
      }
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        customers:listCustomers,
        selectedCustomer: user?.customer,
      }));
    }
    loadCustomers();
  },[user]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: event.currentTarget,
    }));
    if (localState.customers.length < 1) {{
      enqueueSnackbar(`${translate('helps.no_customer')}`, {variant: "error"});
    }}
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openPopover: null,
    }));
  };

  const handleChangeCustomer = async (newCustomerId: string) => {
    if (user?.class !== null) {
      if (user?.class.blockedAt !== null && user?.class.blockedAt !== undefined) {
        enqueueSnackbar(`${translate('common.blocked_user')}`, {variant: "error"});
        return;
      }
    }
    
    const curCustomer = await customersApi.getReadById(newCustomerId);
    if (curCustomer.blockedAt === null || curCustomer.blockedAt === undefined) {
      let params = {
        userId: user?.id,
        customerId: newCustomerId
      };
      const classResponse = await userclassesApi.getUserClass(params);
      await usersApi.updateById(user?.id, { 
        customer: newCustomerId,
        class: classResponse.data[0]._id,
        project: null,
        projectrole: UserClassEnum.User,
      });
      await refresh(user?.id);
      
      handleClosePopover();
      router.push(PATH_DASHBOARD.projects.list);
    } else {
      enqueueSnackbar(`${translate('common.blocked_customer')}`, {variant: "error"});
    }
  };

  const handleSelectProject = () =>{
    router.push(PATH_DASHBOARD.projects.list);
    handleClosePopover();
  }

  return (
    <>

      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ...(localState.openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
            },
          }),
          ...sx,
        }}
      >
        {(user?.customer === null || user?.customer === undefined) ?
          <CustomAvatar
            src={`${process.env.REACT_APP_APIFILE}images/comlogo.png`}
            alt={`${translate('common.select_customer')}`}
            name={`${translate('common.select_customer')}`}
            sx= {{
              width: '42px',
              height: '42px',
            }}
          />
          :
          <CustomAvatar
            src={`${process.env.REACT_APP_APIFILE}images/${user?.customer.logo}`}
            alt={user?.customer.shortName}
            name={user?.customer.shortName}
            sx= {{
              width: '42px',
              height: '42px',
            }}
          />
        }
      </IconButtonAnimate>

      {(localState.customers.length > 0) ?
        <MenuPopover open={localState.openPopover} onClose={handleClosePopover} sx={{ width: 180 }}>
          <Stack spacing={0.75} sx={{ mb: 1 }} >
            {localState.customers.map((option) => (
              <MenuItem
                key={option._id}
                selected={option._id === localState.selectedCustomer}
                onClick={() => handleChangeCustomer(option._id)}
              >
                <Avatar
                  alt={option.shortName}
                  src={process.env.REACT_APP_APIFILE + `images/${option.logo}`}
                  sx={{ width: 30, height: 30, mr: 2 }}
                />

                {option.shortName}
              </MenuItem>
            ))}
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {(user?.project !== null && user?.project !== undefined) ?
            <Stack sx={{ p: 1 }} direction='row'>
              <CustomAvatar
                src={`${process.env.REACT_APP_APIFILE}images/${((user as IUser).project as IProject).avatar}`}
                alt={'project'}
                name={'project'}
                sx= {{
                  ml: '3px',
                  mr: 2,
                  width: '24px',
                  height: '24px',
                }}
              />
              <Tooltip title={`${((user as IUser).project as IProject).name}`} placement='top'>
                <Typography variant='subtitle2' noWrap>
                  {`${((user as IUser).project as IProject).name}`}
                </Typography>
              </Tooltip>
            </Stack>
            :
            null
          }

          <Stack sx={{ p: 1 }} color='primary.main'>
            <MenuItem key={'select_project'} onClick={handleSelectProject} >
              <Iconify icon="eos-icons:project" width={18} />
              {`${translate('nav.select_project')}`}
            </MenuItem>
          </Stack>
          
        </MenuPopover>
        :
        <></>
      }

    </>
  );
}
