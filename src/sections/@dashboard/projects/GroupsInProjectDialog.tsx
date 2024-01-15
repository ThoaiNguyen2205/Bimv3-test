// @mui
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
} from '@mui/material';
// components
import { useSnackbar } from 'src/components/snackbar';
// AuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useProject from 'src/redux/projectStore';
import { shallow } from 'zustand/shallow';
// enums
import { TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  onClose: VoidFunction;
  onLoadData: VoidFunction;
}

export default function GroupsInProjectDialog({ open, onClose, onLoadData, ...other }: Props) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();

  const { 
    selectedProject,
  } = useProject(
    (state) => ({ 
      selectedProject: state.selectedData,
    }),
    shallow
  );

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose} {...other}>
        <DialogTitle> {`${translate('nav.project')} ${selectedProject?.name}`} </DialogTitle>

        <DialogContent>
          {(selectedProject !== null) ? 
            <GroupTransferList
              fatherId={selectedProject._id}
              fatherName={selectedProject.name}
              transferMode={TransferType.project}
              onClose={onClose}
              onLoadData={onLoadData}
              isFileManager={false}
            />
            : null
          }
          
        </DialogContent>
    </Dialog>
  );
}
