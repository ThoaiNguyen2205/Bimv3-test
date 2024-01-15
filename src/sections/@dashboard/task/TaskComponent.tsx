import React, { useEffect, useState } from 'react';
// hooks
import useDoubleClick from '../../../hooks/useDoubleClick';
//
import TaskTableRow from './TaskTableRow';
import TaskCard from './TaskCard';
// type
import { IFolder } from 'src/shared/types/folder';
import { IMainTask } from 'src/shared/types/mainTask';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
// apis
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import { TaskCategory } from 'src/shared/enums';
// ----------------------------------------------------------------------

type Props = {
  category: TaskCategory;
  rowType: string;
  row: IMainTask;
  selected: boolean;
  //
  onOpenRow: VoidFunction;
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  //
  detailsId: string;
  onDetails: VoidFunction;
};

type ILocalState = {
  openPopover: HTMLElement | null;
  groupsInFoler: IGroupInFolder[];
};

export default function TaskComponent({
  category,
  rowType,
  row,
  selected,
  onOpenRow,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  detailsId,
  onDetails,
}: Props) {
  const { folder } = row;

  const [localState, setLocalState] = useState<ILocalState>({
    openPopover: null,
    groupsInFoler: [],
  });

  useEffect(() => {
    const loadPermits = async () => {
      const params = {
        folder: (folder as IFolder)?._id,
      }
      const groupsInFolderRes = await groupInFoldersApi.getGroupsInFolder(params);
      setLocalState((prevState: ILocalState) => ({ ...prevState, groupsInFoler: groupsInFolderRes.data }));
    }
    loadPermits();
  }, [row]);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: event.currentTarget }));
  };

  const handleClosePopover = () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, openPopover: null }));
  };

  const handleClick = useDoubleClick({
    click: () => { onDetails(); },
    doubleClick: () => { onOpenRow(); },
  });

  return (
    <>
      {(rowType === 'table') ?
        <TaskTableRow
          category={category}
          handleClick={handleClick}
          groupsInFoler={localState.groupsInFoler}
          openPopover={localState.openPopover}
          data={row}
          handleClosePopover={handleClosePopover}
          handleOpenPopover={handleOpenPopover}
          //
          selected={selected}
          //
          onOpenRow={onOpenRow}
          onEditRow={onEditRow}
          onPermission={onPermission}
          onDeleteRow={onDeleteRow}
          //
          detailsId={detailsId}
        />
        :
        <TaskCard
          category={category}
          handleClick={handleClick}
          groupsInFoler={localState.groupsInFoler}
          openPopover={localState.openPopover}
          data={row}
          handleClosePopover={handleClosePopover}
          handleOpenPopover={handleOpenPopover}
          //
          selected={selected}
          //
          onOpenRow={onOpenRow}
          onEditRow={onEditRow}
          onPermission={onPermission}
          onDeleteRow={onDeleteRow}
          //
          detailsId={detailsId}
        />
      }

    </>
  );
}
