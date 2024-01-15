// @mui
import {
  Avatar,
  Box,
  Button,
  Link,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
// hooks
import useResponsive from 'src/hooks/useResponsive';
// components
import Iconify from '../../components/iconify';
// locales
import { useLocales } from 'src/locales';
import { IGroup } from 'src/shared/types/group';
// type
import { IDiscussion } from 'src/shared/types/discussion';
import { IUser } from 'src/shared/types/user';
import Markdown from 'src/components/markdown';
// utils
import { fToNow } from 'src/utils/formatTime';
import { StyledEditor } from 'src/components/editor/styles';
// apis
import discussionsApi from 'src/api/discussionsApi';
import filesApi from 'src/api/filesApi';
import foldersApi from 'src/api/foldersApi';
import { LogType } from 'src/shared/enums';
import { useEffect, useState } from 'react';
import mainTasksApi from 'src/api/mainTasksApi';
// ----------------------------------------------------------------------

type Props = {
  discussion: IDiscussion;
  onApprove: VoidFunction;
  onReject: VoidFunction;
};

export default function ApproveDiscussionCard({ discussion, onApprove, onReject }: Props) {

  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();
  const [title, setTitle] = useState('');

  const id = discussion.relativeid;

  useEffect(() => {
    const loadTitle = async () => {
      switch (discussion.type)
      {
        case LogType.Folder:
          const folderRes = await foldersApi.getReadById(id);
          setTitle(`Bình luận tại thư mục ${folderRes.displayName}`);
          break;
        case LogType.File:
          const fileRes = await filesApi.getReadById(id);
          setTitle(`Bình luận tại tập tin ${fileRes.displayName}`);
          break;
        case LogType.Task:
          const taskRes = await mainTasksApi.getReadById(id);
          setTitle(`Bình luận tại công việc ${taskRes.name}`);
          break;
      }
    }
    loadTitle();
  }, [discussion]);
  
  return (
    <>
      <Stack
        sx={{
          flexGrow: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: '#00ab5526',
        }}
      >
        <Stack spacing={1}
          direction='row'
          sx={{ flexGrow: 1, p: 1 }}
        >
          <Avatar
            alt={(discussion.from as IUser).username}
            src={process.env.REACT_APP_APIFILE + `/images/${(discussion.from as IUser).avatar}`}
            sx={{ width: 32, height: 32 }}
          />
          <Stack spacing={0}
            direction='column'
          >
            <Typography variant="subtitle2" color='primary' >
              <i>{`${(discussion.from as IUser).username}`}</i>
            </Typography>
            
            <Link component={NextLink} href={discussion.link} underline="none" >
              <Typography variant="caption" color='inherit'>
                <Iconify icon="ep:collection-tag" sx={{ mr: 0.5, width: 12, height: 12 }} />
                <i>{`${title}`} </i>
              </Typography>
            </Link>
          </Stack>

        </Stack>

        <Stack
          justifyContent="center"
          sx={{ p: 1 }}
        >
          <StyledEditor>
            <Markdown children={discussion.content} />
          </StyledEditor>
          
        </Stack>

        <Stack
          justifyContent="right"
          direction='row'
          sx={{ p: 1 }}
        >
          <Button
            sx={{ mr: 2 }}
            variant="soft"
            color="success"
            size="small"
            startIcon={<Iconify icon="akar-icons:check-box" />}
            onClick={onApprove}
          >
            {`${translate('discussion.approve')}`}
          </Button>
          <Button
            variant="soft"
            color="error"
            size="small"
            startIcon={<Iconify icon="fluent:calendar-cancel-20-regular" />}
            onClick={onReject}
          >
            {`${translate('discussion.reject')}`}
          </Button>
          
        </Stack>

      </Stack>
    </>
  );
}
