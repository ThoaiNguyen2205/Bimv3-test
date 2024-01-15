// @mui
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
} from '@mui/material';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import useTask from 'src/redux/taskStore';
import { shallow } from 'zustand/shallow';
// enums
import { TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { IFolder } from 'src/shared/types/folder';

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  onLoadData: VoidFunction;
}

export default function GroupsInTaskDialog({ open, onClose, onLoadData, ...other }: Props) {
  const { translate } = useLocales();

  const {
    tasks,
    taskLoading,
    selectedTask,
    setTasks,
    countTasks,
    setSelectedTask,
    setTaskLoading,
  } = useTask(
    (state) => ({ 
      tasks: state.datas,
      taskLoading: state.loading,
      selectedTask: state.selectedData,
      setTasks: state.setDatas,
      countTasks: state.countDatas,
      setSelectedTask: state.setSelectedData,
      setTaskLoading: state.setLoading,
    }),
    shallow
  );

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose} {...other}>
        <DialogTitle> 
          {`${translate('task.task')} ${selectedTask?.name}`} 
        </DialogTitle>

        <DialogContent>

          {(selectedTask !== null) ? 
            <>
              <Typography variant='caption'>
                {`${translate('cloud.folder')}: ${(selectedTask?.folder as IFolder).displayName}`} 
              </Typography>
              <GroupTransferList
                fatherId={(selectedTask.folder as IFolder)._id}
                fatherName={(selectedTask.folder as IFolder).displayName}
                transferMode={TransferType.folder}
                onClose={onClose}
                onLoadData={onLoadData}
                isFileManager={false}
              />
            </>
            : null
          }
          
        </DialogContent>
    </Dialog>
  );
}
