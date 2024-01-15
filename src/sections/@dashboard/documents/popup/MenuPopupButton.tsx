// @mui
import { Box, Button, Divider, MenuItem } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
// locales
import { useLocales } from 'src/locales';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { IComment } from 'src/shared/types/comment';
import NextLink from 'next/link';
import { IBimDocument } from 'src/shared/types/bimDocument';
import useResponsive from 'src/hooks/useResponsive';

// ----------------------------------------------------------------------

type Props = {
  isPostsPage: boolean;
  open: HTMLElement | null;
  onClose: VoidFunction;
  handleCategoriesDialog: (value: boolean) => void;
  openEditProjectDialog: (
    data: IBimDocument | null,
    flagOpenDialog: boolean,
    isEditFlag: boolean
  ) => void;
};
export default function MenuPopupButton({
  // setPageComment,
  isPostsPage,
  handleCategoriesDialog,
  openEditProjectDialog,
  open,
  onClose
}: Props) {
  const { translate } = useLocales();
  const isDesktopSm = useResponsive('up', 'sm');
  return (
    <>
      <MenuPopover
        className="popup-button"
        open={open}
        onClose={onClose}
        arrow="right-top"
        sx={{
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }}>
        {isPostsPage && (
          <Box className="popup-button__item">
            <Button
              component={NextLink}
              href={PATH_DASHBOARD.document.personal}
              className="popup-button__item-create "
              variant="contained"
              color="inherit"
              size={isDesktopSm ? 'medium' : 'small'}
              startIcon={<Iconify icon="eva:file-text-outline" />}>
              {`${translate('blog.my_posts')}`}
            </Button>
          </Box>
        )}

        <Box className="popup-button__item">
          <Button
            size={isDesktopSm ? 'medium' : 'small'}
            className="popup-button__item-create"
            variant="contained"
            startIcon={<Iconify icon="fluent:document-ribbon-32-regular" />}
            onClick={() => handleCategoriesDialog(true)}>
            {`${translate('documents.category')}`}
          </Button>
        </Box>
        <Box className="popup-button__item">
          <Button
            className="popup-button__item-create "
            variant="contained"
            size={isDesktopSm ? 'medium' : 'small'}
            startIcon={<Iconify icon="ion:document-attach-outline" />}
            onClick={() => openEditProjectDialog(null, true, false)}>
            {`${translate('documents.new_doc')}`}
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
