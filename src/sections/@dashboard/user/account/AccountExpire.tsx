import { useState, useCallback, useEffect } from 'react';
// @mui
import { 
  Avatar,
  Grid, 
  Card, 
  Typography, 
  Stack, 
  Table, 
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer } from '@mui/material';
// components
import {
  TableNoData,
} from '../../../../components/table';
import Label from '../../../../components/label';
// hooks
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/useAuthContext';
// api
import userclassesApi from '../../../../api/userclassesApi';
// utils
import { fDate } from '../../../../utils/formatTime';
//type
import { IUclass } from 'src/shared/types/uclass';
import { ICustomer } from 'src/shared/types/customer';
// enums
import { UserClassEnum } from 'src/shared/enums';
// ----------------------------------------------------------------------

export default function AccountExpire() {

  const { translate } = useLocales();
  const { user } = useAuthContext();

  const [customerCollection, setCustomerCollection] = useState<IUclass[]>([]);

  const customersData = useCallback(async () => {
    if (user) {
      const param = { userId: user.id };
      const cusResponse = await userclassesApi.getUserClass(param);
      setCustomerCollection(cusResponse.data);
    }
  }, [user]);

  const isNotFound = !customerCollection.length;

  useEffect(() => {
    customersData();
  }, []);

  return (
    <Grid container spacing={5}>
      <Grid item xs={12} md={12}>
        <Stack spacing={3}>
          <Card sx={{ py: 3 }}>
            <Typography variant="overline" sx={{ px: 3, mb: 3, display: 'block', color: 'text.secondary' }}>
              {`${translate('user.expire')}`}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ width: '80px' }}>{`${translate('common.customer')}`}</TableCell>
                    <TableCell align="left">{}</TableCell>
                    <TableCell align="center">{`${translate('superadmin.uclass')}`}</TableCell>
                    <TableCell align="center">{`${translate('user.expire')}`}</TableCell>
                    <TableCell align="center">{`${translate('user.join')}`}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerCollection && customerCollection.map((userRow) => (
                    <TableRow hover key={userRow._id}>
                      <TableCell align="center" sx={{ width: '80px' }} >
                        <Avatar alt={(userRow.customer as ICustomer).shortName} src={process.env.REACT_APP_APIFILE + `/images/${(userRow.customer as ICustomer).logo}`} sx={{ maxWidth: 120, cursor: 'pointer' }} />
                      </TableCell>
                      <TableCell align="left">
                        {(userRow.customer as ICustomer).shortName}
                      </TableCell>
                      <TableCell align="center">
                        <Label
                          variant="soft"
                          color={(userRow.uclass === UserClassEnum.User) ? 'warning' : 'success'}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {(userRow.uclass === UserClassEnum.User) ? `${(translate('common.user'))}` : `${(translate('common.admin'))}`}
                        </Label>
                      </TableCell>
                      <TableCell align="center">{fDate(userRow.expired)}</TableCell>
                      <TableCell align="center">{fDate(userRow.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>

          </Card>

        </Stack>
      </Grid>

    </Grid>
  );
}
