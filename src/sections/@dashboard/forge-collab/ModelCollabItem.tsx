import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { varHover, varTranHover, IconButtonAnimate, varFade } from 'src/components/animate';
import {
  Avatar,
  AvatarGroup,
  Box,
  Checkbox,
  Card,
  MenuItem,
  Stack,
  IconButton,
  CardActionArea,
  ListItem,
  ListItemText,
  Typography,
  Tooltip,
} from '@mui/material';
import MenuPopover from 'src/components/menu-popover/MenuPopover';
// utils
import { fDate } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import TextMaxLine from '../../../components/text-max-line';
//
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import { IGroup } from 'src/shared/types/group';
import { useLocales } from 'src/locales';
import { IMainTask } from 'src/shared/types/mainTask';
import Image from 'src/components/image';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { IUser } from 'src/shared/types/user';
import { TaskCategory } from 'src/shared/enums';
import { getLinkFromCategory } from 'src/utils/taskCategoryHelper';
import { IForgeObject, IForgeObjectData } from 'src/shared/types/forgeObject';
// zustand
import useForgeViewState from 'src/redux/forgeViewStore';
import { shallow } from 'zustand/shallow';
import { IFolder } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
import forgesApi from 'src/api/forgesApi';
import FileThumbnail from 'src/components/file-thumbnail/FileThumbnail';
import forgeObjectsApi from 'src/api/forgeObjectsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean,
  hrefLink: string,
  version: string,
  date: string,
  ext: string,
  openPopover: HTMLElement | null,
}

type Props = {
  linkFolderId: string,
  imageData: IForgeObjectData;
  handleClick: (id: string) => void;
  onDeleteForgeObject: VoidFunction;
};

