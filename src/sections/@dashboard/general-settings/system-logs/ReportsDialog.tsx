// react
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
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
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import ConfirmDialog from 'src/components/confirm-dialog';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import logsApi from 'src/api/logsApi';
// type
import { ISystemLog } from 'src/shared/types/systemlog';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  // logsList: ISystemLog[];
  onClose: VoidFunction;
};

export default function ReportsDialog({
  open,
  // logsList,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>

      <DialogTitle> {`${translate('common.exports')}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>

          <Box sx={{ flexGrow: 1 }} />

        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onClose && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="mdi:exit-to-app" />} onClick={onClose}>
            {`${translate('common.close')}`}
          </Button>
        )}
      </DialogActions>

    </Dialog>
  );
}
