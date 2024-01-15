// @mui
import { Divider, MenuItem } from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
// locales
import { useLocales } from '../../../../locales';
import { IBimDocument } from '../../../../shared/types/bimDocument';
// ----------------------------------------------------------------------

type Props = {
  openPopover: HTMLElement | null;
  onClosePopover: VoidFunction;
  values: IBimDocument;
  openShareForm: VoidFunction;
  deletePostConfirm: VoidFunction;
  handleEditPost: VoidFunction;
  handlePreview: VoidFunction;
};
export default function BlogPostPopupMenu({
  openPopover,
  onClosePopover,
  values,
  openShareForm,
  deletePostConfirm,
  handleEditPost,
  handlePreview
}: Props) {
  const { translate } = useLocales();
  return (
    <>
      <MenuPopover
        open={openPopover}
        onClose={onClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            onClosePopover();
            handleEditPost();
          }}>
          <Iconify icon="fa:edit" />
          {`${translate('common.modify')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            openShareForm();
            onClosePopover();
          }}>
          <Iconify icon="solar:share-bold" />
          {`${translate('documents.share')}`}
        </MenuItem>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            onClosePopover();
            handlePreview();
          }}>
          <Iconify icon="material-symbols:preview-outline" />
          {`${translate('documents.preview')}`}
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            deletePostConfirm();
            onClosePopover();
          }}
          sx={{ color: 'error.main' }}>
          <Iconify icon="material-symbols:bookmark-remove" />
          {`${translate('common.delete')}`}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
