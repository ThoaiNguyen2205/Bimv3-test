import { Divider, MenuItem } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type ILocalState = {
  openDelete: boolean;
};

type Props = {
  openPopover: HTMLElement | null;
  onClosePopover: VoidFunction;
  showEditDocument: VoidFunction;
  onDeleteDocument: VoidFunction;
  jumpToEditor: VoidFunction;
  showShareForm: VoidFunction;
  onSetPermit: VoidFunction;
  resetFormEditor: () => void;
};

export default function DocumentPopupMenu({
  resetFormEditor,
  openPopover,
  onClosePopover,
  showEditDocument,
  onDeleteDocument,
  jumpToEditor,
  showShareForm,
  onSetPermit
}: Props) {
  const { translate } = useLocales();

  return (
    <>
      <MenuPopover
        className="popup-menu"
        open={openPopover}
        onClose={onClosePopover}
        arrow="right-top"
        sx={{ width: 160 }}>
        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            onClosePopover();
            showEditDocument();
          }}>
          <Iconify icon="fa:edit" className="popup-menu__item-icon" />
          {`${translate('common.modify')}`}
        </MenuItem>
        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            onClosePopover();
            jumpToEditor();
            resetFormEditor();
          }}>
          <Iconify
            icon="icon-park-outline:editor"
            className="popup-menu__item-icon"
          />
          {`${translate('documents.editor')}`}
        </MenuItem>

        <Divider
          sx={{ borderStyle: 'dashed' }}
          className="popup-menu__divider"
        />

        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            showShareForm();
            onClosePopover();
          }}>
          <Iconify icon="solar:share-bold" className="popup-menu__item-icon" />
          {`${translate('documents.share')}`}
        </MenuItem>

        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            onSetPermit();
            onClosePopover();
          }}>
          <Iconify
            icon="icon-park-outline:permissions"
            className="popup-menu__item-icon"
          />
          {`${translate('common.permission')}`}
        </MenuItem>

        <Divider
          sx={{ borderStyle: 'dashed' }}
          className="popup-menu__divider"
        />

        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            onClosePopover();
          }}>
          <Iconify
            icon="material-symbols:preview-outline"
            className="popup-menu__item-icon"
          />
          {`${translate('documents.preview')}`}
        </MenuItem>

        <Divider
          sx={{ borderStyle: 'dashed' }}
          className="popup-menu__divider"
        />

        <MenuItem
          className="popup-menu__item"
          onClick={() => {
            onDeleteDocument();
            onClosePopover();
          }}
          sx={{ color: 'error.main' }}>
          <Iconify
            icon="material-symbols:bookmark-remove"
            className="popup-menu__item-icon"
          />
          {`${translate('common.delete')}`}
        </MenuItem>
      </MenuPopover>
    </>
  );
}
