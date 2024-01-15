import { useState } from 'react';
// @mui
import {
  Box,
  ButtonGroup,
  Card,
  Stack,
  Tooltip,
} from '@mui/material';
// types
import { IFile } from 'src/shared/types/file';
// utils
import { fDate } from '../../../utils/formatTime';
// hooks
import { useLocales } from 'src/locales';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
import FileThumbnail from 'src/components/file-thumbnail/FileThumbnail';

// ----------------------------------------------------------------------

type Props = {
  file: IFile;
  detailItem: IFile | null;
  handleDetailsDialog: () => void;
};

export default function TaskFileCard({
  file,
  detailItem,
  handleDetailsDialog,
}: Props) {
  const { translate } = useLocales();

  const [showCheckbox, setShowCheckbox] = useState(false);

  const handleShowCheckbox = () => {
    setShowCheckbox(true);
  };

  const handleHideCheckbox = () => {
    setShowCheckbox(false);
  };
  
  return (
    <>
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 2,
          width: 1,
          maxWidth: 222,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((showCheckbox) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z4,
          }),
          ...((detailItem?._id === file._id) && {
            bgcolor: 'success.lighter',
          }),
          cursor: 'pointer',
        }}
        onClick={handleDetailsDialog}
      >
        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute', zIndex: 2 }} >
          <Stack direction="row" alignItems="center" justifyContent="flex-end" >
            <ButtonGroup>
              {(file.isConfimed !== undefined && file.isConfimed !== null) ? 
                <Tooltip title={`${translate('common.confirmed')}`}>
                  <Iconify color="secondary.main" icon="mdi:approve" width={16} height={16}/>
                </Tooltip>
                : null
              }
              {(file.isApproved !== undefined && file.isApproved !== null) ? 
                <Tooltip title={`${translate('common.approved')}`}>
                  <Iconify color="error.main" icon="carbon:task-approved" width={16} height={16}/>
                </Tooltip>
                : null
              }
            </ButtonGroup>
          </Stack>
        </Stack>

        <FileThumbnail file={file.storeFile.slice(file.storeFile.lastIndexOf('.') + 1).toLowerCase()} sx={{ width: 40, height: 40 }}/>

        <TextMaxLine
          variant="subtitle2"
          persistent
          sx={{ mt: 1, cursor: 'pointer' }}
        >
          {file.displayName}
        </TextMaxLine>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <Box> {`${file.version}.${file.subVersion}`} </Box>
          <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'currentColor' }} />
          <Box> {fDate(file.updatedAt)} </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled', mb: 1 }}
        >
          <Box> {`${translate('cloud.size')}: ${file.size} Mb`} </Box>
        </Stack>

      </Card>

    </>
  );
}
