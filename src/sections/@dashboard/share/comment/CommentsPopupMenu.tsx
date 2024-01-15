// @mui
import { Divider, MenuItem } from '@mui/material';
// locales
import { useLocales } from '../../../../locales';
//type
import { IComment } from '../../../../shared/types/comment';
// components
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
// ----------------------------------------------------------------------

type Props = {
  isOwner: boolean;
  openPopover: HTMLElement | null;
  onClosePopover: VoidFunction;
  values: IComment;
  deleteComment: VoidFunction;
  handleEditPost: VoidFunction;
};
export default function CommentsPopupMenu({
  isOwner,
  openPopover,
  onClosePopover,
  values,
  deleteComment,
  handleEditPost
}: Props) {
  const { translate } = useLocales();
  return (
    <>
      <MenuPopover
        open={openPopover}
        onClose={onClosePopover}
        arrow="left-bottom"
        sx={{ width: 130 }}>
        {isOwner && (
          <>
            <MenuItem
              sx={{ color: 'primary.main' }}
              onClick={() => {
                onClosePopover();
                handleEditPost();
              }}>
              <Iconify icon="fa:edit" />
              {`${translate('common.modify')}`}
            </MenuItem>

            <Divider sx={{ borderStyle: 'dashed' }} />
          </>
        )}

        <MenuItem
          onClick={() => {
            deleteComment();
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
