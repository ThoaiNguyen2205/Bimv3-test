import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// zustand store
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect } from '../../../components/hook-form';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

type FormValuesProps = {
  viewable01_Id: string,
  viewable02_Id: string,
  afterSubmit: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  viewables01: any[];
  viewables02: any[];
  initForgeViewerCad: (isComapre: boolean, sheet01: any | null, sheet02: any | null) => void;
  onClose: VoidFunction;
  onCancel: VoidFunction;
}

export default function CompareCadViewable({ open, viewables01, viewables02, initForgeViewerCad, onClose, onCancel, ...other }: Props) {
  const { translate } = useLocales();

  const {
    firstObject,
    firstSubObject,
  } = useForgeViewState(
    (state) => ({
      firstObject: state.firstObject,
      firstSubObject: state.firstSubObject,
    }),
    shallow
  );
  
  const newTaskSchema = Yup.object().shape({
    viewable01_Id: Yup.string().required(translate('task.name_required')),
    viewable02_Id: Yup.string().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    viewable01_Id: (viewables01.length > 0) ? viewables01[0].data.viewableID : '',
    viewable02_Id: (viewables02.length > 0) ? viewables02[0].data.viewableID : '',
  }), [viewables01]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newTaskSchema),
    defaultValues,
  });

  const {
    reset,
    // control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (viewables01.length > 0 && viewables02.length > 0) {
      setValue('viewable01_Id', viewables01[0].data.viewableID);
      setValue('viewable02_Id', viewables02[0].data.viewableID);
    }
  }, [viewables01, viewables02]);

  const onSubmit = async (data: FormValuesProps) => {
    const filter01 = viewables01.filter((e) => e.data.viewableID === data.viewable01_Id);
    const filter02 = viewables02.filter((e) => e.data.viewableID === data.viewable02_Id);
    if (filter01.length > 0 && filter02.length > 0) {
      initForgeViewerCad(true, filter01[0], filter02[0]);
    }
    onClose();
    reset();
  };

  const onCancelCompare = () => {
    onCancel();
    onClose();
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {`${translate('coordinator.select_compare_viewable')}`} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack spacing={2.5}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            sx={{ mt: 3 }}
          >
            <RHFSelect
              name='viewable01_Id'
              size="small"
              label={firstObject ? `${firstObject.version}.${firstObject.subVersion}` : ''}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 300 } }}
            >
              {viewables01 && viewables01.map((sheet) => (
                <MenuItem
                  key={sheet.id}
                  value={sheet.data.viewableID}
                >
                  {sheet.data.viewableID}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name='viewable02_Id'
              size="small"
              label={firstSubObject ? `${firstSubObject.version}.${firstSubObject.subVersion}` : ''}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 300 } }}
            >
              {viewables02 && viewables02.map((sheet) => (
                <MenuItem
                  key={sheet.id}
                  value={sheet.data.viewableID}
                >
                  {sheet.data.viewableID}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
          
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancelCompare} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon="bxs:edit" />}>
            {`${translate('common.compare')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>
    </Dialog>
  );
}