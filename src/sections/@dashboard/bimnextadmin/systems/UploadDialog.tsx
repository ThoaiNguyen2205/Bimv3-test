// react
import { useState, useCallback } from 'react';
// @mui
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  LinearProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { Upload } from '../../../../components/upload';
// apis
import uploadsApi from 'src/api/uploadsApi';

// ----------------------------------------------------------------------

type ILocalState = {
  file: File | string | null;
  isSubmitting: boolean;
  progressShow: boolean;
  progress: number;
}

interface Props extends DialogProps {
  onClose: VoidFunction;
}

export default function UploadDialog({ onClose, ...other }: Props) {

  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    file: null,
    isSubmitting: false,
    progressShow: false,
    progress: 0,
  });

  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setLocalState((prevState: ILocalState) => ({ 
        ...prevState,
        file: Object.assign(newFile, {
          preview: URL.createObjectURL(newFile),
        }) 
      }));
    }
  }, []);

  const onCancel = () => {
    onClose();
  };

  const onUploadAndClose = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, progressShow: true }));
      
    const formData = new FormData(); 
    formData.append("image", localState.file as File);
    const onUploadProgress = (e: any) => {
      setLocalState((prevState: ILocalState) => ({ ...prevState, progress: Math.round((100 * e.loaded) / e.total) }));
    };
    await uploadsApi.uploadImage(formData, onUploadProgress);

    setLocalState((prevState: ILocalState) => ({ ...prevState, progressShow: false, file: null }));
    onClose();
  }

  return (
    <Dialog onClose={onClose} {...other} >

      <DialogTitle> {`${translate('common.upload')}`} </DialogTitle>

      <DialogContent>
        <Card>
          <CardHeader title="Upload Single File" />
          <CardContent>
            <Upload file={localState.file} onDrop={handleDropSingleFile} onDelete={() => setLocalState((prevState: ILocalState) => ({ 
              ...prevState,
              file: null,
            }))} />
            {localState.progressShow ? <LinearProgress variant="determinate" value={localState.progress} color="success" /> : null}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button color="warning" variant="outlined" onClick={onCancel} startIcon={<Iconify icon='zondicons:close-outline'/>}>
          {`${translate('common.close')}`}
        </Button>
        <LoadingButton type="submit" variant="contained" loading={localState.isSubmitting} startIcon={<Iconify icon='solar:upload-linear'/>} onClick={onUploadAndClose}>
          {`${translate('common.upload')}`}
        </LoadingButton>
      </DialogActions>
        
    </Dialog>
  );
}
