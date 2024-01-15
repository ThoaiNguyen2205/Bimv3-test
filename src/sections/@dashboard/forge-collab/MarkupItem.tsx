import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { varHover, varTranHover, IconButtonAnimate, varFade } from 'src/components/animate';
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  Divider,
  Stack,
  IconButton,
  CardActionArea,
  ListItem,
  ListItemText,
  MenuItem,
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
import Tooltip from '@mui/material/Tooltip';
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
import useMarkup from 'src/redux/markupStore';
import { IMarkup, IMarkupResGetAll } from 'src/shared/types/markup';
import markupsApi from 'src/api/markupsApi';
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean,
  openPopover: HTMLElement | null,
}

type Props = {
  markupData: IMarkup;
  handleClick: VoidFunction;
  onDeleteMarkup: VoidFunction;
};

export default function MarkupItem({
  markupData,
  handleClick,
  onDeleteMarkup,
}: Props) {
  const { translate } = useLocales();  
  const {
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
  } = useForgeViewState(
    (state) => ({
      isSplit: state.isSplit,
      setIsSplit: state.setIsSplit,
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      subLoading: state.subLoading,
      setSubLoading: state.setSubLoading,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      firstSubObject: state.firstSubObject,
      setFirstSubObject: state.setFirstSubObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
      forgeViewer: state.forgeViewer,
      setForgeViewer: state.setForgeViewer,
      subViewer: state.subViewer,
      setSubViewer: state.setSubViewer,
    }),
    shallow
  );

  const {
    markups,
    setMarkups,
    selectedMarkup,
    setSelectedMarkup,
    countMarkups,
  } = useMarkup(
    (state) => ({
      markups: state.datas,
      setMarkups: state.setDatas,
      selectedMarkup: state.selectedData,
      setSelectedMarkup: state.setSelectedData,
      countMarkups: state.countDatas,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
    openPopover: null,
  });

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  const loadDAllMarkups = async () => {
    let params = {};
    if (currentTask?.category === TaskCategory.ModelCollaboration) {
      params = {
        task: currentTask?._id,
      }
    } else {
      params = {
        task: currentTask?._id,
        fileid: selectedObject?._id,
      }
    }
    const markupsRes: IMarkupResGetAll = await markupsApi.getAllMarkups(params) as IMarkupResGetAll;
    setMarkups(markupsRes.data);
  }

  const setApproved = async () => {
    await markupsApi.setApproved(markupData._id);
    loadDAllMarkups();
  }

  const cancelApproved = async () => {
    await markupsApi.cancelApproved(markupData._id);
    loadDAllMarkups();
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
            boxShadow: (theme) => theme.customShadows.z4,
          }),
          ...((selectedMarkup?._id === markupData._id) && {
            bgcolor: 'success.lighter',
          }),
        }}
        onClick={handleClick}
      >
        {(markupData.approved !== undefined && markupData.approved !== null) ?
          <Stack
            sx={{
              top: 5,
              left: 5,
              position: 'absolute',
            }}
          >
            <Iconify icon="mdi:approve" color='primary.main' sx={{ width: 18, height: 18 }}/>
          </Stack>
          : null
        }

        {(currentTask?.isEdit || currentTask?.isUpdate || currentTask?.isApprove) ?
          <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute', zIndex: 1000 }}>
            <IconButton color={localState.openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
          : null
        }

        <TextMaxLine
          variant='subtitle2'
          persistent
          // onClick={onNewestClick}
          sx={{ ml: 2, mt: 1, color: 'primary.main', cursor: 'pointer' }}
        >
          {markupData.title}
        </TextMaxLine>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption' }}
        >
          <Iconify icon="basil:user-outline" sx={{ width: 14, height: 14 }} />
          <i>{(markupData.createdBy as IUser).username}</i>
          <Iconify icon="fa-solid:users" sx={{ width: 14, height: 14 }} />
          <i>{`${(markupData.createdGroup as IGroup).groupname} - ${(markupData.createdGroup as IGroup).title}`}</i>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption' }}
        >
          <Iconify icon="mingcute:time-line" sx={{ width: 14, height: 14 }} />
          <i>{fDate(markupData.createdAt)}</i>
        </Stack>

      </Card>
      
      
      <MenuPopover
        open={localState.openPopover}
        onClose={handleClosePopover}
        arrow="right-top"
        sx={{ width: 200 }}
      >
        {(currentTask?.isApprove) ? 
          <>
            <MenuItem
              onClick={() => {
                setApproved();
                handleClosePopover();
              }}
              sx={{ color: 'primary.main' }}
            >
              <Iconify icon={'akar-icons:chat-approve'} />
              {`${translate('common.approve')}`}
            </MenuItem>
            <MenuItem
              onClick={() => {
                cancelApproved();
                handleClosePopover();
              }}
              sx={{ color: 'warning.main' }}
            >
              <Iconify icon={'tabler:message-2-cancel'} />
              {`${translate('common.cancel_approved')}`}
            </MenuItem>
          </>
          : null
        }
        {(currentTask?.isEdit || currentTask?.isUpdate) ? 
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <MenuItem
              onClick={() => {
                onDeleteMarkup();
                handleClosePopover();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon={'fluent:delete-24-regular'} />
              {`${translate('cloud.delete')}`}
            </MenuItem>
          </>
          : null
        }
      </MenuPopover>

    </>
  );
}
