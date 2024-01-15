//react
import { useState, useEffect, useCallback } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  TextField,
  ListItem,
  Typography,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify/Iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content/EmptyContent';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useEmbed from 'src/redux/embedStore';
import { shallow } from 'zustand/shallow';
// component
import Markdown from 'src/components/markdown/Markdown';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// ----------------------------------------------------------------------

type ILocalState = {
  originLink: string,
  embedLink: string | null,
  isSubmitting: boolean,
}

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function InsertEmbedDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

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

  const [localState, setLocalState] = useState<ILocalState>({
    originLink: '',
    embedLink: '',
    isSubmitting: false,
  });

  const updateEmbedLink = (event: React.ChangeEvent<HTMLInputElement>) => {
    const originlnk = event.target.value;
    // Nếu là youtube:
    const vCutting = originlnk.split('v=').pop();
    let youtubelink = '';
    if (vCutting !== undefined && vCutting !== originlnk) {
      const queryValue = vCutting.split('&')[0];
      youtubelink = `<iframe width="100%" src="https://www.youtube-nocookie.com/embed/${queryValue}" frameborder="0" ></iframe>`;
    } else {
      youtubelink = originlnk;
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      originlnk: originlnk,
      embedLink: youtubelink,
    }));
  }

  const onCancel = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      originLink: '',
      embedLink: null,
    }));
    onClose();
  }

  const onInsertEmbed = () => {
    setEmbedContent(localState.embedLink);
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      originLink: '',
      embedLink: null,
    }));
    onClose();
  }

  return (
    <Dialog open={open} maxWidth='md' fullWidth onClose={onClose} {...other}>
      <DialogTitle> {`${translate('discussion.embed')}`} </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 3, mb: 2 }}>
          <TextField
            multiline
            sx={{ width: "100%" }}
            type="text"
            name="link"
            label={`${translate('discussion.embed_content')}`}
            // value={localState.originLink}
            onChange={updateEmbedLink}
          />
        </Stack>
        <Markdown children={localState.embedLink ? localState.embedLink : ''} />
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mdi:exit-to-app" />}
          onClick={onCancel}
        >
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={localState.isSubmitting}
          startIcon={<Iconify icon="mdi:folder-key" />}
          onClick={onInsertEmbed}
        >
          {`${translate('task.select')}`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
