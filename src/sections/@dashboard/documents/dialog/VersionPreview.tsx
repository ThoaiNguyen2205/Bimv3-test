// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Container,
  Typography,
  DialogActions,
  Dialog
} from '@mui/material';
//locales
import { useLocales } from '../../../../locales';
//utils
import { fDate, fDateVi } from '../../../../utils/formatTime';
// @types
import { IDocIndex } from '../../../../shared/types/docIndex';
import { IDocContent } from '../../../../shared/types/docContent';
//stores
import { shallow } from 'zustand/shallow';
import useDocEditor from '../../../../redux/docEditorStore/docEditorStore';
// components
import Scrollbar from '../../../../components/scrollbar';
import EmptyContent from '../../../../components/empty-content';
import Label from '../../../../components/label/Label';
import { ConfirmDialogProps } from '../../../../components/confirm-dialog/types';
import MarkDown from '../../../../components/markdown/Markdown';

// -------------------------------------------------------
export interface IPreviewDialogProps extends ConfirmDialogProps {
  version?: IDocContent | null;
  open: boolean;
  onClose: VoidFunction;
  closeDialogVersion?: VoidFunction;
}
//---------------------------------------------------
export default function VersionPreview({
  version,
  open,
  onClose,
  closeDialogVersion
}: IPreviewDialogProps) {
  const { currentLang, translate } = useLocales();
  const { handleRestoreVersion } = useDocEditor(
    (state) => ({
      handleRestoreVersion: state.handleRestoreVersion
    }),
    shallow
  );
  const hasContent = version?.index || version?.content;
  return (
    <Dialog fullScreen open={open} onClose={onClose} className="preview-dialog">
      <DialogActions className="preview-dialog__action">
        <Typography variant="h6" className="preview-dialog__action-title">
          {`${translate('documents.preview')}`}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          className="preview-dialog__action-cancel">
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton
          className="preview-dialog__action-restore"
          type="submit"
          variant="contained"
          onClick={() => {
            handleRestoreVersion((version as IDocContent)?._id);
            onClose();
            if (closeDialogVersion) {
              closeDialogVersion();
            }
          }}>
          {`${translate('documents.version_restore')}`}
        </LoadingButton>
      </DialogActions>

      <Box className="preview-dialog__content">
        {hasContent ? (
          <Scrollbar className="preview-dialog__content-scrollbar">
            <Box className="preview-dialog__content-title">
              <PreviewIndex title={(version?.index as IDocIndex)?.title} />
            </Box>

            <Container className="preview-dialog__content-body">
              <Typography variant="h5" className="body__version">
                {`${translate('documents.versions')}`}
                <Label
                  variant="soft"
                  color={'primary'}
                  className="body__version-label">
                  {version?.versionNotes}
                </Label>
              </Typography>
              <Typography variant="caption" className="body__createdAt">
                {`${translate('documents.create_at')} : ${
                  (currentLang.value === 'en' &&
                    fDate((version as IDocContent)?.createdAt)) ||
                  (currentLang.value === 'vi' &&
                    fDateVi((version as IDocContent)?.createdAt)) ||
                  fDate((version as IDocContent)?.createdAt)
                }`}
              </Typography>
              <Box className="body__mardown">
                <MarkDown
                  className="body__markdown-box"
                  children={decodeURIComponent(
                    (version as IDocContent)?.content
                  )}
                />
              </Box>
            </Container>
          </Scrollbar>
        ) : (
          <EmptyContent
            title="Empty content"
            className="preview-dialog__content-empty"
          />
        )}
      </Box>
    </Dialog>
  );
}
// ----------------------------------------------------

type PreviewIndexProps = {
  title: string;
};

function PreviewIndex({ title }: PreviewIndexProps) {
  return (
    <Box className="preview-index">
      <Container className="preview-index__container">
        <Typography
          variant="h3"
          component="h1"
          className="preview-index__container-title">
          {title}
        </Typography>
      </Container>
    </Box>
  );
}
