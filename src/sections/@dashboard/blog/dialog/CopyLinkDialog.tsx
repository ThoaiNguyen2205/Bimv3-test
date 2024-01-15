// react
import { useState } from 'react';
// @mui
import {
  Stack,
  Dialog,
  Button,
  DialogProps,
  DialogTitle,
  DialogContent,
  InputAdornment,
  FormControl,
  OutlinedInput,
  Tooltip,
  ClickAwayListener
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
// locales
import { useLocales } from '../../../../locales';
// AuthContext
import { PATH_BLOG } from '../../../../routes/paths';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// type
import { IDocInvitation } from '../../../../shared/types/docInvitation';
import { IBlog } from '../../../../shared/types/blog';
// ----------------------------------------------------------------------

type LocalState = {
  invitations: Array<IDocInvitation>;
  selectedInvitation: IDocInvitation | null;
  openConfirm: boolean;
  openTooltip: boolean;
};
// ----------------------------------------------------------------------
export interface IBlogShareDialog extends DialogProps {
  open: boolean;
  onClose: () => void;
  blog: IBlog | null;
}

export default function CopyLinkDialog({
  open,
  onClose,
  blog,
  ...other
}: IBlogShareDialog) {
  const { translate } = useLocales();
  const { copy } = useCopyToClipboard();
  // const origin = window.location.origin;
  const linkShare = `${process.env.REACT_APP_URL}${PATH_BLOG.view(blog?._id as string)}`;
  const [localState, setLocalState] = useState<LocalState>({
    invitations: [],
    selectedInvitation: null,
    openConfirm: false,
    openTooltip: false
  });
  const handleCopyLink = () => {
    copy(linkShare);
    handleOpenTooltip(true);
  };
  const handleOpenTooltip = (value: boolean) => {
    setLocalState((prevState: LocalState) => ({
      ...prevState,
      openTooltip: value
    }));
  };
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...other}
      className="share-dialog">
      <DialogTitle className="share-dialog__title">
        {`${translate('documents.share')}: ${blog?.title}`}{' '}
      </DialogTitle>

      <DialogContent className="share-dialog__content">
        <FormControl
          variant="outlined"
          fullWidth
          className="share-dialog__content-link">
          <OutlinedInput
            id="outlined-adornment-weight"
            value={linkShare}
            endAdornment={
              <InputAdornment position="end">
                <ClickAwayListener onClickAway={() => handleOpenTooltip(false)}>
                  <div>
                    <Tooltip
                      PopperProps={{
                        disablePortal: true
                      }}
                      onClose={() => handleOpenTooltip(false)}
                      open={localState.openTooltip}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={`${translate('cloud.copied_link')}`}
                      placement="top">
                      <Button
                        className="button__copy"
                        variant="contained"
                        color="success"
                        onClick={handleCopyLink}
                        endIcon={
                          <Iconify
                            className="button__copy-icon"
                            icon="eva:clipboard-outline"
                          />
                        }>
                        Copy
                      </Button>
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </InputAdornment>
            }
          />
        </FormControl>
        <Stack className="share-dialog__content-action">
          <Button
            className="share__action-close"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            onClick={onClose}>
            {`${translate('common.close')}`}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
