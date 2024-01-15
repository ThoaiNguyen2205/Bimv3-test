import { useEffect, useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import {
  Card,
  Stack,
  Button,
  ListItemButton,
  ListItem,
  ListItemText,
} from '@mui/material';
// components
import FileThumbnail from 'src/components/file-thumbnail/FileThumbnail';
import { IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import { useLocales } from 'src/locales';
import FolderLinkCard from '../../file/item/FolderLinkCard';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '100vw',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    alignItems: 'center',
    zIndex: 98,
  },
}));
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean,
}

type Props = {
  handleClick: (file: IFile) => void;
  file: IFile;
  location: IFolder[],
  //
  searchMode: boolean;
  onLinkClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  folderNameStyle: object,
};

export default function FileCard({
  handleClick,
  file,
  location,
  //
  searchMode,
  onLinkClick,
  folderNameStyle,
}: Props) {
  const { translate } = useLocales();

  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
  });

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  return (
    <>
      
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 1,
          width: 1,
          borderRadius: 1,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((localState.showCheckbox) && {
            // borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z4,
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
        >
          <FileThumbnail file={file.storeFile.substring(file.storeFile.lastIndexOf('.') + 1)} />
          {searchMode ? 
            <HtmlTooltip
              title={
                <FolderLinkCard
                  fLinks={location}
                  onLinkClick={onLinkClick}
                  folderNameStyle={folderNameStyle} 
                  searchMode={searchMode}
                  sx={folderNameStyle}
                />
              }
              placement='left'
              arrow
            >
              {(location.length < 1) ?
                <ListItem
                  key={file._id}
                  id={file._id}
                  onClick={() => handleClick(file)}
                  sx={{
                    borderRadius: 1,
                    color: 'text.primary',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemText primary={file.displayName} primaryTypographyProps={{ typography: 'body2', fontWeight: 'bold' }}></ListItemText>
                </ListItem>
                : <> </>
              }
            </HtmlTooltip>
            : 
            <ListItem
              key={file._id}
              id={file._id}
              onClick={() => handleClick(file)}
              sx={{
                borderRadius: 1,
                color: 'text.primary',
                cursor: 'pointer',
              }}
            >
              <ListItemText primary={file.displayName} primaryTypographyProps={{ typography: 'body2', fontWeight: 'bold' }}></ListItemText>
            </ListItem>
          }
        </Stack>
      </Card>
      
    </>
  );
}