export default function ModelCollabItem({
  linkFolderId,
  imageData,
  handleClick,
  onDeleteForgeObject,
}: Props) {
  const { translate } = useLocales();
  const router = useRouter();
  const check = (linkFolderId === (imageData.forgeObject.file as IFile).folder);

  const jumptoFilePath = async (folderId: string, fileId: string) => {
    router.push(`${PATH_DASHBOARD.cloud.filesManager}?folder=${folderId}&sel=${fileId}`);
  }

  const {
    forgeLoading,
    setForgeLoading,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    selectedObject,
    setSelectedObject,
  } = useForgeViewState(
    (state) => ({
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
    hrefLink: '',
    version: `${imageData.forgeObject.version}.${imageData.forgeObject.subVersion}`,
    date: `${fDate(imageData.forgeObject.updatedAt)}`,
    ext: imageData.forgeObject.displayName.slice(imageData.forgeObject.displayName.lastIndexOf('.') + 1),
    openPopover: null,
  });

  // const onNewestClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
  //   setLocalState((prevState: ILocalState) => ({ 
  //     ...prevState,
  //     version: `${imageData.forgeObject.version}.${imageData.forgeObject.subVersion}`,
  //     date: `${fDate(imageData.forgeObject.updatedAt)}`,
  //   }));
  //   handleClick(imageData.forgeObject._id);
  // }

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  // const onClickHistory = (history: IForgeObject) => {
  //   setSelectedObject(imageData.forgeObject);
  //   setFirstObject(history);
  //   setLocalState((prevState: ILocalState) => ({ 
  //     ...prevState,
  //     version: `${history.version}.${history.subVersion}`,
  //     date: `${fDate(history.updatedAt)}`,
  //   }));
  // }

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  const onSelectModel = () => {
    const newForgeData: IForgeObjectData[] = [];
    for (const fi of forgeObjectData) {
      if (fi.forgeObject._id === imageData.forgeObject._id) {
        fi.forgeObject.checked = !fi.forgeObject.checked;
      }
      newForgeData.push(fi);
    }
    setForgeObjectData(newForgeData);
    const checkModels = newForgeData.filter((e) => e.forgeObject.checked === true);
    if (checkModels.length > 0) {
      setSelectedObject(checkModels[0].forgeObject);
      setFirstObject(checkModels[0].forgeObject);
    } else {
      setSelectedObject(null);
      setFirstObject(null);
    }
  }

  return (
    <>
      <Card
        onMouseEnter={handleShowCheckbox}
        onMouseLeave={handleHideCheckbox}
        sx={{
          p: 1,
          width: 1,
          boxShadow: 0,
          bgcolor: 'background.default',
          border: (theme) => `solid 1px ${theme.palette.divider}`,
          ...((localState.showCheckbox) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z8,
          }),
          ...((selectedObject?._id === imageData.forgeObject._id) && {
            bgcolor: 'success.lighter',
          }),
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute', zIndex: 1000 }}>
          <IconButton color={localState.openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} >
          <Tooltip title={`${translate('common.show_hide')}`} placement='top'>
            <Checkbox
              checked={imageData.forgeObject.checked}
              onClick={onSelectModel}
              icon={<Iconify icon="eva:radio-button-off-fill" />}
              checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            />
          </Tooltip>
        </Stack>
        
        <Stack direction="row" alignItems="center" sx={{ top: 155, right: 8, position: 'absolute', zIndex: 99 }}>
          {check ? 
            <Iconify icon="icon-park-outline:check-one" color='primary.main' sx={{ width: 18, height: 18 }}/>
            :
            <Iconify icon="material-symbols:arrow-circle-right-outline-rounded" color='info.main' sx={{ width: 18, height: 18 }}/>
          }
        </Stack>

        <Stack alignItems="center" spacing={1} >
          <CardActionArea
            component={m.div}
            whileHover="hover"
            sx={{
              p: 1,
              borderRadius: 2,
              color: 'primary.main',
              bgcolor: 'background.neutral',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              // width: 100,
            }}
            // onClick={onNewestClick}
          >
            <Stack alignItems="center" spacing={1} >
              <m.div variants={varHover(1.1)} transition={varTranHover()} >
                <FileThumbnail file={localState.ext} sx={{ width: 60, height: 60 }}/>
              </m.div>
            </Stack>
          </CardActionArea>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2} >
          {/* <FileThumbnail file={localState.ext} sx={{ width: 30, height: 30 }}/> */}
          <TextMaxLine
            variant='subtitle2'
            color='primary.main'
            persistent
            // onClick={onNewestClick}
            sx={{ ml: 1, mt: 1, cursor: 'pointer' }}
          >
            {imageData.forgeObject.displayName}
          </TextMaxLine>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption' }}
        >
          <Iconify icon="basil:user-outline" sx={{ width: 14, height: 14 }} />
          <i>{(imageData.forgeObject.updatedBy as IUser).username}</i>
          <Iconify icon="fa-solid:users" sx={{ width: 14, height: 14 }} />
          <i>{`${(imageData.forgeObject.createdGroup as IGroup).groupname} - ${(imageData.forgeObject.createdGroup as IGroup).title}`}</i>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'primary.main' }}
        >
          <Iconify icon="mingcute:version-line" sx={{ width: 14, height: 14, mr: 1 }} />
          {localState.version}
          <Iconify icon="mingcute:time-line" sx={{ width: 14, height: 14 }} />
          <i>{localState.date}</i>
        </Stack>

        <Stack
          direction="column"
          alignItems="center"
          spacing={0.75}
          sx={{
            cursor: 'pointer',
            typography: 'caption',
            mt: 1,
          }}
        >
          {imageData.history && imageData.history.map((image) => (
            <Card
              key={image._id}
              sx={{ p: 1, flexGrow: 1, borderRadius: 1, border: '1px solid', borderColor: '#00ab5526', }}
              onClick={() => handleClick(image._id)}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
              >
                <Iconify icon="mingcute:version-line" sx={{ width: 14, height: 14 }} />
                <Box color='primary.main'>{`${image.version}.${image.subVersion}`}</Box>
                <Iconify icon="mingcute:time-line" sx={{ width: 14, height: 14 }} />
                <Box color='text.disabled'><i>{fDate(image.updatedAt)}</i></Box>
              </Stack>
            </Card>
          ))}
        </Stack>

      </Card>

      <MenuPopover
        open={localState.openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 220 }}
      >
        <MenuItem
          onClick={() => {
            jumptoFilePath((imageData.forgeObject.file as IFile).folder.toString(), (imageData.forgeObject.file as IFile)._id);
            handleClosePopover();
          }}
        >
          <Iconify icon='iconamoon:cloud-yes-light' />
          {`${translate('cloud.open_in_cloud')}`}
        </MenuItem>

        {(currentTask?.isEdit || currentTask?.isUpdate) ? 
          <MenuItem
            onClick={() => {
              onDeleteForgeObject();
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon={'fluent:delete-24-regular'} />
            {`${translate('cloud.delete')}`}
          </MenuItem>
          : null
        }
      </MenuPopover>

    </>
  );
}
