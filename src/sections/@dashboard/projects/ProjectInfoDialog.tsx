// @mui
import {
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Button,
  Dialog,
  Typography,
  DialogProps,
  DialogContent,
  Tooltip,
} from '@mui/material';
// components
import Image from '../../../components/image';
import Iconify from '../../../components/iconify';
import SvgColor from '../../../components/svg-color';
// locales
import { useLocales } from 'src/locales';
// zustand store
import useProject from 'src/redux/projectStore';
import { shallow } from 'zustand/shallow';
// type
import { IUser } from 'src/shared/types/user';
import { IProjectCategory } from 'src/shared/types/projectCategory';
// utils
import { fDate } from 'src/utils/formatTime';


// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  setDefaultProject: VoidFunction;
}

export default function ProjectInfoDialog({ open, onClose, setDefaultProject, ...other }: Props) {
  const { translate } = useLocales();
  const { 
    selectedProject,
  } = useProject(
    (state) => ({ 
      selectedProject: state.selectedData,
    }),
    shallow
  );

  const onCancel = () => {
    onClose();
  };

  const onSetDefaultProject = () => {
    setDefaultProject();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other} >
      <DialogContent sx={{ padding: '0 !important' }}>
        {selectedProject ?
          <Card sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <SvgColor
                src="/assets/shape_avatar.svg"
                sx={{
                  width: 144,
                  height: 62,
                  zIndex: 10,
                  left: 0,
                  right: 0,
                  bottom: -26,
                  mx: 'auto',
                  position: 'absolute',
                  color: 'background.paper',
                }}
              />

              <Tooltip title={(selectedProject?.category !== undefined) ? (selectedProject?.category as IProjectCategory).name : ''} placement='top'>
                <Stack alignItems="center">
                  {(selectedProject?.category !== undefined) ?
                    <Avatar
                      alt={selectedProject?.name}
                      src={process.env.REACT_APP_APIFILE + 'images/' + (selectedProject?.category as IProjectCategory).logo}
                      sx={{
                        width: 64,
                        height: 64,
                        zIndex: 11,
                        left: 0,
                        right: 0,
                        bottom: -32,
                        mx: 'auto',
                        position: 'absolute',
                      }}
                    />
                    :
                    null
                  }
                </Stack>
              </Tooltip>

              <Image src={process.env.REACT_APP_APIFILE + 'images/' + selectedProject?.avatar} alt={selectedProject?.name} ratio="16/9" />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 6, mb: 0.5 }}>
              {selectedProject?.name}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedProject?.address}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {selectedProject?.description}
            </Typography>

            <Divider sx={{ borderStyle: 'dashed', mt: 3 }} />

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ py: 1 }}>
              <Box>
                <Iconify icon="mingcute:time-line" width={24} height={24} />
                <Typography variant="body2">{`${fDate(selectedProject?.createdAt)}`}</Typography>
              </Box>

              <Box>
                <Iconify icon="ph:user-circle-duotone" width={26} height={26} />
                <Typography variant="body2">{`${(selectedProject?.createdBy as IUser).username}`}</Typography>
              </Box>

            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack
              direction='row'
              sx={{ mt: 3, mb: 3 }}
              alignItems='center'
              display="inline-flex"
            >
              <Button
                color="warning"
                variant="outlined"
                onClick={onSetDefaultProject}
                startIcon={<Iconify icon="solar:star-bold" />}
                sx={{ mr: 3 }}
              >
                {`${translate('common.set_default')}`}
              </Button>
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
