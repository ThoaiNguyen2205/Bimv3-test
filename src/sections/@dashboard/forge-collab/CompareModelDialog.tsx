import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// zustand store
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCheckbox, RHFSelect } from '../../../components/hook-form';
import { useLocales } from 'src/locales';
import { IForgeObject, IForgeObjectData } from 'src/shared/types/forgeObject';
import forgesApi from 'src/api/forgesApi';

// ----------------------------------------------------------------------
type ILocalState = {
  selectedAData: IForgeObjectData | null,
  selectedBData: IForgeObjectData | null,
  modelA: IForgeObject | null,
  modelB: IForgeObject | null,
  sheetsA: any[],
  sheetsB: any[],
  show2D: boolean,
  is2D: boolean,
  sheetA: string,
  sheetB: string,
}

type FormValuesProps = {
  // viewable01_Id: string;
  // viewable02_Id: string;
  afterSubmit: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  onCancel: VoidFunction;
}

export default function CompareModelDialog({
  open, 
  onClose,
  onCancel, 
  ...other
}: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    selectedAData: null,
    selectedBData: null,
    modelA: null,
    modelB: null,
    sheetsA: [],
    sheetsB: [],
    show2D: false,
    is2D: false,
    sheetA: '',
    sheetB: '',
  });

  const {
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    previewUrn,
    setPreviewUrn,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
    markupSettings,
    setMarkupSettings,
    filterProperty,
    setFilterProperty,
    filterKey,
    setFilterKey,
    is2D,
    setIs2d,
    sheetA,
    setSheetA,
    sheetB,
    setSheetB,
  } = useForgeViewState(
    (state) => ({
      isSplit: state.isSplit,
      setIsSplit: state.setIsSplit,
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      subLoading: state.subLoading,
      setSubLoading: state.setSubLoading,
      previewUrn: state.previewUrn,
      setPreviewUrn: state.setPreviewUrn,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      firstSubObject: state.firstSubObject,
      setFirstSubObject: state.setFirstSubObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
      forgeViewer: state.forgeViewer,
      setForgeViewer: state.setForgeViewer,
      subViewer: state.subViewer,
      setSubViewer: state.setSubViewer,
      markupSettings: state.markupSettings,
      setMarkupSettings: state.setMarkupSettings,
      filterProperty: state.filterProperty,
      setFilterProperty: state.setFilterProperty,
      filterKey: state.filterKey,
      setFilterKey: state.setFilterKey,
      is2D: state.is2D,
      setIs2d: state.setIs2d,
      sheetA: state.sheetA,
      setSheetA: state.setSheetA,
      sheetB: state.sheetB,
      setSheetB: state.setSheetB,
    }),
    shallow
  );
  
  const newTaskSchema = Yup.object().shape({
    // viewable01_Id: Yup.string().required(translate('task.name_required')),
    // viewable02_Id: Yup.string().required(translate('task.description_required')),
  });

  const defaultValues = useMemo(() => ({
    // viewable01_Id: (viewables01.length > 0) ? viewables01[0].data.viewableID : '',
    // viewable02_Id: (viewables02.length > 0) ? viewables02[0].data.viewableID : '',
  }), []);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newTaskSchema),
    defaultValues,
  });

  const {
    reset,
    // control,
    setValue,
    getFieldState,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onDataChange = async (e: React.ChangeEvent<HTMLInputElement>, model: string) => {
    const newValue = e.target.value;
    const filter = forgeObjectData.filter((e) => e.forgeObject._id === newValue);
    if (filter.length > 0) {
      const metadata = await forgesApi.getMetadata(filter[0].forgeObject.urn);
      let check2D = false;
      for (const meta of metadata.data.metadata) {
        if (meta.role === '2d') {
          check2D = true;
        }
      }

      let anotherData: IForgeObjectData | null = null;
      if (model === 'modela') {
        anotherData = localState.selectedBData;
      } else {
        anotherData = localState.selectedAData;
      }

      let check2D_another = false;
      if (anotherData !== null) {
        const another_metadata = await forgesApi.getMetadata(anotherData.forgeObject.urn);
        for (const meta of another_metadata.data.metadata) {
          if (meta.role === '2d') {
            check2D_another = true;
          }
        }
      }

      if (check2D && check2D_another) {
        check2D = true;
      } else {
        check2D = false;
      }

      if (model === 'modela') {
        if (check2D) {
          const sheetList = metadata.data.metadata.filter((e: any) => e.role === '2d');
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            sheetA: sheetList[0].guid,
            sheetsA: sheetList,
          }));
        }
  
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          selectedAData: filter[0],
          modelA: filter[0].history[0],
          show2D: check2D,
        }));
      }

      if (model === 'modelb') {
        if (check2D) {
          const sheetList = metadata.data.metadata.filter((e: any) => e.role === '2d');
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            sheetB: sheetList[0].guid,
            sheetsB: sheetList,
          }));
        }
  
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          selectedBData: filter[0],
          modelB: filter[0].history[0],
          show2D: check2D,
        }));
      }

      
      if (!check2D) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          is2D: check2D,
        }));
      }
    }
  }

  const onModelChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, model: string) => {
    const newValue = e.target.value;
    if (localState.selectedAData !== null && model === 'modela') {
      const filter = localState.selectedAData?.history.filter((e) => e._id === newValue);
      if (filter.length > 0) {
        const metadata = await forgesApi.getMetadata(filter[0].urn);
        let check2D = false;
        for (const meta of metadata.data.metadata) {
          if (meta.role === '2d') {
            check2D = true;
          }
        }
        const sheets = metadata.data.metadata.filter((e: any) => e.role === '2d');
        
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          show2D: check2D,
          modelA: filter[0],
          sheetsA: sheets,
        }));
      }
    }
    if (localState.selectedBData !== null && model === 'modelb') {
      const filter = localState.selectedBData?.history.filter((e) => e._id === newValue);
      if (filter.length > 0) {
        const metadata = await forgesApi.getMetadata(filter[0].urn);
        let check2D = false;
        for (const meta of metadata.data.metadata) {
          if (meta.role === '2d') {
            check2D = true;
          }
        }
        const sheets = metadata.data.metadata.filter((e: any) => e.role === '2d');
        
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          show2D: check2D,
          modelB: filter[0],
          sheetsB: sheets,
        }));
      }
    }
  }

  const onSheetChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, model: string) => {
    const newValue = e.target.value;
    
    if (localState.sheetsA.length > 0 && model === 'modela') {
      const filter = localState.sheetsA.filter((e) => e.guid === newValue);
      if (filter.length > 0) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          sheetA: filter[0].guid,
        }));
      }
    }
    if (localState.sheetsB.length > 0 && model === 'modelb') {
      const filter = localState.sheetsB.filter((e) => e.guid === newValue);
      if (filter.length > 0) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          sheetB: filter[0].guid,
        }));
      }
    }
  }

  const on2DChange = async (event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
    if (localState.selectedAData !== null && localState.selectedBData !== null) {
      const metadataA = await forgesApi.getMetadata(localState.selectedAData.forgeObject.urn);
      let check2D = false;
      for (const meta of metadataA.data.metadata) {
        if (meta.role === '2d') {
          check2D = true;
        }
      }

      const metadataB = await forgesApi.getMetadata(localState.selectedBData.forgeObject.urn);
      for (const meta of metadataB.data.metadata) {
        if (meta.role === '2d') {
          check2D = true;
        }
      }
      
      if (!check2D) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          is2D: false,
        }));
      } else {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          is2D: checked,
        }));
      }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (forgeObjectData.length > 0) {
        const metadata = await forgesApi.getMetadata(forgeObjectData[0].forgeObject.urn);
        let check2D = false;
        for (const meta of metadata.data.metadata) {
          if (meta.role === '2d') {
            check2D = true;
          }
        }

        if (check2D) {
          const sheetList = metadata.data.metadata.filter((e: any) => e.role === '2d');
          setLocalState((prevState: ILocalState) => ({
            ...prevState,
            sheetA: sheetList[0].guid,
            sheetB: sheetList[0].guid,
            sheetsA: sheetList,
            sheetsB: sheetList,
          }));
        }

        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          selectedAData: forgeObjectData[0],
          selectedBData: forgeObjectData[0],
          modelA: forgeObjectData[0].history[0],
          modelB: forgeObjectData[0].history[0],
          show2D: check2D,
        }));
      }
    }
    loadData();
  }, [forgeObjectData]);

  const onSubmit = async (data: FormValuesProps) => {   
    setFirstObject(localState.modelA);
    setFirstSubObject(localState.modelB);
    setSheetA(localState.sheetA);
    setSheetB(localState.sheetB);
    setIs2d(localState.is2D);
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
              name='modela'
              size="small"
              label={`${translate('coordinator.model')} A`}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 400 } }}
              onChange={(e: any) => onDataChange(e, 'modela')}
              value={localState.selectedAData?.forgeObject._id}
            >
              {forgeObjectData && forgeObjectData.map((forgeObj) => (
                <MenuItem
                  key={forgeObj.forgeObject._id}
                  value={forgeObj.forgeObject._id}
                >
                  {forgeObj.forgeObject.displayName}
                </MenuItem>
              ))}
            </RHFSelect>
            
            <RHFSelect
              name='modelb'
              size="small"
              label={`${translate('coordinator.model')} B`}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 400 } }}
              onChange={(e: any) => onDataChange(e, 'modelb')}
              value={localState.selectedBData?.forgeObject._id}
            >
              {forgeObjectData && forgeObjectData.map((forgeObj) => (
                <MenuItem
                  key={forgeObj.forgeObject._id}
                  value={forgeObj.forgeObject._id}
                >
                  {forgeObj.forgeObject.displayName}
                </MenuItem>
              ))}
            </RHFSelect>
            
          </Stack>

          <Stack spacing={2.5}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            sx={{ mt: 3 }}
          >
            <RHFSelect
              name='versiona'
              size="small"
              label={`${translate('coordinator.version')} A`}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 300 } }}
              onChange={(e) => onModelChange(e, 'modela')}
              value={localState.modelA?._id}
            >
              {localState.selectedAData?.history && localState.selectedAData?.history.map((his) => (
                <MenuItem
                  key={his._id}
                  value={his._id}
                >
                  {`${his.version}.${his.subVersion}`}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name='versionb'
              size="small"
              label={`${translate('coordinator.version')} B`}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: { md: 300 } }}
              onChange={(e) => onModelChange(e, 'modelb')}
              value={localState.modelB?._id}
            >
              {localState.selectedBData?.history && localState.selectedBData?.history.map((his) => (
                <MenuItem
                  key={his._id}
                  value={his._id}
                >
                  {`${his.version}.${his.subVersion}`}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>

          <Stack spacing={2.5}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            justifyContent="space-between"
            sx={{ mt: 3 }}
          >
            {localState.show2D ? 
              <Box>
                <Typography variant='caption'>2D sheets</Typography>
                <Checkbox
                  name="is2D"
                  value={localState.is2D}
                  onChange={on2DChange}
                />
              </Box>
              : null
            }
          </Stack>

          {localState.is2D ? 
            <Stack spacing={2.5}
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-end', md: 'center' }}
              justifyContent="space-between"
              sx={{ mt: 3 }}
            >
              <RHFSelect
                name='viewable01_Id'
                size="small"
                label={`${translate('coordinator.sheet')} A`}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 300 } }}
                value={localState.sheetA}
                onChange={(e) => onSheetChange(e, 'modela')}
              >
                {localState.sheetsA && localState.sheetsA.map((sheet) => (
                  <MenuItem
                    key={sheet.guid}
                    value={sheet.guid}
                  >
                    {`${sheet.name}`}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                name='viewable02_Id'
                size="small"
                label={`${translate('coordinator.sheet')} B`}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 300 } }}
                value={localState.sheetB}
                onChange={(e) => onSheetChange(e, 'modelb')}
              >
                {localState.sheetsB && localState.sheetsB.map((sheet) => (
                  <MenuItem
                    key={sheet.guid}
                    value={sheet.guid}
                  >
                    {`${sheet.name}`}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
            : null
          }
          
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