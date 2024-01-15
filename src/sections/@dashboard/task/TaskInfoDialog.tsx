// react
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Card,
  Divider,
  Stack,
  Button,
  Dialog,
  MenuItem,
  Typography,
  DialogProps,
  DialogContent,
  TextField,
} from '@mui/material';
// enums
import { TaskCategory } from '../../../shared/enums';
// type
import { IUser } from '../../../shared/types/user';
import { IInteractiveData } from '../../../shared/types/discussion';
// apis
import discussionsApi from '../../../api/discussionsApi';
// utils
import { fDate } from '../../../utils/formatTime';
// zustand store
import useTask from '../../../redux/taskStore';
import { shallow } from 'zustand/shallow';
// sections
import TaskViewsDiagraph from './TaskViewsDiagraph';
// components
import Iconify from '../../../components/iconify';
import LoadingWindow from '../../../components/loading-screen/LoadingWindow';
// locales
import { useLocales } from '../../../locales';
// ----------------------------------------------------------------------

type ILocalState = {
  nodays: number;
  days: string[];
  views: number[];
  markups: number[];
  discussion: number[];
  files: number[];
  isLoading: boolean;
};

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
}

export default function TaskInfoDialog({ open, onClose, ...other }: Props) {
  const { translate } = useLocales();

  const {
    selectedTask,
  } = useTask(
    (state) => ({ 
      selectedTask: state.selectedData,
    }),
    shallow
  );

  const lastedDays = [
    {id: '7', name: `7 ${translate('common.days')}`},
    {id: '15', name: `15 ${translate('common.days')}`},
    {id: '30', name: `30 ${translate('common.days')}`},
  ]

  const onChangeDays = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, nodays: parseInt(event?.target.value) }));
  }
  
  const [localState, setLocalState] = useState<ILocalState>({
    nodays: 7,
    days: [],
    views: [],
    markups: [],
    discussion: [],
    files: [],
    isLoading: false,
  });

  useEffect(() => {
    const loadInteractiveData = async () => {
      if (selectedTask !== null) {
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          isLoading: true,
        }));
        const data: IInteractiveData = await discussionsApi.getInteractiveData(selectedTask._id, localState.nodays);
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          days: data.days,
          views: data.views,
          markups: data.markups,
          discussion: data.discussions,
          files: data.files,
          isLoading: false,
        }));
      }
    }
    loadInteractiveData();
  }, [open, localState.nodays]);

  const onCancel = () => {
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other} >
      <DialogContent sx={{ padding: '0 !important' }}>
        {selectedTask ?
          <Card sx={{ textAlign: 'center' }}>
            {localState.isLoading ?
              <Box sx={{ height: 380 }}>
                <LoadingWindow />
              </Box>
              :
              <>
                {selectedTask.category === TaskCategory.GeneralDiscussion ? 
                  <TaskViewsDiagraph
                    chart={{
                      categories: localState.days,
                      seriesData: [
                        {
                          data: [
                            { name: `${translate('menu.discussion')}`, data: localState.discussion },
                            { name: `${translate('cloud.upload')}`, data: localState.files },
                          ],
                        },
                      ],
                    }}
                  />
                  : null
                }
                {selectedTask.category === TaskCategory.FileRequestCloud ? 
                  <TaskViewsDiagraph
                    chart={{
                      categories: localState.days,
                      seriesData: [
                        {
                          data: [
                            { name: `${translate('documents.view')}`, data: localState.views },
                            { name: `${translate('menu.discussion')}`, data: localState.discussion },
                            { name: `${translate('cloud.upload')}`, data: localState.files },
                          ],
                        },
                      ],
                    }}
                  />
                  : null
                }
                {selectedTask.category.includes('Collaboration') ? 
                  <TaskViewsDiagraph
                    chart={{
                      categories: localState.days,
                      seriesData: [
                        {
                          data: [
                            { name: `${translate('documents.view')}`, data: localState.views },
                            { name: `${translate('coordinator.markup')}`, data: localState.markups },
                            { name: `${translate('menu.discussion')}`, data: localState.discussion },
                            { name: `${translate('cloud.upload')}`, data: localState.files },
                          ],
                        },
                      ],
                    }}
                  />
                  : null
                }
                {selectedTask.category === TaskCategory.PointCloud ? 
                  <TaskViewsDiagraph
                    chart={{
                      categories: localState.days,
                      seriesData: [
                        {
                          data: [
                            { name: `${translate('documents.view')}`, data: localState.views },
                            { name: `${translate('menu.discussion')}`, data: localState.discussion },
                            { name: `${translate('cloud.upload')}`, data: localState.files },
                          ],
                        },
                      ],
                    }}
                  />
                  : null
                }
              </>
            }
            <TextField
              name='category'
              size='small'
              fullWidth
              select
              label={`${translate('common.statistics')}`}
              value={localState.nodays || 7}
              onChange={onChangeDays}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 260,
                    },
                  },
                },
              }}
              sx={{
                mt: localState.isLoading ? 3 : 0,
                maxWidth: { sm: 240 },
                textTransform: 'capitalize',
              }}
            >
              {lastedDays.map((option) => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    textTransform: 'capitalize',
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    {option.name}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5 }}>
              {selectedTask?.name}
            </Typography>

            {/* {selectedTask.category !== TaskCategory.GeneralDiscussion ? 
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedTask?.description}
              </Typography>
              : null
            } */}

            <Divider sx={{ borderStyle: 'dashed', mt: 3 }} />

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ py: 1 }}>
              <Box>
                <Iconify icon="mingcute:time-line" width={24} height={24} />
                <Typography variant="body2">{`${fDate(selectedTask?.createdAt)}`}</Typography>
              </Box>

              <Box>
                <Iconify icon="ph:user-circle-duotone" width={26} height={26} />
                <Typography variant="body2">{`${(selectedTask?.createdBy as IUser).username}`}</Typography>
              </Box>

            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack
              direction='row'
              sx={{ mt: 3, mb: 3 }}
              alignItems='center'
              display="inline-flex"
            >
              <Button color="inherit" variant="outlined" onClick={onCancel} startIcon={<Iconify icon="bxs:check-shield" />} >
                {`${translate('common.close')}`}
              </Button>
            </Stack>
          </Card>
          :
          null
        }
      </DialogContent>
    </Dialog>
  );
}
