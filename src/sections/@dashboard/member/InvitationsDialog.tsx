// react
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  List,
  Stack,
  Dialog,
  Button,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import InvitationItem from './InvitationItem';
import ConfirmDialog from 'src/components/confirm-dialog';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import invitationsApi from 'src/api/invitationsApi';
import userclassesApi from 'src/api/userclassesApi';
// type
import {
  IInvitation,
  IInvitationReqCreate,
  IInvitationResGetAll
} from 'src/shared/types/invitation';
import { ICustomer } from 'src/shared/types/customer';
import { DeleteData } from 'src/shared/types/deleteData';
import { IContract } from 'src/shared/types/contract';

// ----------------------------------------------------------------------

type LocalState = {
  invitations: Array<IInvitation>;
  selectedInvitation: IInvitation | null;
};

// ----------------------------------------------------------------------
type FormValuesProps = {
  email: string;
};

interface Props extends DialogProps {
  countUclasses: () => void;
  contract: IContract | null;
  open: boolean;
  onClose: VoidFunction;
}

export default function InvitationsDialog({
  countUclasses,
  contract,
  open,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const [localState, setLocalState] = useState<LocalState>({
    invitations: [],
    selectedInvitation: null
  });

  const loadInvitations = useCallback(async () => {
    const param = { customerId: user?.customer._id };
    const invitationsResponse: IInvitationResGetAll =
      await invitationsApi.getInvitations(param);
    const invitations: Array<IInvitation> = invitationsResponse.data;
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      invitations: invitations
    }));
  }, [user]);

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const addEmailSchema = Yup.object().shape({
    email: Yup.string()
      .email(`${translate('auth.valid_email')}`)
      .max(255)
      .required(`${translate('auth.required_email')}`)
  });

  const defaultValues = useMemo(
    () => ({
      email: ''
    }),
    []
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(addEmailSchema),
    defaultValues
  });

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = methods;

  const onSubmit = async (data: any) => {
    const totalUsers = contract ? contract.users : 0;
    const existingUsers = parseInt(`${countUclasses()}`);
    if (existingUsers + localState.invitations.length >= totalUsers) {
      enqueueSnackbar(`${translate('common.limit_users')}`, {
        variant: 'warning'
      });
      return;
    }

    const newInvitationReq: IInvitationReqCreate = {
      customer: user?.customer._id,
      fromEmail: user?.email,
      toEmail: data.email
    };

    // Loại trường hợp trùng email người nhận
    const param = { email: data.email, customerId: user?.customer._id };
    const checkToMailExisting = await invitationsApi.getInvitations(param);
    if (checkToMailExisting.data.length > 0) {
      enqueueSnackbar(`${translate('common.duplicated_invitation')}`, {
        variant: 'warning'
      });
      return;
    }

    // Không cho phép gửi đến người dùng đã tham gia vào đối tác
    // Kiểm tra các uclass trùng customer Id
    const checkRes = await userclassesApi.joinedCheck(
      user?.customer._id,
      data.email
    );
    if (checkRes === 'yes') {
      enqueueSnackbar(`${translate('common.user_joined')}`, {
        variant: 'warning'
      });
      return;
    }

    const newInvitation = await invitationsApi.postCreate(newInvitationReq);
    if (newInvitation) {
      loadInvitations();
      setValue('email', '');
    }
  };

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleOpenConfirm = (id: string) => {
    const selectedInvitationId = id;
    const selectedInvitation = localState.invitations.filter(
      (value) => value._id === selectedInvitationId
    )[0];
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      selectedInvitation: selectedInvitation
    }));
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const onDeleteInvitation = async () => {
    if (localState.selectedInvitation) {
      const deleteData: DeleteData = {
        deletedByName: user?.username,
        deletedById: user?.id
      };
      const deleteInvitation = await invitationsApi.deleteById(
        localState.selectedInvitation._id,
        deleteData
      );
      if (deleteInvitation) {
        loadInvitations();
        handleCloseConfirm();
        setLocalState((prevState: LocalState) => ({
          ...prevState,
          selectedInvitation: null
        }));
        setValue('email', '');
      }
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('invitations.invitations')}`} </DialogTitle>

        <DialogContent sx={{ overflow: 'unset' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <RHFTextField
              size="small"
              name="email"
              variant="outlined"
              fullWidth
              label="Email:"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="ic:round-mark-email-read" width={24} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="tabler:send" />}
              sx={{ minWidth: 140 }}
              loading={isSubmitting}>
              {`${translate('common.send')}`}
            </LoadingButton>
          </Stack>

          {localState.invitations.length > 0 && (
            <Scrollbar sx={{ maxHeight: 60 * 6 }}>
              <List disablePadding>
                {localState.invitations.map((invi) => (
                  <InvitationItem
                    key={invi._id}
                    invitation={invi}
                    onDelete={() => {
                      handleOpenConfirm(invi._id);
                    }}
                  />
                ))}
              </List>
            </Scrollbar>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }} />
          {onClose && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mdi:exit-to-app" />}
              onClick={onClose}>
              {`${translate('common.close')}`}
            </Button>
          )}
        </DialogActions>

        {localState.selectedInvitation !== null ? (
          <ConfirmDialog
            open={openConfirm}
            onClose={handleCloseConfirm}
            title={`${translate('invitations.invitation')} ${translate(
              'common.of'
            )} ${
              (localState.selectedInvitation.customer as ICustomer).shortName
            }`}
            content={`${translate('common.delete_confirm')} ${translate(
              'invitations.invitation'
            )} ${translate('common.from')} ${
              localState.selectedInvitation?.fromEmail
            } ${translate('common.to')} ${
              localState.selectedInvitation?.toEmail
            }`}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={onDeleteInvitation}>
                {`${translate('common.delete')}`}
              </Button>
            }
          />
        ) : null}
      </FormProvider>
    </Dialog>
  );
}
