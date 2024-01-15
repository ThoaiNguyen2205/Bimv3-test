import dynamic from 'next/dynamic';
// @mui
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  TreeView,
  TreeItem,
  TreeItemProps,
  treeItemClasses,
  LoadingButton
} from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import SelectFilesDialog from './SelectFilesDialog';
import SelectImagesDialog from './SelectImagesDialog';
import InsertEmbedDialog from './InsertEmbedDialog';
// locales
import { useLocales } from 'src/locales';
import { IFolder } from 'src/shared/types/folder';
import Editor from '../../../../components/editor';
import { SyntheticEvent, useEffect, useState } from 'react';
import { IFile } from 'src/shared/types/file';
import useFile from 'src/redux/filesStore';
import useEmbed from 'src/redux/embedStore';
import useDiscussion from 'src/redux/discussionStore';
import { shallow } from 'zustand/shallow';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import { IGroup } from 'src/shared/types/group';
import {
  IDiscussion,
  IDiscussionReqCreate,
  IDiscussionResGetAll
} from 'src/shared/types/discussion';
const RHFSimpleEditor = dynamic(
  () => import('src/components/hook-form/RHFSimpleEditor'),
  { ssr: false }
);
import { useAuthContext } from 'src/auth/useAuthContext';
import { LogType } from 'src/shared/enums';
import discussionsApi from 'src/api/discussionsApi';

import { Approved } from 'src/shared/enums';
// ----------------------------------------------------------------------

type ILocalState = {
  message: string;
  openAttach: boolean;
  openImage: boolean;
  openEmbed: boolean;
  attachFile: IFile[];
  isSubmitting: boolean;
  selectedGroups: IGroupInFolder[];
};

interface Props {
  task: string;
  item: string;
  logType: LogType;
  link: string;
  title: string;
  open: boolean;
  onClose: VoidFunction;
  groupsInFolder: IGroupInFolder[];
  linkFolderId: string | null;
}

