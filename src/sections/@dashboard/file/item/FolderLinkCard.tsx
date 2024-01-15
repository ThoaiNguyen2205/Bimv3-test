// @mui
import {
  Box,
  Stack,
  Button,
  CardProps,
  Tooltip,
  Typography,
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import MoreFolders from '../MoreFolders';
// Types
import { IFolder } from 'src/shared/types/folder';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  fLinks: IFolder[];
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object;
  searchMode: boolean;
}

export default function FolderLinkCard({ fLinks, onLinkClick, folderNameStyle, searchMode, ...other }: Props) {
  let itemNumber = 8;
  if (searchMode) {
    itemNumber = 100;
  } else {
    itemNumber = 8;
  }
  return (
    <Stack
      spacing={1}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ md: 'center' }}
      sx={{ width: '100%' }}
    >
      {(fLinks.length < itemNumber) ?
        fLinks && fLinks.map((folderi) => (
          <Box key={folderi._id}>
            <Tooltip title={folderi.displayName} placement="top">
              <Button id={folderi._id} color="primary" onClick={onLinkClick} sx={folderNameStyle} >
                <Typography id={folderi._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                  {folderi.displayName}
                </Typography>
              </Button>
            </Tooltip>
            {(fLinks[fLinks.length - 1]._id !== folderi._id) ? <Iconify icon={'ep:arrow-right-bold'} color="primary.main" width={10} height={10} /> : <></>}
          </Box>
        ))
        :
        <>
          <Box key={fLinks[0]._id}>
            <Tooltip title={fLinks[0].displayName} placement="top">
              <Button id={fLinks[0]._id} color="primary" onClick={onLinkClick} sx={folderNameStyle} >
                <Typography id={fLinks[0]._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                  {fLinks[0].displayName}
                </Typography>
              </Button>
            </Tooltip>
            <Iconify icon={'ep:arrow-right-bold'} color="primary.main" width={10} height={10} />
          </Box>

          <MoreFolders
            subLinks={fLinks.slice(1, fLinks.length - 2)}
            onLinkClick={onLinkClick}
          />
          <Iconify icon={'ep:arrow-right-bold'} color="primary.main" width={10} height={10} />

          <Box key={fLinks[fLinks.length - 2]._id}>
            <Tooltip title={fLinks[fLinks.length - 2].displayName} placement="top">
              <Button id={fLinks[fLinks.length - 2]._id} color="primary" onClick={onLinkClick} sx={folderNameStyle} >
                <Typography id={fLinks[fLinks.length - 2]._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                  {fLinks[fLinks.length - 2].displayName}
                </Typography>
              </Button>
            </Tooltip>
            <Iconify icon={'ep:arrow-right-bold'} color="primary.main" width={10} height={10} />
          </Box>
          <Box key={fLinks[fLinks.length - 1]._id}>
            <Tooltip title={fLinks[fLinks.length - 1].displayName} placement="top">
              <Button id={fLinks[fLinks.length - 1]._id} color="primary" onClick={onLinkClick} sx={folderNameStyle} >
                <Typography id={fLinks[fLinks.length - 1]._id} variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap >
                  {fLinks[fLinks.length - 1].displayName}
                </Typography>
              </Button>
            </Tooltip>
          </Box>
        </>
      }
    </Stack>
  );
}
