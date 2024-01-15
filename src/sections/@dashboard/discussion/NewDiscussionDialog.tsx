import { useState, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Alert,
  InputAdornment, 
  Stack,
  Button,
  Dialog,
  IconButton,
  Typography,
  DialogTitle,
  DialogProps,
  DialogActions,
  DialogContent,
  TextField,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useLocales } from '../../../locales';
// apis
import mainTasksApi from '../../../api/mainTasksApi';
// zustand store
import useTask from '../../../redux/taskStore';
import useFolder from '../../../redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useSnackbar } from '../../../components/snackbar';
// enums
import { TaskCategory, UserClassEnum } from '../../../shared/enums';
// type
import { IDiscussionTask, IMainTask, IMainTaskReqCreate, IMainTaskResGetAll } from '../../../shared/types/mainTask';
// sections
import SelectFolderDialog from './SelectFolderDialog';
import { IFolder } from '../../../shared/types/folder';
import { IGroup } from '../../../shared/types/group';
import foldersApi from '../../../api/foldersApi';
import Editor from '../../../components/editor';
import { IFile } from '../../../shared/types/file';
import useEmbed from '../../../redux/embedStore';
import useFile from '../../../redux/filesStore';
import SelectFilesDialog from './editor/SelectFilesDialog';
import SelectImagesDialog from './editor/SelectImagesDialog';
import InsertEmbedDialog from './editor/InsertEmbedDialog';
import filesApi from '../../../api/filesApi';
import discussionsApi from 'src/api/discussionsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  displayColorPicker: boolean;
  pickedColor: string;
  displaySelectFolder: boolean;
  message: string;
  openAttach: boolean,
  openImage: boolean,
  openEmbed: boolean,
  isSubmitting: boolean,
}

// ----------------------------------------------------------------------

type FormValuesProps = {
  name: string,
  description: string,
  note: string,
  afterSubmit: boolean,
};

interface Props extends DialogProps {
  open: boolean;
  title: string;
  category: TaskCategory;
  isEdit: boolean;
  onClose: VoidFunction;
}

