import React, { useEffect, useState } from 'react';
//
import DiscussionCard from './DiscussionCard';
// type
import { IFolder } from 'src/shared/types/folder';
import { IDiscussionTask } from 'src/shared/types/mainTask';
import { IGroupInFolder } from 'src/shared/types/groupInFolder';
// apis
import groupInFoldersApi from 'src/api/groupInFoldersApi';
// ----------------------------------------------------------------------

type Props = {
  rowType: string;
  row: IDiscussionTask;
  selected: boolean;
  //
  onEditRow: VoidFunction;
  onPermission: VoidFunction;
  onDeleteRow: VoidFunction;
  //
  replyId: string;
  onReply: VoidFunction;
  //
  handleOpenFilesDialog: VoidFunction;
  handleOpenInfoDialog: VoidFunction;
};

type ILocalState = {
  openPopover: HTMLElement | null;
  groupsInFoler: IGroupInFolder[];
};

export default function DiscussionComponent({
  row,
  selected,
  onEditRow,
  onPermission,
  onDeleteRow,
  //
  replyId,
  onReply,
  //
  handleOpenFilesDialog,
  handleOpenInfoDialog,
}: Props) {
  const { folder } = row.mainTask;

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

  return (
    <>
      <DiscussionCard
        handleComment={onReply}
        groupsInFoler={localState.groupsInFoler}
        openPopover={localState.openPopover}
        data={row}
        handleClosePopover={handleClosePopover}
        handleOpenPopover={handleOpenPopover}
        //
        selected={selected}
        //
        onEditRow={onEditRow}
        onPermission={onPermission}
        onDeleteRow={onDeleteRow}
        //
        replyId={replyId}
        //
        handleOpenFilesDialog={handleOpenFilesDialog}
        handleOpenInfoDialog={handleOpenInfoDialog}
      />
    </>
  );
}
