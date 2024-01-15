// @mui
import {
  Box,
  Stack,
  Dialog,
  Button,
  LinearProgress,
  MenuItem,
  TextField,
  DialogProps,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/iconify';
// locales
import { useLocales } from 'src/locales';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// apis
import groupInProjectsApi from 'src/api/groupInProjectsApi';
import logsApi from 'src/api/logsApi';
import projectsApi from 'src/api/projectsApi';
// enums
import { LogType } from 'src/shared/enums';
// type
import { IGroupInProjectReqCreate } from 'src/shared/types/groupInProject';
import { ISystemLogReqCreate } from 'src/shared/types/systemlog';
import { IGroup } from 'src/shared/types/group';
// zustand
import useProject from 'src/redux/projectStore';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';

// ----------------------------------------------------------------------

type ILocalState = {
  isCloning: boolean;
  progress01: number;
  progress01Show: boolean;
  progress02: number;
  progress02Show: boolean;
}

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  toProjects: string[];
  onClose: VoidFunction;
};

export default function CloneProjectPermissionDialog({
  open,
  toProjects,
  onClose,
  ...other
}: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();

  const {
    projects,
    loading,
    selectedProject,
    setProjects,
    countProjects,
    setSelectedProject,
    setLoading,
  } = useProject(
    (state) => ({ 
      projects: state.datas,
      loading: state.loading,
      selectedProject: state.selectedData,
      setProjects: state.setDatas,
      countProjects: state.countDatas,
      setSelectedProject: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    isCloning: false,
    progress01: 0,
    progress01Show: false,
    progress02: 0,
    progress02Show: false,
  });

  const onChangeProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterGroups = projects.filter((pi) => (pi._id === event.target.value));
    if (filterGroups.length > 0) {
      setSelectedProject(filterGroups[0]);
    }
  };

  const clonePermissions = async () => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isCloning: true,
      progress01Show: true,
      progress02Show: true,
    }));


    if (selectedProject !== null) {
      const params = {
        project: selectedProject._id,
      }
      const groupsInProjectRes = await groupInProjectsApi.getGroupsInProject(params);
      for (let i = 0; i < toProjects.length; i++) {
        const projectRes = await projectsApi.getReadById(toProjects[i]);
        setLocalState((prevState: ILocalState) => ({ ...prevState, progress02: Math.round((100 * (i + 1)) / toProjects.length) }));
        for (let j = 0; j < groupsInProjectRes.data.length; j++) {
          const permiti = groupsInProjectRes.data[j];
          const newGroupInProjectData: IGroupInProjectReqCreate = {
            project: toProjects[i],
            group: (permiti.group as IGroup)._id,
            isAdmin: permiti.isAdmin,
          }
          await groupInProjectsApi.postCreate(newGroupInProjectData);
          setLocalState((prevState: ILocalState) => ({ ...prevState, progress01: Math.round((100 * (j + 1)) / groupsInProjectRes.data.length) }));
        }
        // Ghi log
        const logData: ISystemLogReqCreate = {
          customer: user?.customer._id,
          father: user?.customer._id,
          content: `${user?.username} thay đổi nhóm người dùng trong dự án ${projectRes.name}`,
          type: LogType.Project,
          actionLink: '/dashboard/projects/list',
          createdBy: user?.id,
        }
        await logsApi.postCreate(logData);
      }
      
    }

    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isCloning: false,
      progress01Show: false,
      progress02Show: false,
    }));
    onClose();
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> {`${translate('common.clone_permission')}`} </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Stack direction="column" spacing={1} sx={{ mb: 3 }}>
          <TextField
            size='small'
            fullWidth
            select
            label={`${translate('nav.project')}`}
            value={selectedProject ? selectedProject._id : ''}
            onChange={onChangeProject}
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
              // maxWidth: { sm: 240 },
              textTransform: 'capitalize',
            }}
          >
            {projects.map((project) => (
              <MenuItem
                key={project._id}
                value={project._id}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body2',
                  textTransform: 'capitalize',
                }}
              >
                {`${project.name}`}
              </MenuItem>
            ))}
          </TextField>

          {localState.progress01Show ? <LinearProgress variant="determinate" value={localState.progress01} color="success" /> : null}
          {localState.progress02Show ? <LinearProgress variant="determinate" value={localState.progress02} color="success" /> : null}

        </Stack>

      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }} />
        {onClose && (
          <Button variant="outlined" color="inherit" startIcon={<Iconify icon="material-symbols:cancel-outline" />} onClick={onClose}>
            {`${translate('common.cancel')}`}
          </Button>
        )}
        <LoadingButton type="submit" variant="contained" loading={localState.isCloning} startIcon={<Iconify icon="mingcute:copy-fill" />} onClick={clonePermissions}>
          {`${translate('common.clone')}`}
        </LoadingButton>
      </DialogActions>

    </Dialog>
  );
}