export default function NewDiscussionDialog({ open, title, category, isEdit, onClose, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const {
    selectedFolder,
    setSelectedFolder,
    destination,
    setDestination,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
      setSelectedFolder: state.setSelectedData,
      destination: state.destination,
      setDestination: state.setDestination,
    }),
    shallow
  );

  const { 
    // setTasks,
    // selectedTask,
    // setSelectedTask,
    discussionTask,
    setDiscussionTask,
    setDiscussionTasks,
  } = useTask(
    (state) => ({ 
      // setTasks: state.setDatas,
      // selectedTask: state.selectedData,
      // setSelectedTask: state.setSelectedData,
      discussionTask: state.discussionTask,
      setDiscussionTask: state.setDiscussionTask,
      setDiscussionTasks: state.setDiscussionTasks,
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

  const newTaskSchema = Yup.object().shape({
    name: Yup.string().required(translate('task.name_required')),
  });

  const defaultValues = useMemo(() => ({
    name: discussionTask?.mainTask.name || '',
    description: discussionTask?.mainTask.description || '',
    note: discussionTask?.mainTask.note || '',
    logo: discussionTask?.mainTask.logo || 'discussion.jpg',
  }), [discussionTask]);

  const [localState, setLocalState] = useState<ILocalState>({
    displayColorPicker: false,
    pickedColor: discussionTask?.mainTask.color || '#00AB55',
    displaySelectFolder: false,
    message: '',
    openAttach: false,
    openImage: false,
    openEmbed: false,
    isSubmitting: false,
  });

  const handleShowSelectFolder = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, displaySelectFolder: true }));
  }

  const handleCloseSelectFolder = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, displaySelectFolder: false }));
  }

  useEffect(() => {
    setSelectedFolder(null);
    const loadFolderAndAttachFiles = async () => {
      setSelectedFolder(discussionTask?.mainTask.folder as IFolder);
      const strPath = await foldersApi.getFolderListById((discussionTask?.mainTask.folder as IFolder)._id);
      setDestination(strPath);

      if (discussionTask !== null && discussionTask !== undefined) {
        const mess = discussionTask.mainTask.description;
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
          pickedColor: discussionTask?.mainTask.color,
          logoUrl: `${process.env.REACT_APP_APIFILE}images/${discussionTask?.mainTask.logo}`,
          message: messOnly,
        }));
        setSelectedFiles(attachFiles);
      }
    }
    if (isEdit && discussionTask) {
      reset(defaultValues);
      // Tải Folder và destination
      loadFolderAndAttachFiles();
    }
    if (!isEdit) {
      reset(defaultValues);
    }    
  }, [isEdit, discussionTask]);

  const handleResetFormData = () => {
    setDiscussionTask(null);
    setSelectedFolder(null);
    setDestination('');
    isEdit = false;
  }

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(newTaskSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const loadAllTasks = async () => {
    if (user?.customer !== null) {
      let uRole = user?.class.uclass;
      if (user?.projectrole === UserClassEnum.Admin) {
        uRole = user?.projectrole;
      }
      const params = { 
        project: user?.project._id,
        category: category,
      };
      const apiRes: IDiscussionTask[] = await discussionsApi.getAllDiscussionTasks(params, user?.id, uRole, user?.customer._id) as IDiscussionTask[];
      setDiscussionTasks(apiRes);
    }
  };

  const onSubmit = async (data: FormValuesProps) => {
    let logo = 'discussion.jpg';

    if (selectedFolder === null) {
      enqueueSnackbar(`${translate('task.folder_required')}`, { variant: 'error' });
      return;
    }

    let newContent = localState.message;
    if (selectedFiles.length > 0) {
      for (const fi of selectedFiles) {
        newContent += `<br/> <span class="attach-icon"></span> <a class="attachfile" target="_blank" href=${process.env.REACT_APP_APIURL + '/files/download/' + fi._id} rel="noopener noreferrer"><i>${fi.displayName}<i/><a/>`
      }
    }
    
    const newRequestTaskData: IMainTaskReqCreate = {
      project: user?.project._id,
      name: data.name,
      description: newContent,
      note: data.note,
      color: localState.pickedColor,
      category: category,
      folder: (selectedFolder as IFolder)._id,
      logo: logo,
      createdBy: user?.id,
      createdGroup: (user?.group as IGroup)._id,
      updatedName: user?.username,
      updatedId: user?.id,
    }

    if (isEdit === true) {
      const updateTask = await mainTasksApi.updateById((discussionTask?.mainTask as IMainTask)._id, newRequestTaskData);
    } else {
      const newTask = await mainTasksApi.postCreate(newRequestTaskData);
    }

    loadAllTasks();
    handleResetFormData();
    onClose();
    reset();
    
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
    reset();
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

  const handleImageDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openImage: value,
    }));
  }

  const handleEmbedDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openEmbed: value,
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
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle> {title} </DialogTitle>

        <DialogContent sx={{ height: 1 }}>
          {!!errors.afterSubmit && <Alert severity="error" >{errors.afterSubmit.message}</Alert>}

          <Stack direction = {{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <RHFTextField
              size='small'
              name="name"
              label={`${translate('documents.title')}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:rename-box" width={24} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

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
            <TextField
              fullWidth
              disabled
              size='small'
              label={`${translate('task.connective_folder')}`}
              value={destination}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="flat-color-icons:folder" width={24} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '60%' }}
            />
            <Button color="primary" variant="contained" onClick={handleShowSelectFolder} startIcon={<Iconify icon="mdi:folder-key" />} >
              {`${translate('task.select')}`}
            </Button>
            <Tooltip title={`${translate('discussion.attach')}`} placement='top'>
              <Button
                color="primary"
                variant="soft"
                onClick={() => handleAttachDialog(true)}
              >
                <Iconify icon="mi:attachment" />
              </Button>
            </Tooltip>
            <Tooltip title={`${translate('discussion.insert_image')}`} placement='top'>
              <Button
                color="primary"
                variant="soft"
                onClick={() => handleImageDialog(true)}
              >
                <Iconify icon="ion:image-outline" />
              </Button>
            </Tooltip>
            <Tooltip title={`${translate('discussion.embed')}`} placement='top'>
              <Button
                color="primary"
                variant="soft"
                onClick={() => handleEmbedDialog(true)}
              >
                <Iconify icon="icomoon-free:embed" />
              </Button>
            </Tooltip>
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} startIcon={<Iconify icon="bxs:edit" />}>
            {isEdit ? `${translate('common.modify')}` : `${translate('common.add')}`}
          </LoadingButton>
        </DialogActions>
        
      </FormProvider>

      <SelectFolderDialog open={localState.displaySelectFolder} onClose={handleCloseSelectFolder} />

      <SelectFilesDialog
        linkFolderId={selectedFolder ? selectedFolder._id : ''}
        open={localState.openAttach}
        onClose={() => handleAttachDialog(false)}
      />

      <SelectImagesDialog
        linkFolderId={selectedFolder ? selectedFolder._id : ''}
        open={localState.openImage}
        onClose={() => handleImageDialog(false)}
      />

      <InsertEmbedDialog
        open={localState.openEmbed}
        onClose={() => handleEmbedDialog(false)}
      />
    </Dialog>
  );
}