export default function CommentEditor({
  task,
  item,
  logType,
  link,
  title,
  open,
  onClose,
  groupsInFolder,
  linkFolderId,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const [localState, setLocalState] = useState<ILocalState>({
    message: '',
    openAttach: false,
    openImage: false,
    openEmbed: false,
    attachFile: [],
    isSubmitting: false,
    selectedGroups: []
  });

  const {
    files,
    fileLoading,
    selectedFile,
    selectedFiles,
    setFiles,
    countFiles,
    setSelectedFile,
    setSelectedFiles,
    selectedImagePath,
    setSelectedImagePath,
    setFileLoading
  } = useFile(
    (state) => ({
      files: state.datas,
      fileLoading: state.loading,
      selectedFile: state.selectedData,
      selectedFiles: state.selectedFiles,
      setFiles: state.setDatas,
      countFiles: state.countDatas,
      setSelectedFile: state.setSelectedData,
      setSelectedFiles: state.setSelectedFiles,
      selectedImagePath: state.selectedImagePath,
      setSelectedImagePath: state.setSelectedImagePath,
      setFileLoading: state.setLoading
    }),
    shallow
  );

  const {
    discussions,
    discussionLoading,
    selectedDiscussion,
    setDiscussions,
    countDiscussions,
    setSelectedDiscussion,
    setDiscussionLoading
  } = useDiscussion(
    (state) => ({
      discussions: state.datas,
      discussionLoading: state.loading,
      selectedDiscussion: state.selectedData,
      setDiscussions: state.setDatas,
      countDiscussions: state.countDatas,
      setSelectedDiscussion: state.setSelectedData,
      setDiscussionLoading: state.setLoading
    }),
    shallow
  );
  const { embedContent, setEmbedContent } = useEmbed(
    (state) => ({
      embedContent: state.embedContent,
      setEmbedContent: state.setEmbedContent
    }),
    shallow
  );
  const handleChangeMessage = (value: string) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      message: value
    }));
  };

  const onRemoveFile = (file: IFile) => {
    const fData = selectedFiles.filter((e) => e._id !== file._id);
    setSelectedFiles(fData);
  };

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      message: '',
      isSubmitting: false
    }));
    setSelectedFiles([]);
    onClose();
  };

  const handleAttachDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openAttach: value
    }));
  };

  const handleImageDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openImage: value
    }));
  };

  const handleEmbedDialog = (value: boolean) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      openEmbed: value
    }));
  };

  const postComment = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isSubmitting: true
    }));

    let newContent = localState.message;
    if (selectedFiles.length > 0) {
      for (const fi of selectedFiles) {
        newContent += `<br/> <span class="attach-icon"></span> <a class="attachfile" target="_blank" href=${
          process.env.REACT_APP_APIURL + '/files/download/' + fi._id
        } rel="noopener noreferrer"><i>${fi.displayName}<i/><a/>`;
      }
    }

    const newDiscussionReqCreate: IDiscussionReqCreate = {
      customer: user?.customer._id,
      groups: JSON.stringify(
        groupsInFolder.map((e) => (e.group as IGroup)._id)
      ),
      approved: user?.isKey === true ? Approved.Approved : Approved.None,
      from: user?.id,
      content: newContent,
      task: task,
      relativeid: item,
      type: logType,
      link: link,
      createdGroup: (user?.group as IGroup)._id
    };
    await discussionsApi.postCreate(newDiscussionReqCreate);

    const discussParam = {
      relativeid: item,
      approved: Approved.Approved
    };
    const allDiscussions = await discussionsApi.getAllDiscussions(discussParam);
    setDiscussions(allDiscussions.data);

    onCancel();
  };

  const handleInputChange = (
    event: SyntheticEvent<Element, Event>,
    value: IGroupInFolder[]
  ) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedGroups: value
    }));
  };

  useEffect(() => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedGroups: groupsInFolder
    }));
  }, [groupsInFolder]);

  useEffect(() => {
    if (selectedImagePath !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        message:
          localState.message +
          `<img class="comment-img" src="${selectedImagePath}" alt="inserted image" >`
      }));
    }
    setSelectedImagePath(null);
  }, [selectedImagePath]);

  useEffect(() => {
    if (embedContent !== null) {
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        message: localState.message + embedContent
      }));
    }
    setEmbedContent(null);
  }, [embedContent]);

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      {...other}
      sx={{ zIndex: 1300 }}>
      <DialogTitle> {`${title}`} </DialogTitle>

      <DialogContent>
        <Stack
          spacing={1}
          direction="row"
          alignItems={{ xs: 'flex-end', md: 'right' }}
          justifyContent="space-between"
          sx={{ mt: 1, mb: 1, mr: 1 }}
          minWidth={500}>
          <Editor
            simple={false}
            id="comment"
            value={localState.message}
            onChange={handleChangeMessage}
            placeholder={`${translate('discussion.type_a_message')}`}
            sx={{ flexGrow: 1, borderColor: 'transparent' }}
          />
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          alignItems={{ xs: 'flex-start', md: 'left' }}
          sx={{ mt: 1 }}>
          <Tooltip title={`${translate('discussion.attach')}`} placement="top">
            <Button
              color="primary"
              variant="soft"
              onClick={() => handleAttachDialog(true)}>
              <Iconify icon="mi:attachment" />
            </Button>
          </Tooltip>
          <Tooltip
            title={`${translate('discussion.insert_image')}`}
            placement="top">
            <Button
              color="primary"
              variant="soft"
              onClick={() => handleImageDialog(true)}>
              <Iconify icon="ion:image-outline" />
            </Button>
          </Tooltip>
          <Tooltip title={`${translate('discussion.embed')}`} placement="top">
            <Button
              color="primary"
              variant="soft"
              onClick={() => handleEmbedDialog(true)}>
              <Iconify icon="icomoon-free:embed" />
            </Button>
          </Tooltip>
          {!user?.isKey ? (
            <Typography
              variant="caption"
              color="text.disable"
              sx={{ position: 'relative', left: '100px', top: '8px' }}>
              <i>{`${translate('discussion.waiting_approve_note')}`}</i>
            </Typography>
          ) : null}
        </Stack>

        <Scrollbar sx={{ minHeight: 60, maxHeight: 130, pt: 2 }}>
          <Grid container spacing={2}>
            {selectedFiles.length > 0 ? (
              <Grid item xs={12} md={6}>
                {selectedFiles &&
                  selectedFiles.reverse().map((file) => (
                    <Stack
                      key={file._id}
                      spacing={1}
                      direction={{ xs: 'column', md: 'row' }}
                      alignItems={{ xs: 'flex-start', md: 'left' }}>
                      <IconButton
                        color="error"
                        onClick={() => onRemoveFile(file)}>
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                      <Typography
                        color="primary"
                        variant="subtitle2"
                        sx={{ pt: 1 }}>
                        <i>{file.displayName}</i>
                      </Typography>
                    </Stack>
                  ))}
              </Grid>
            ) : null}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                size="small"
                limitTags={3}
                fullWidth
                options={groupsInFolder}
                getOptionLabel={(option) => (option.group as IGroup).groupname}
                value={localState.selectedGroups}
                onChange={handleInputChange}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Thông báo tới"
                    placeholder="Nhóm"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Scrollbar>
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onCancel}>
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:post-it-note-edit" />}
          onClick={postComment}>
          {`${translate('discussion.comment')}`}
        </LoadingButton>
      </DialogActions>

      <SelectFilesDialog
        linkFolderId={linkFolderId}
        open={localState.openAttach}
        onClose={() => handleAttachDialog(false)}
      />

      <SelectImagesDialog
        linkFolderId={linkFolderId}
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
