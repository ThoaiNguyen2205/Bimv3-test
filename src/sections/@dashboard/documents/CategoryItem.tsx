import { useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  MenuItem
} from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from '../../../components/iconify';
import MenuPopover from '../../../components/menu-popover';
// locales
import { useLocales } from '../../../locales';
// type
import { IDocCategory } from '../../../shared/types/docCategory';
// zustand
import useDocCategory from '../../../redux/docCategoryStore';
import { shallow } from 'zustand/shallow';

// ----------------------------------------------------------------------

type Props = {
  category: IDocCategory;
  onEdit: (category: IDocCategory) => void;
  onDelete: (id: string) => void;
};

export default function CategoryItem({ category, onEdit, onDelete }: Props) {
  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();

  const { selectedDocCategory } = useDocCategory(
    (state) => ({
      selectedDocCategory: state.selectedData
    }),
    shallow
  );

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  return (
    <>
      <ListItem
        className={`category-item ${
          category._id === selectedDocCategory?._id && 'category-item__selected'
        }`}
        disableGutters>
        <Avatar
          className="category-item__avatar"
          alt={category.name}
          src={process.env.REACT_APP_APIFILE + `/images/${category.avatar}`}
        />

        <ListItemText
          className="category-item__text"
          primary={`${category.name}`}
          secondary={`${category.description}`}
          primaryTypographyProps={{
            noWrap: true,
            typography: 'subtitle2',
            color: 'primary'
          }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
        />

        {isDesktop ? (
          <>
            <Button
              className="category-item__button"
              size="small"
              color="primary"
              startIcon={<Iconify icon="fluent:note-edit-24-regular" />}
              onClick={() => onEdit(category)}>
              {`${translate('common.modify')}`}
            </Button>

            <Button
              className="category-item__button"
              size="small"
              color="error"
              startIcon={<Iconify icon="mdi:remove-circle-outline" />}
              onClick={() => onDelete(category._id)}>
              {`${translate('common.delete')}`}
            </Button>
          </>
        ) : (
          <IconButton color={'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        )}

        <MenuPopover
          open={openPopover}
          onClose={handleClosePopover}
          arrow="right-top"
          sx={{ width: 160 }}>
          <MenuItem
            onClick={() => {
              onEdit(category);
              handleClosePopover();
            }}
            sx={{ color: 'primary.main' }}>
            <Iconify icon="fluent:note-edit-24-regular" />
            {`${translate('common.modify')}`}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onDelete(category._id);
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}>
            <Iconify icon="mdi:remove-circle-outline" />
            {`${translate('common.delete')}`}
          </MenuItem>
        </MenuPopover>
      </ListItem>
    </>
  );
}
