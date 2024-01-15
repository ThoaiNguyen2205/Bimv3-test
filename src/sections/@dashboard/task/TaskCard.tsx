import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { varHover, varTranHover, IconButtonAnimate, varFade } from 'src/components/animate';
import {
  Avatar,
  AvatarGroup,
  Card,
  Stack,
  IconButton,
  CardActionArea,
} from '@mui/material';
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
import TaskPopupMenu from './TaskPopupMenu';
import Image from 'src/components/image';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { IUser } from 'src/shared/types/user';
import { TaskCategory } from 'src/shared/enums';
import { getLinkFromCategory } from 'src/utils/taskCategoryHelper';
// ----------------------------------------------------------------------

type ILocalState = {
  showCheckbox: boolean,
  hrefLink: string,
}

type Props = {
  category: TaskCategory;
  handleClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  groupsInFoler: IGroupInFolder[];
  openPopover: HTMLElement | null;
  data: IMainTask;
  handleClosePopover: VoidFunction;
  handleOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  //
  selected: boolean;
  //
  onOpenRow: VoidFunction;
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  //
  detailsId: string;
};

export default function TaskCard({
  category,
  //
  handleClick,
  groupsInFoler,
  openPopover,
  data,
  handleClosePopover,
  handleOpenPopover,
  //
  selected,
  //
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  detailsId,
}: Props) {
  const { translate } = useLocales();
  const [localState, setLocalState] = useState<ILocalState>({
    showCheckbox: false,
    hrefLink: '',
  });

  const handleShowCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: true }));
  };

  const handleHideCheckbox = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, showCheckbox: false }));
  };

  useEffect(() => {
    const link = getLinkFromCategory(category, data._id);
    setLocalState((prevState: ILocalState) => ({ ...prevState, hrefLink: link }));
  }, []);

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
          ...((localState.showCheckbox || selected) && {
            borderColor: 'transparent',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...((detailsId === data._id) && {
            bgcolor: 'success.lighter',
          }),
        }}
        onDoubleClick={onOpenRow}
      >
        
        <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute', zIndex: 99 }}>
          <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

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
          }}
          onClick={onOpenRow}
        >
          <Stack alignItems="center" spacing={1} >
            <m.div variants={varHover(1.1)} transition={varTranHover()} >
              <Image alt={data.category} src={process.env.REACT_APP_APIFILE + 'images/' + data.logo} sx={{ height: 140, borderRadius: 2, }} />
            </m.div>
          </Stack>
        </CardActionArea>

        <Stack direction="row" alignItems="center" sx={{ bottom: 8, right: 8, position: 'absolute' }}>
          {data.isEdit ?
            <Tooltip title={`${translate('common.edit')}`} placement='top'>
              <Iconify icon="iconamoon:edit-fill" color='primary.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.isUpdate ? 
            <Tooltip title={`${translate('common.update')}`} placement='top'>
              <Iconify icon="dashicons:update" color='info.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.isDownload ? 
            <Tooltip title={`${translate('common.download')}`} placement='top'>
              <Iconify icon="ic:round-download" color='warning.main' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.isConfirm ? 
            <Tooltip title={`${translate('common.confirm')}`} placement='top'>
              <Iconify icon="mdi:approve" color='secondary.light' width={12} height={12} />
            </Tooltip>
            : null
          }
          {data.isApprove ? 
            <Tooltip title={`${translate('common.approve')}`} placement='top'>
              <Iconify icon="carbon:task-approved" color='error.main' width={12} height={12} />
            </Tooltip>
            : null
          }
        </Stack>

        <Stack direction="row" alignItems="center" >
          {(data.category.includes('Collaboration')) ? 
            <Avatar alt={data.category} src={process.env.REACT_APP_APIFILE + 'images/' + data.attach} sx={{ width: 30, height: 30, p: 0 }}/>
            : null
          }
          <TextMaxLine
            variant='h6'
            persistent
            onClick={handleClick}
            sx={{ ml: 1, mt: 1 }}
          >
            {data.name}
          </TextMaxLine>
          
        </Stack>
        {/* <TextMaxLine
          variant='h6'
          persistent
          onClick={handleClick}
          sx={{ ml: 1, mt: 1 }}
        >
          {data.name}
        </TextMaxLine> */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
          onClick={handleClick}
        >
          <Iconify icon="fluent:text-description-rtl-20-filled" sx={{ width: 14, height: 14, mr: 1 }} />
          {data.description}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled' }}
          onClick={handleClick}
        >
          <Iconify icon="basil:user-outline" sx={{ width: 14, height: 14 }} />
          <i>{(data.createdBy as IUser).username}</i>
          <Iconify icon="fa-solid:users" sx={{ width: 14, height: 14 }} />
          <i>{(data.createdGroup as IGroup).groupname}</i>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled', mb: 1 }}
          onClick={handleClick}
        >
          <Iconify icon="mingcute:time-line" sx={{ width: 14, height: 14 }} />
          <i>{fDate(data.updatedAt)}</i>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ typography: 'caption', color: 'text.disabled', mb: 1 }}
        >
          <AvatarGroup
            max={7}
            sx={{
              '& .MuiAvatarGroup-avatar': {
                width: 24,
                height: 24,
                '&:first-of-type': {
                  fontSize: 12,
                },
              },
            }}
          >
            {groupsInFoler &&
              groupsInFoler.map((group) => (
                <Avatar key={group._id} alt={(group.group as IGroup).groupname} src={process.env.REACT_APP_APIFILE + 'images/' + (group.group as IGroup).logo} />
              ))}
          </AvatarGroup>
        </Stack>
      </Card>

      <TaskPopupMenu 
        openPopover={openPopover}
        data={data}
        handleClosePopover={handleClosePopover}
        onOpenRow={onOpenRow}
        onEditRow={onEditRow}
        onPermission={onPermission}
        onDeleteRow={onDeleteRow}
      />

    </>
  );
}
