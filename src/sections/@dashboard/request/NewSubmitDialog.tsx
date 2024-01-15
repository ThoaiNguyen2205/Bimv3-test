import { useState, useEffect } from 'react';
// @mui
import {
  Stack,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// type
import { IGroup } from '../../../shared/types/group';
import { IFile } from '../../../shared/types/file';
import { IRequestContentReqCreate, IRequestContentResGetAll } from '../../../shared/types/requestContent';
// apis
import filesApi from '../../../api/filesApi';
import requestContentsApi from '../../../api/requestContentsApi';
// zustand store
import useRequest from '../../../redux/requestStore';
import useEmbed from '../../../redux/embedStore';
import useFile from '../../../redux/filesStore';
import { shallow } from 'zustand/shallow';
// sections
import Editor from '../../../components/editor';
import SubmitFilesDialog from './SubmitFilesDialog';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useLocales } from '../../../locales';

// ----------------------------------------------------------------------

type ILocalState = {
  message: string;
  openAttach: boolean,
  isSubmitting: boolean,
}

interface Props extends DialogProps {
  open: boolean;
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewSubmitDialog({ open, isEdit, onClose, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    selectedRequest,
    setRequestContents,
    selectedRequestContent,
  } = useRequest(
    (state) => ({
      selectedRequest: state.selectedData,
      setRequestContents: state.setRequestContents,
      selectedRequestContent: state.selectedRequestContent,
    }),
    shallow
  );

  const {
    selectedFiles,
    setSelectedFiles,
    selectedImagePath,
    setSelectedImagePath,
  } = useFile(
    (state) => ({ 
      selectedFiles: state.selectedFiles,
      setSelectedFiles: state.setSelectedFiles,
      selectedImagePath: state.selectedImagePath,
      setSelectedImagePath: state.setSelectedImagePath,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    message: '',
    openAttach: false,
    isSubmitting: false,
  });

  useEffect(() => {
    const loadFolderAndAttachFiles = async () => {
      if (isEdit === true && selectedRequestContent !== null) {
        const mess = selectedRequestContent.content;
        const firstAttachIndex = mess.indexOf('<span class="attach-icon"></span>');
        let messOnly = '';
        const attachFiles: IFile[] = [];
        if (firstAttachIndex === -1) {
          messOnly = mess;
        } else {
          messOnly = mess.slice(0, firstAttachIndex);
          const attach = mess.slice(firstAttachIndex);
          const tachDownload: string[] = attach.split('/files/download/');
          if (tachDownload.length > 1) {
            for (let i = 1; i < tachDownload.length; i++) {
              const fileTach = tachDownload[i].split(' ');
              const fileId = fileTach[0];
              const fileRes = await filesApi.getReadById(fileId);
              attachFiles.push(fileRes);
            }
          }
        }

        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          message: messOnly,
        }));
        setSelectedFiles(attachFiles);
      }
    }
    loadFolderAndAttachFiles();
  }, [isEdit, selectedRequestContent]);

  const handleResetFormData = () => {
    isEdit = false;
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      message: '',
    }));
    setSelectedFiles([]);
  }

  const loadAllSubmitContents = async () => {
    if (selectedRequest !== null) {
      const params = { 
        request: selectedRequest._id,
      };
      const apiRes: IRequestContentResGetAll = await requestContentsApi.getAllRequestContents(params) as IRequestContentResGetAll;
      setRequestContents(apiRes.data);
    }
  };

  const onSubmit = async () => {
    let newContent = localState.message;
    if (selectedFiles.length > 0) {
      for (const fi of selectedFiles) {
        newContent += `<br/> <span class="attach-icon"></span> <a class="attachfile" target="_blank" href=${process.env.REACT_APP_APIURL + '/files/download/' + fi._id} rel="noopener noreferrer"><i>${fi.displayName}<i/><a/>`
      }
    }
    
    const newRequestContentData: IRequestContentReqCreate = {
      request: selectedRequest?._id,
      content: newContent,
      createdBy: user?.id,
      createdGroup: (user?.group as IGroup)._id,
    }

    if (isEdit === true) {
      if (selectedRequestContent !== null) {
        const updateTask = await requestContentsApi.updateById(selectedRequestContent?._id, newRequestContentData);
      }
    } else {
      const newTask = await requestContentsApi.postCreate(newRequestContentData);
    }

    loadAllSubmitContents();
    handleResetFormData();
    onClose();
    
  };

  const onCancel = () => {
    handleResetFormData();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      message: '',
      isSubmitting: false,
    }));
    setSelectedFiles([]);
    onClose();
  };

  const {
    embedContent,
    setEmbedContent,
  } = useEmbed(
    (state) => ({ 
      embedContent: state.embedContent,
      setEmbedContent: state.setEmbedContent,
    }),
    shallow
  );

  const handleChangeMessage = (value: string) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, message: value }));
  };

  const onRemoveFile = (file: IFile) => {
    const fData = selectedFiles.filter(e => e._id !== file._id);
    setSelectedFiles(fData);
  }

  const handleAttachDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openAttach: value,
    }));
  }

  useEffect(() => {
    if (selectedImagePath !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        message: localState.message + `<img class="comment-img" src="${selectedImagePath}" alt="inserted image" >`,
      }));
    }
    setSelectedImagePath(null);
  }, [selectedImagePath]);

  useEffect(() => {
    if (embedContent !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        message: localState.message + embedContent,
      }));
    }
    setEmbedContent(null);
  }, [embedContent]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('request.submit')}`} </DialogTitle>

      <DialogContent sx={{ height: 1 }}>
        <Stack
          spacing={1}
          direction='row'
          alignItems={{ xs: 'flex-end', md: 'right' }}
          justifyContent="space-between"
          sx={{ mt: 1, mb: 1, mr: 1 }}
          minWidth={500}
        >
          <Editor
            simple={false}
            id="comment"
            value={localState.message}
            onChange={handleChangeMessage}
            placeholder={`${translate('discussion.type_a_message')}`}
            sx={{ flexGrow: 1, borderColor: 'transparent' }}
          />
        </Stack>

        <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <Button
            color="primary"
            variant="soft"
            startIcon={<Iconify icon="mi:attachment" />}
            onClick={() => handleAttachDialog(true)}
          >
            {`${translate('request.submit_files')}`}
          </Button>
        </Stack>

        <Scrollbar sx={{ minHeight: 60, maxHeight: 130, pt: 2 }}>
          {(selectedFiles.length > 0) ? 
            <>
              {selectedFiles && selectedFiles.reverse().map((file) => (
                <Stack
                  key={file._id}
                  spacing={1}
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'flex-start', md: 'left' }}
                >
                  <IconButton
                    color='error'
                    onClick={() => onRemoveFile(file)}
                  >
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                  <Typography color='primary' variant='subtitle2' sx={{ pt: 1 }}><i>{file.displayName}</i></Typography>
                </Stack>
              ))}
            </>
            : null
          }
        </Scrollbar>
        
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton variant="contained" loading={localState.isSubmitting} startIcon={<Iconify icon="bxs:edit" />} onClick={onSubmit}>
          {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
        </LoadingButton>
      </DialogActions>

      <SubmitFilesDialog
        open={localState.openAttach}
        onClose={() => handleAttachDialog(false)}
      />

    </Dialog>
  );
}
