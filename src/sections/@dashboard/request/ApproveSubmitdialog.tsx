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
  FormControlLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// type
import { IGroup } from '../../../shared/types/group';
import { IFile, IFileReqCreate } from '../../../shared/types/file';
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
import Markdown from 'src/components/markdown/Markdown';
import { DeleteData } from 'src/shared/types/deleteData';
import { IRequest } from 'src/shared/types/request';
import requestsApi from 'src/api/requestsApi';
import { IFolder } from 'src/shared/types/folder';
import { LogType } from 'src/shared/enums';
import { PATH_DASHBOARD } from 'src/routes/paths';
import logsApi from 'src/api/logsApi';

// ----------------------------------------------------------------------

type ILocalState = {
  isSubmitting: boolean,
  copy: boolean,
  moveFiles: boolean,
  submitToFather: boolean,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function ApproveSubmitdialog({ open, onClose, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    selectedRequest,
    selectedRequestContent,
  } = useRequest(
    (state) => ({
      selectedRequest: state.selectedData,
      selectedRequestContent: state.selectedRequestContent,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isSubmitting: false,
    copy: false,
    moveFiles: false,
    submitToFather: false,
  });
  
  const onChangeSubmiTotFather = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      submitToFather: event.target.checked,
    }));
  }

  const onChangeMoveFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      moveFiles: event.target.checked,
    }));
  }

  const onChangeCopy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      copy: event.target.checked,
    }));
  }

  const movingFile = async (file: IFile, destination: IFolder, isCopy: boolean): Promise<IFile> => {
    // Copy file gốc
    const desPath = destination.path + destination.storeName + '/';
    // copy physical file
    const copyFileObj = {
      originFile: (file.folder as IFolder).path + (file.folder as IFolder).storeName + '/' + file.storeFile,
      destinationFile: desPath + file.storeFile
    }
    await filesApi.postCopyFile(copyFileObj);
    // Trường hợp file đã convert copy file convert
    if (file.convertFile !== undefined && file.convertFile !== null) {
      if (file.convertFile.includes('.pdf')) {
        const copyConvertFileObj = {
          originFile: file.fullPath + file.convertFile,
          destinationFile: desPath + file.convertFile
        }
        await filesApi.postCopyFile(copyConvertFileObj);
      }
    }
    
    // create file data
    const param = {
      folder: destination._id,
      displayName: file.displayName,
    }
    const sameFiles = await filesApi.getAllSameFiles(param);           
    let subver = '01';
    if (sameFiles.length > 0) {
      const newest = sameFiles[0];
      const newsub = parseInt(newest.subVersion) + 1;
      if (newsub < 10) {
        subver = '0' + newsub.toString();
      } else {
        subver = newsub.toString();
      }
    }
    const newFile: IFileReqCreate = {
      project: user?.project._id,
      folder: destination._id,
      displayName: file.displayName,
      storeFile: file.storeFile,
      size: file.size,
      version: file.version,
      subVersion: subver,
      convertFile: file.convertFile,
      thumbnail: file.thumbnail,
      updatedBy: user?.id,
    }
    const newFileResponse = await filesApi.postCreate(newFile);
    // Nếu move: xóa file gốc
    const deleteData: DeleteData = {
      deletedByName: user?.username,
      deletedById: user?.id,
    }
    if (isCopy === false) {
      await filesApi.deleteById(file._id, deleteData);
    }

    // Ghi log
    const newLogs = {
      customer: user?.customer._id,
      father: user?.project._id,
      content: `${user?.username} di chuyển tập tin ${file.displayName} đến ${destination.displayName}.`,
      type: LogType.File,
      actionLink: PATH_DASHBOARD.cloud.filesManager,
      createdBy: user?.id,
    };
    await logsApi.postCreate(newLogs);

    return newFileResponse;
  }

  const onApprove = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true,
    }));

    if (selectedRequestContent !== null) {
      
      // Duyệt nội dung trình nộp
      const deleteData: DeleteData = {
        deletedByName: user?.username,
        deletedById: user?.id,
      }
      const approvedRes = await requestContentsApi.approveById(selectedRequestContent._id, deleteData);
      
      // Tách mess và files
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

      if (approvedRes.isApproved !== undefined && approvedRes.isApproved !== null) {
        // Duyệt các tập tin trong trình nộp
        for (const fi of attachFiles) {
          await filesApi.approveById(fi._id, deleteData);
        }
      } else {
        // Hủy Duyệt các tập tin trong trình nộp
        for (const fi of attachFiles) {
          await filesApi.cancelApproveById(fi._id, deleteData);
        }
      }
      
      let newFiles: IFile[] = attachFiles;

      // Move files:
      if (localState.moveFiles === true) {
        newFiles = [];
        // Kiểm tra father
        const father = (selectedRequestContent.request as IRequest).father;
        if (father === '') {
          return;
        }

        const fatherRes = await requestsApi.getReadById(father);
        if (fatherRes) {
          const destinationFolder = fatherRes.folder as IFolder;
          for (const fi of attachFiles) {
            const newFile = await movingFile(fi, destinationFolder, localState.copy);
            newFiles.push(newFile);
          }
        }
      }

      if (localState.submitToFather === true) {
        let newContent = messOnly;
        if (newFiles.length > 0) {
          for (const fi of newFiles) {
            newContent += `<br/> <span class="attach-icon"></span> <a class="attachfile" target="_blank" href=${process.env.REACT_APP_APIURL + '/files/download/' + fi._id} rel="noopener noreferrer"><i>${fi.displayName}<i/><a/>`
          }
        }

        const newRequestContentData: IRequestContentReqCreate = {
          request: selectedRequest?.father,
          content: newContent,
          createdBy: user?.id,
          createdGroup: (user?.group as IGroup)._id,
        }
    
        await requestContentsApi.postCreate(newRequestContentData);
      }
    }

    onClose();
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
  };

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: false,
    }));
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('common.approve')}`} </DialogTitle>

      <DialogContent sx={{ height: 1 }}>
        {(selectedRequestContent?.isConfimed !== undefined && selectedRequestContent.isConfimed !== null) ?
          <Stack
            justifyContent="center"
            sx={{ position: 'absolute', top: 16, right: 40 }}
          >
            <Tooltip title={`${translate('common.confirm')}`} placement="top">
              <Iconify icon="mdi:approve" color='secondary.main' width={20} height={20} />
            </Tooltip>
          </Stack>
          : null
        }
        {(selectedRequestContent?.isApproved !== undefined && selectedRequestContent.isApproved !== null) ?
          <Stack
            justifyContent="center"
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Tooltip title={`${translate('common.approve')}`} placement="top">
              <Iconify icon="carbon:task-approved" color='error.main' width={20} height={20} />
            </Tooltip>
          </Stack>
          : null
        }
        <Stack
          spacing={1}
          direction='row'
          alignItems={{ xs: 'flex-end', md: 'right' }}
          justifyContent="space-between"
          sx={{ mt: 1, mb: 1, mr: 1 }}
          minWidth={500}
        >
          {selectedRequestContent !== null ?
            <Markdown children={selectedRequestContent?.content} />
            : null
          }
        </Stack>
        {(selectedRequest?.father !== '') ?
          <Stack
            spacing={1}
            direction='row'
            alignItems={{ xs: 'flex-end', md: 'right' }}
            justifyContent="space-between"
          >
            <FormControlLabel
              control={<Checkbox 
                checked={localState.submitToFather}
                onChange={onChangeSubmiTotFather}
              />}
              label={`${translate('request.submit_to_father')}`}
            />
            <FormControlLabel
              control={<Checkbox 
                checked={localState.moveFiles}
                onChange={onChangeMoveFiles}
              />}
              label={`${translate('request.move_submit_files')}`}
            />
            <FormControlLabel
              control={<Checkbox 
                checked={localState.copy}
                onChange={onChangeCopy}
              />}
              label={`${translate('cloud.create_copy')}`}
            />
          </Stack>
          : null
        }
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="carbon:task-approved" />}
          onClick={onApprove}
          color={(selectedRequestContent?.isApproved !== undefined && selectedRequestContent.isApproved !== null) ? 'warning' : 'primary'}
        >
          {(selectedRequestContent?.isApproved !== undefined && selectedRequestContent.isApproved !== null) ? `${translate('common.cancel')} ${translate('common.approve')}` : `${translate('common.approve')}`}
        </LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
