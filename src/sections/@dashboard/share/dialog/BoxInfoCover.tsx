import React from 'react';
import { Dialog, DialogProps } from '@mui/material';
import Iconify from '../../../../components/iconify/Iconify';
import Image from '../../../../components/image/Image';
//-------------------------------
export interface IDialogCoverProps extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  cover: string;
}
export default function BoxInfoCover({
  open,
  onClose,
  cover,
  ...other
}: IDialogCoverProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      {...other}
      className="dialog-cover">
      <Image
        className="dialog-cover__img"
        src={`${process.env.REACT_APP_APIFILE}images/${cover}`}
        alt={cover}
        ratio="16/9"
      />
      <Iconify
        className="dialog-cover__button"
        onClick={onClose}
        icon="material-symbols:cancel-outline"
      />
    </Dialog>
  );
}
