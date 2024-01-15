import React, { useState } from 'react';
// @mui
import { Box, Button, Typography, StackProps, Tooltip, IconButton } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import { IFolder } from 'src/shared/types/folder';
import MenuPopover from 'src/components/menu-popover/MenuPopover';
// ----------------------------------------------------------------------

interface Props extends StackProps {
  subLinks: IFolder[];
  onLinkClick: (event: React.MouseEvent<HTMLElement>) => void,
}

export default function MoreFolders({
  subLinks,
  onLinkClick,
}: Props) {

  const [open, setOpen] = useState<HTMLElement | null>(null);
        
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget as HTMLElement);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton size="large" color="primary" sx={{ opacity: 0.48 }} onClick={handleOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <MenuPopover
        open={open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -0.5,
          width: 'auto',
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
          zIndex: 101,
        }}
      >
        {subLinks && subLinks.map((folderi) => (
          <Box key={folderi._id}>
            <Tooltip title={folderi.displayName} placement="right">
              <Button id={folderi._id} variant='soft' color="primary" onClick={onLinkClick} sx={{ mb: 1 }} >
                <Typography id={folderi._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                  {folderi.displayName}
                </Typography>
              </Button>
            </Tooltip>
          </Box>
        ))}
      </MenuPopover>
    </>
  );
}
