import React, { useEffect, useState } from 'react';
// hooks
import useDoubleClick from '../../../../hooks/useDoubleClick';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
// components
import { useSnackbar } from '../../../../components/snackbar';
//
import TrashTableRow from './TrashTableRow';
// type
import { IFileOrFolder, IFolder, IFileAndFolderSearching } from 'src/shared/types/folder';
import { IFile } from 'src/shared/types/file';
// zustand store
import useFolder from 'src/redux/foldersStore';
import { shallow } from 'zustand/shallow';
import { useLocales } from 'src/locales';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
// ----------------------------------------------------------------------

type Props = {
  row: IFileOrFolder;
  selected: boolean;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onRestoreRow: VoidFunction;
  // //
  detailsId: string;
  onDetails: VoidFunction;
};

type ILocalState = {
  openPopover: HTMLElement | null;
  groupsInFoler: IGroupInFolder[];
  fLinks: IFolder[];
};

export default function TrashComponent({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onRestoreRow,
  detailsId,
  onDetails,
}: Props) {
  const { translate } = useLocales();
  const {
    selectedFolder,
  } = useFolder(
    (state) => ({ 
      selectedFolder: state.selectedData,
    }),
    shallow
  );

  const { type, data } = row;
  const size = (type === 'folder') ? '...' : (data as IFile).size;
  const version = (type === 'folder') ? (data as IFolder).version : `${(data as IFile)?.version}.${(data as IFile)?.subVersion}`;

  let dataType = 'folder';
  if (type === 'file') {
    const fi = data as IFile;
    const storeFile = fi.storeFile;
    const dotIndex = storeFile.lastIndexOf('.');
    dataType = storeFile.substring(dotIndex + 1);
  }

  const { enqueueSnackbar } = useSnackbar();
  const { copy } = useCopyToClipboard();

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    groupsInFoler: [],
    fLinks: [],
  });

  useEffect(() => {
    const loadPermitsAndLocations = async () => {
      if (type === 'folder') {
        const params = {
          folder: (data as IFolder)?._id,
        }
        const groupsInProjectRes = await groupInFoldersApi.getGroupsInFolder(params);
        setLocalState((prevState: ILocalState) => ({
          ...prevState,
          groupsInFoler: groupsInProjectRes.data,
        }));
      }
    }
    loadPermitsAndLocations();
    
  }, [data]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  return (
    <>
      <TrashTableRow
        dataType={dataType}
        size={size}
        groupsInFoler={localState.groupsInFoler}
        fLinks={localState.fLinks}
        openPopover={localState.openPopover}
        type={type}
        data={data}
        version={version}
        handleClosePopover={handleClosePopover}
        handleOpenPopover={handleOpenPopover}
        selected={selected}
        onSelectRow={onSelectRow}
        onDeleteRow={onDeleteRow}
        onRestoreRow={onRestoreRow}
        detailsId={detailsId}
        onDetails={onDetails}
      />
    </>
  );
}
