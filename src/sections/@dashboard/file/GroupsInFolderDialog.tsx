// @mui
import {
  Dialog,
  DialogTitle,
  DialogProps,
  DialogContent,
} from '@mui/material';
// Locales
import { useLocales } from 'src/locales';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
// enums
import { TransferType } from 'src/shared/enums';
// sections
import GroupTransferList from '../groups-transfer/GroupTransferList';
import { IFolder } from 'src/shared/types/folder';
// ----------------------------------------------------------------------

interface Props extends DialogProps {
  open: boolean;
  isFileManager: boolean;
  onClose: VoidFunction;
  onLoadData: (nodeId: string) => void;
}

export default function GroupsInFolderDialog({ open, isFileManager, onClose, onLoadData, ...other }: Props) {
  const { translate } = useLocales();

  const {
    selectedFather,
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFather: state.selectedFather,
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const loadFatherData = () => {
    if (isFileManager) {
      onLoadData((selectedFather as IFolder)._id);
    }
  }
    
  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose} {...other}>
        <DialogTitle> {`${translate('cloud.folder')} ${selectedFolder?.displayName}`} </DialogTitle>

        <DialogContent>
          {(selectedFolder !== null) ? 
            <GroupTransferList
              fatherId={selectedFolder._id}
              fatherName={selectedFolder.displayName}
              transferMode={TransferType.folder}
              onClose={onClose}
              onLoadData={() => loadFatherData()}
              isFileManager={isFileManager}
            />
            : null
          }
          
        </DialogContent>
    </Dialog>
  );
}
