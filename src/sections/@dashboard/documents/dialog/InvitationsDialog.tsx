// react
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
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
import { useSnackbar } from '../../../../components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFSwitch
} from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';
import InvitationItem from '../InvitationItem';
import ConfirmDialog from '../../../../components/confirm-dialog';
// locales
import { useLocales } from '../../../../locales';
// AuthContext
import { useAuthContext } from '../../../../auth/useAuthContext';
// apis
import docInvitationsApi from '../../../../api/docInvitationsApi';
// type
import {
  IDocInvitation,
  IDocInvitationReqCreate,
  IDocInvitationResGetAll
} from '../../../../shared/types/docInvitation';
import { IBimDocument } from '../../../../shared/types/bimDocument';
import { useRouter } from 'next/router';
import useCopyToClipboard from 'src/hooks/useCopyToClipboard';
import { PATH_BLOG } from 'src/routes/paths';


// ----------------------------------------------------------------------

type LocalState = {
  invitations: Array<IDocInvitation>;
  selectedInvitation: IDocInvitation | null;
  openConfirm: boolean;
};

// ----------------------------------------------------------------------
type FormValuesProps = {
  email: string;
  comment: boolean;
  edit: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  document: IBimDocument | null;
}

export default function InvitationsDialog({
  open,
  onClose,
  document,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  // const router = useRouter();
  // const { copy } = useCopyToClipboard();
  // const host = window.location.host;
  // console.log(process.env.REACT_APP_URL);
  
  // const linkShare = `${process.env.REACT_APP_URL}${PATH_BLOG.view(blog?._id as string)}`;
  // const [localState, setLocalState] = useState<LocalState>({
  //   invitations: [],
  //   selectedInvitation: null,
  //   openConfirm: false,
  //   openTooltip: false
  // });

  // const loadInvitations = useCallback(async () => {
  //   if (document === null) return;

  //   const param = {
  //     documentId: '655ad3a875b725e905832717',
  //     fromEmail: user?.email
  //   };
  //   const invitationsResponse: IDocInvitationResGetAll =
  //     await docInvitationsApi.getInvitations(param);
  //   const invitations: Array<IDocInvitation> = invitationsResponse.data;

  //   setLocalState((prevState: LocalState) => ({
  //     ...prevState,
  //     invitations: invitations
  //   }));
  // }, [document]);

  // useEffect(() => {
  //   loadInvitations();
  // }, [document]);

  const addEmailSchema = Yup.object().shape({
    email: Yup.string()
      .email(`${translate('auth.valid_email')}`)
      .max(255)
      .required(`${translate('auth.required_email')}`)
  });
  const defaultValues = useMemo(
    () => ({
      email: '',
      comment: false,
      edit: false
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
  const [localState, setLocalState] = useState<LocalState>({
    invitations: [],
    selectedInvitation: null,
    openConfirm: false
  });
  /* ===========HANDLE API============= */
  //handle load invitation
  const loadInvitations = useCallback(async () => {
    if (document === null) return;
    const param = {
      documentId: document._id,
      fromEmail: user?.email
    };
    const invitationsResponse: IDocInvitationResGetAll =
      await docInvitationsApi.getInvitations(param);
    const invitations: Array<IDocInvitation> = invitationsResponse.data;

    setLocalState((prevState: LocalState) => ({
      ...prevState,
      invitations: invitations
    }));
  }, [document]);
  //handle submit
  const onSubmit = async (data: FormValuesProps) => {
    if (document === null) {
      return;
    }

    const newInvitationReq: IDocInvitationReqCreate = {
      document: document._id,
      fromEmail: user?.email,
      toEmail: data.email,
      isComment: data.comment,
      isEdit: data.edit
    };

    // Loại trường hợp trùng email người nhận
    const param = {
      documentId: document._id,
      toEmail: data.email
    };
    const checkToMailExisting = await docInvitationsApi.getInvitations(param);
    if (checkToMailExisting.data.length > 0) {
      enqueueSnackbar(`${translate('common.duplicated_invitation')}`, {
        variant: 'warning'
      });
      return;
    }

    const newInvitation = await docInvitationsApi.postCreate(newInvitationReq);
    if (newInvitation) {
      // loadInvitations();
      setValue('email', '');
      setValue('comment', false);
      setValue('edit', false);
    }
    loadInvitations();
  };
  //handle delete invitation
  const onDeleteInvitation = async () => {
    if (localState.selectedInvitation) {
      const deleteInvitation = await docInvitationsApi.deleteById(
        localState.selectedInvitation._id
      );
      if (deleteInvitation) {
        // loadInvitations();
        handleCloseConfirm();
        setLocalState((prevState: LocalState) => ({
          ...prevState,
          selectedInvitation: null
        }));
        setValue('email', '');
      }
    }
    loadInvitations();
  };
  /*===========HANDLE LOCAL=========== */

  //handle confirm invitation
  const handleOpenConfirm = (id: string) => {
    const selectedInvitationId = id;
    const selectedInvitation = localState.invitations.filter(
      (value) => value._id === selectedInvitationId
    )[0];
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      selectedInvitation: selectedInvitation,
      openConfirm: true
    }));
  };

  const handleCloseConfirm = () => {
    setLocalState((prevState: LocalState) => ({
      ...prevState,

      openConfirm: false
    }));
  };
  // handle render invitations
  useEffect(() => {
    loadInvitations();
  }, [document]);
  return (
    <Dialog
      className="invitations-dialog"
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle className="invitations-dialog__title">
          {`${translate('documents.share')} ${document?.title}`}{' '}
        </DialogTitle>

        <DialogContent
          sx={{ overflow: 'unset' }}
          className="invitations-dialog__content">
          <Stack className="invitations-dialog__content-input">
            <RHFTextField
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

          <Stack className="content__settings">
            <RHFSwitch
              className="content__settings-comment"
              name="comment"
              label={`${translate('documents.can_comment')}`}
              labelPlacement="start"
            />
            <RHFSwitch
              className="content__settings-edit"
              name="edit"
              label={`${translate('documents.can_edit')}`}
              labelPlacement="start"
            />
          </Stack>

          <Stack className="content__submit">
            <Box className="content__submit-flexGrow" />
            <LoadingButton
              className="content__submit-button"
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="tabler:send" />}
              loading={isSubmitting}>
              {`${translate('common.send')}`}
            </LoadingButton>
          </Stack>

          {localState.invitations.length > 0 && (
            <Scrollbar className="content__scrollbar">
              <List disablePadding className="content__scrollbar-list">
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

        <DialogActions className="invitations-dialog__action">
          <Box className="invitations-dialog__action-button" />
          {onClose && (
            <Button
              className="button__close"
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
            open={localState.openConfirm}
            onClose={handleCloseConfirm}
            title={`${translate('invitations.invitation')} ${translate(
              'common.of'
            )} ${document?.title}`}
            content={`${translate('common.delete_confirm')} ${translate(
              'invitations.invitation'
            )} ${translate('common.to')} ${
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
