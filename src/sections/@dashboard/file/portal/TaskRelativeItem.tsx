// next
import { useRouter } from 'next/router';
// @mui
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemText,
} from '@mui/material';
// router
import { PATH_DASHBOARD } from 'src/routes/paths';
// enums
import { TaskCategory } from 'src/shared/enums';
// type
import { IMainTask } from 'src/shared/types/mainTask';
// hooks
import { useLocales } from 'src/locales';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

type Props = {
  task: IMainTask;
};

export default function TaskRelativeItem({ task }: Props) {
  const router = useRouter();
  const { translate } = useLocales();

  const [taskCategory, setTaskCategory] = useState('');

  useEffect(() => {
    switch (task.category) {
      case TaskCategory.GeneralDiscussion:
        setTaskCategory(`${translate('menu.discussion')}`);
        break;
      case TaskCategory.FileRequestCloud:
        setTaskCategory(`${translate('nav.request')}`);
        break;
      case TaskCategory.ImageCollaboration:
        setTaskCategory(`${translate('task.image_collaboration')}`);
        break;
      case TaskCategory.OfficeCollaboration:
        setTaskCategory(`${translate('task.office_collaboration')}`);
        break;
      case TaskCategory.CadCollaboration:
        setTaskCategory(`${translate('task.cad_collaboration')}`);
        break;
      case TaskCategory.ModelCollaboration:
        setTaskCategory(`${translate('task.model_collaboration')}`);
        break;
      default:
        setTaskCategory(`${translate('menu.discussion')}`);
        break;
    }
  }, []);

  const onClickTask = () => {
    if (task.category.includes('Collaboration')) {
      router.push(`${PATH_DASHBOARD.coordinator.collaborationDetails}?task=${task._id}`);
    }

    // Bổ sung cho từng loại công việc khi thêm mới loại công việc
    switch (task.category) {
      case TaskCategory.FileRequestCloud:
        router.push(`${PATH_DASHBOARD.cloud.requestDetails}?task=${task._id}`);
        break;
      case TaskCategory.GeneralDiscussion:
        router.push(`${PATH_DASHBOARD.cloud.requestDetails}?task=${task._id}`);
        break;
    }
  }
  
  return (
    <>
      <ListItem
        disableGutters
        sx={{
          flexGrow: 1,
          pr: 1,
          pb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: '#00ab5526',
          px: 2,
          mb: 1,
        }}
      >
        <Avatar
          alt={task.name}
          src={process.env.REACT_APP_APIFILE + `/images/${task.logo}`}
          sx={{ width: 50, height: 50 }}
        />

        <ListItemText
          primary={`${task.name}`}
          secondary={`${taskCategory}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2', color: 'primary' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
          sx={{ ml: 3 }}
        />

        <Box>
          <Button variant='soft' onClick={onClickTask}>
            {`${translate('cloud.open')}`}
          </Button>
        </Box>

      </ListItem>
    </>
  );
}
