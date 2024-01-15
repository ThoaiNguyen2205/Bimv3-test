import { useState, useCallback, useEffect } from 'react';
// @mui
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Stack,
  TableContainer,
  Table,
  TableBody,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import {
  useTable,
  TableNoData,
  getComparator,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
// apis
import groupInProjectsApi from 'src/api/groupInProjectsApi';
import groupsApi from 'src/api/groupsApi';
import foldersApi from 'src/api/foldersApi';
import groupInFoldersApi from 'src/api/groupInFoldersApi';
import logsApi from 'src/api/logsApi';
// type
import { IGroup } from 'src/shared/types/group';
import { IGroupInProject, IGroupInProjectReqCreate } from 'src/shared/types/groupInProject';
import { IGroupInFolderReqCreate } from 'src/shared/types/groupInFolder';
import { ISystemLogReqCreate } from 'src/shared/types/systemlog';
import { ISubFolderPermitReqCreate } from 'src/shared/types/folder';
// useAuthContext
import { useAuthContext } from 'src/auth/useAuthContext';
// Locales
import { useLocales } from 'src/locales';
// AuthContext
// enums
import { TransferType, PermissionType, LogType } from 'src/shared/enums';
// .
import LeftTableRow from './LeftTableRow';
import ProjectGroupsTableRow from './ProjectGroupsTableRow';
import FolderGroupsTableRow from './FolderGroupsTableRow';
import GroupTableToolbar from './GroupTableToolbar';
// utils
import { isSameId, onlyInLeft } from 'src/sections/utis/compareObjectsArray';
import _ from 'lodash';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// ----------------------------------------------------------------------

type ILocalState = {
  left: IGroup[],
  right: IGroup[],
  checked: IGroup[],
  // isProjectAdmin
  adminChecked: IGroup[];

  // isEdit
  editChecked: IGroup[];
  // isUpdate
  updateChecked: IGroup[];
  // isDownload
  downloadChecked: IGroup[];
  // isApprove
  approveChecked: IGroup[];
  // isConfirm
  confirmChecked: IGroup[];
  //
  copyPermit: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
}

// ----------------------------------------------------------------------

type FormProps = {
  fatherId: string;
  fatherName: string;
  transferMode: TransferType;
  onClose: VoidFunction;
  onLoadData: VoidFunction;
  isFileManager: boolean;
};

function not(a: IGroup[], b: IGroup[]) {
  return a.filter((value) => b.indexOf(value) === -1);
  // return a.filter((aValue) => b.filter((bValue) => aValue._id !== bValue._id));
}

function intersection(a: IGroup[], b: IGroup[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: IGroup[], b: IGroup[]) {
  return [...a, ...not(b, a)];
}

export default function GroupTransferList({ fatherId, fatherName, transferMode, onClose, onLoadData, isFileManager }: FormProps) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  
  const [localState, setLocalState] = useState<ILocalState>({
    left: [],
    right: [],
    checked: [],
    adminChecked: [],
    editChecked: [],
    updateChecked: [],
    downloadChecked: [],
    approveChecked: [],
    confirmChecked: [],
    //
    copyPermit: isFileManager,
    isSubmitting: false,
    isLoading: false,
  });

  const loadAllGroups = useCallback(async (customerId: string, fatherId: string, mode: TransferType) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      isLoading: true,
    }));
    if (mode === TransferType.project) {
      // prepare for left
      const groupsRes = await groupsApi.getByCustomer(customerId); 
      const preLeft = groupsRes.data;
      
      // prepare for right
      const params = {
        project: fatherId,
      }
      const groupsInProjectRes = await groupInProjectsApi.getGroupsInProject(params);
      const preRight: IGroup[] = [];
      const preAdminChecked: IGroup[] = [];
      for (const gipi of groupsInProjectRes.data) {
        const groupi: IGroup = gipi.group as IGroup;
        preRight.push(groupi);
        if (gipi.isAdmin === true) {
          preAdminChecked.push(groupi);
        }
      }

      const left = onlyInLeft(preLeft, preRight, isSameId);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        left: left,
        adminChecked: preAdminChecked,
        right: preRight,
        isLoading: false,
      }));
    }
    
    if (mode === TransferType.folder) {
      // prepare for left
      const preLeft: IGroup[] = [];
      // Kiểm tra là thư mục gốc của zone hay không
      const folResponse = await foldersApi.getReadById(fatherId);
      const pathSplit = folResponse.path.split('/');
      const lastFolder = pathSplit[pathSplit.length - 2];

      const fatherPath = folResponse.path.slice(0, folResponse.path.lastIndexOf(lastFolder + '/'));
      const fatherFolder = await foldersApi.getFolderByPath(fatherPath, lastFolder);

      if (lastFolder === 'bn_wip' || lastFolder === 'bn_shared' || lastFolder === 'bn_public' || lastFolder === 'bn_archived') {
        // Lấy dữ liệu tất cả nhóm thuộc cùng dự án
        const param = {
          project: user?.project._id,
        }
        const allUC = await groupInProjectsApi.getGroupsInProject(param);
        for (const item of allUC.data) {
          preLeft.push((item.group as IGroup));
        };
      } else {
        // Lấy dữ liệu các nhóm thuộc thư mục cha
        const param = {
          folder: fatherFolder.data[0]._id,
        }
        const allFatherUC = await groupInFoldersApi.getGroupsInFolder(param);
        for (const item of allFatherUC.data) {
          preLeft.push((item.group as IGroup));
        };
      }
      
      // prepare for right
      const params = {
        folder: fatherId,
      }
      const groupsInProjectRes = await groupInFoldersApi.getGroupsInFolder(params);
      const preRight: IGroup[] = [];
      const preEditChecked: IGroup[] = [];
      const preUpdateChecked: IGroup[] = [];
      const preDownloadChecked: IGroup[] = [];
      const preApproveChecked: IGroup[] = [];
      const preConfirmChecked: IGroup[] = [];
      for (const gipi of groupsInProjectRes.data) {
        const groupi: IGroup = gipi.group as IGroup;
        preRight.push(groupi);
        if (gipi.isEdit === true) {
          preEditChecked.push(groupi);
        }
        if (gipi.isUpdate === true) {
          preUpdateChecked.push(groupi);
        }
        if (gipi.isDownload === true) {
          preDownloadChecked.push(groupi);
        }
        if (gipi.isApprove === true) {
          preApproveChecked.push(groupi);
        }
        if (gipi.isConfirm === true) {
          preConfirmChecked.push(groupi);
        }
      }

      const left = onlyInLeft(preLeft, preRight, isSameId);
      setLocalState((prevState: ILocalState) => ({
        ...prevState,
        left: left,
        editChecked: preEditChecked,
        updateChecked: preUpdateChecked,
        downloadChecked: preDownloadChecked,
        approveChecked: preApproveChecked,
        confirmChecked: preConfirmChecked,
        right: preRight,
        isLoading: false,
      }));

    }
    
  }, []);

  useEffect(() => {
    loadAllGroups(user?.customer._id, fatherId, transferMode);
  }, [user]);

  const leftChecked = intersection(localState.checked, localState.left);
  const rightChecked = intersection(localState.checked, localState.right);

  const numberOfChecked = (items: IGroup[]) => intersection(localState.checked, items).length;

  const handleCheckedRight = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      right: localState.right.concat(leftChecked),
      left: not(localState.left, leftChecked),
      checked: not(localState.checked, leftChecked),
    }));
  };

  const handleCheckedLeft = () => {
    setLocalState((prevState: ILocalState) => ({ 
      ...prevState,
      right: not(localState.right, rightChecked),
      left: localState.left.concat(rightChecked),
      checked: not(localState.checked, rightChecked),
    }));
  };

  const customTable = (title: React.ReactNode, mode: string, items: IGroup[]) => {
    const {
      order,
      orderBy,
      selected,
      setSelected,
      onSelectRow,
      onSelectAllRows,
    } = useTable();

    // Filter group by name
    const [filterName, setFilterName] = useState<string>('');
    const isFiltered = filterName !== '';

    const applyFilter = ({
      inputData,
      comparator,
      filterName,
    }: {
      inputData: IGroup[];
      comparator: (a: any, b: any) => number;
      filterName: string;
    }) => {
    
      const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  
      stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
      });
      
      inputData = stabilizedThis.map((el) => el[0]);
  
      if (filterName) {
        const byName = inputData.filter(
          (group) => group.groupname.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
        const byTitle = inputData.filter(
          (group) => group.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
        
        inputData = _.union(byName, byTitle );
      }
  
      return inputData;
    }
  
    const dataFiltered = applyFilter({
      inputData: items,
      comparator: getComparator(order, orderBy),
      filterName: filterName,
    });

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement> | null) => {
      if (event !== null) {
        setFilterName(event.target.value);
      }
    };

    // End filter group

    useEffect(() => {
      setSelected([]);
    }, [items]);

    const handleToggleAll = (items: IGroup[]) => () => {
      if (numberOfChecked(items) === items.length) {
        setLocalState((prevState: ILocalState) => ({ ...prevState, checked: not(localState.checked, items) }));
        onSelectAllRows(
          false,
          items.map((row: any) => row._id)
        );
      } else {
        setLocalState((prevState: ILocalState) => ({ ...prevState, checked: union(localState.checked, items) }));
        onSelectAllRows(
          true,
          items.map((row: any) => row._id)
        );
      }
    };

    const handleToggle = (rowId: string) => {
      const item = items.filter(i => i._id === rowId)[0];
      const currentIndex = localState.checked.indexOf(item);
      const newChecked = [...localState.checked];

      if (currentIndex === -1) {
        newChecked.push(item);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setLocalState((prevState: ILocalState) => ({ ...prevState, checked: newChecked }));
      onSelectRow(rowId);
    };

    // Permissions check
    const handleTogglePermissions = (rowId: string, permit: PermissionType) => {
      const item = items.filter(i => i._id === rowId)[0];

      const setAdmin = (item: IGroup) => {
        const currentIndex = localState.adminChecked.indexOf(item);
        const newChecked = [...localState.adminChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, adminChecked: newChecked }));
      }

      const setEdit = (item: IGroup) => {
        const currentIndex = localState.editChecked.indexOf(item);
        const newChecked = [...localState.editChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, editChecked: newChecked }));
      }

      const setUpdate = (item: IGroup) => {
        const currentIndex = localState.updateChecked.indexOf(item);
        const newChecked = [...localState.updateChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, updateChecked: newChecked }));
      }

      const setDownload = (item: IGroup) => {
        const currentIndex = localState.downloadChecked.indexOf(item);
        const newChecked = [...localState.downloadChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, downloadChecked: newChecked }));
      }

      const setApprove = (item: IGroup) => {
        const currentIndex = localState.approveChecked.indexOf(item);
        const newChecked = [...localState.approveChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, approveChecked: newChecked }));
      }

      const setConfirm = (item: IGroup) => {
        const currentIndex = localState.confirmChecked.indexOf(item);
        const newChecked = [...localState.confirmChecked];
        if (currentIndex === -1) {
          newChecked.push(item);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setLocalState((prevState: ILocalState) => ({ ...prevState, confirmChecked: newChecked }));
      }

      switch (permit) {
        case PermissionType.admin:
          setAdmin(item);
          break;
        case PermissionType.edit:
          setEdit(item);
          break;
        case PermissionType.update:
          setUpdate(item);
          break;
        case PermissionType.download:
          setDownload(item);
          break;
        case PermissionType.approve:
          setApprove(item);
          break;
        case PermissionType.confirm:
          setConfirm(item);
          break;
      }
      
    };

    return (
      <Card sx={{ borderRadius: 1.5 }}>
        <CardHeader
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
              disabled={items.length === 0}
              inputProps={{ 'aria-label': 'all items selected' }}
            />
          }
          title={title}
          subheader={`${translate('common.selected')} ${numberOfChecked(items)}/${items.length}`}
          sx={{ pt: 1, pb: 1 }}
        />

        {(mode === TransferType.left) ?
          <>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-start" sx={{ textAlign: 'right', pb: 0 }}>
              <GroupTableToolbar
                isFiltered={isFiltered}
                filterName={filterName}
                onFilterName={(e) => handleFilter(e)}
                onResetFilter={() => setFilterName('')}
              />
            </Stack>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-end" sx={{ textAlign: 'right', pr: 3, pb: 0 }}>
              <Typography variant='caption'>{`${translate('common.all')} ${translate('nav.groups')} ${translate('common.of')} ${user?.customer.name}`}</Typography>
            </Stack>
          </>
          :
          null
        }

        {(mode === TransferType.project) ?
          <>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-start" sx={{ textAlign: 'right', pb: 0 }}>
              <GroupTableToolbar
                isFiltered={isFiltered}
                filterName={filterName}
                onFilterName={(e) => handleFilter(e)}
                onResetFilter={() => setFilterName('')}
              />
            </Stack>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-end" sx={{ textAlign: 'right', pr: 3, pb: 0 }}>
              <Typography variant='caption'>{`${translate('common.project_admin')}`}</Typography>
            </Stack>
          </>
          :
          null
        }

        {(mode === TransferType.folder) ?
          <>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-start" sx={{ textAlign: 'right', pb: 0 }} >
              <GroupTableToolbar
                isFiltered={isFiltered}
                filterName={filterName}
                onFilterName={(e) => handleFilter(e)}
                onResetFilter={() => setFilterName('')}
              />
            </Stack>
            <Stack component="span" direction="row" alignItems="center" justifyContent="flex-end" sx={{ textAlign: 'right', pr: 1, pb: 0 }} >
              <Typography variant='caption' >{`${translate('common.edit')}`}</Typography>
              <Typography variant='caption' sx={{ ml: 2.2 }}>{`${translate('common.update')}`}</Typography>
              <Typography variant='caption' sx={{ ml: 1.5 }}>{`${translate('common.download')}`}</Typography>
              <Typography variant='caption' sx={{ ml: 1.0 }}>{`${translate('common.confirm')}`}</Typography>
              <Typography variant='caption' sx={{ ml: 1.0 }}>{`${translate('common.approve')}`}</Typography>
            </Stack>
          </>
          :
          null
        }

        <Divider />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          {localState.isLoading ? 
            <LoadingWindow />
            :
            <Scrollbar sx={{ maxHeight: 4 * 72, minHeight: 4 * 72 }} >
              <Table size={'medium'} sx={{ minWidth: 300 }}>
                {(mode === TransferType.left) ?
                  <TableBody>
                    {dataFiltered.map((row: IGroup) => (
                      <LeftTableRow
                        key={row._id}
                        row={row}
                        selected={selected.includes(row._id)}
                        onSelectRow={() => handleToggle(row._id) }
                      />
                    ))}
                    <TableNoData isNotFound={(dataFiltered.length < 1)} />
                  </TableBody>
                  :
                  null
                }
                {(mode === TransferType.project) ?
                  <TableBody>
                    {dataFiltered.map((row: IGroup) => (
                      <ProjectGroupsTableRow
                        key={row._id}
                        row={row}
                        selected={selected.includes(row._id)}
                        onSelectRow={() => handleToggle(row._id) }
                        onToggleAdmin={() => handleTogglePermissions(row._id, PermissionType.admin) }
                        adminChecked={localState.adminChecked.filter(value => value._id === row._id).length > 0}
                      />
                    ))}
                    <TableNoData isNotFound={(dataFiltered.length < 1)} />
                  </TableBody>
                  :
                  null
                }
                {(mode === TransferType.folder) ?
                  <TableBody>
                    {dataFiltered.map((row: IGroup) => (
                      <FolderGroupsTableRow
                        key={row._id}
                        row={row}
                        selected={selected.includes(row._id)}
                        onSelectRow={() => handleToggle(row._id) }

                        onToggleEdit={() => handleTogglePermissions(row._id, PermissionType.edit) }
                        editChecked={localState.editChecked.filter(value => value._id === row._id).length > 0}

                        onToggleUpdate={() => handleTogglePermissions(row._id, PermissionType.update) }
                        updateChecked={localState.updateChecked.filter(value => value._id === row._id).length > 0}

                        onToggleDownload={() => handleTogglePermissions(row._id, PermissionType.download) }
                        downloadChecked={localState.downloadChecked.filter(value => value._id === row._id).length > 0}

                        onToggleConfirm={() => handleTogglePermissions(row._id, PermissionType.confirm) }
                        confirmChecked={localState.confirmChecked.filter(value => value._id === row._id).length > 0}

                        onToggleApprove={() => handleTogglePermissions(row._id, PermissionType.approve) }
                        approveChecked={localState.approveChecked.filter(value => value._id === row._id).length > 0}
                      />
                    ))}
                    <TableNoData isNotFound={(dataFiltered.length < 1)} />
                  </TableBody>
                  :
                  null
                }
              </Table>
            </Scrollbar>
          }
        </TableContainer>
      </Card>
    )
  };

  const handleSave = async () => {
    setLocalState((prevState: ILocalState) => ({ ...prevState, isSubmitting: true }));
    // In case project permission
    if (transferMode === TransferType.project) {
      // Xóa tất cả các nhóm trong dự án hiện tại
      await groupInProjectsApi.deleteInProject(fatherId);
      // Thêm lại dữ liệu nhóm trong dự án
      for (const sel of localState.right) {
        const newGroupInProjectData: IGroupInProjectReqCreate = {
          project: fatherId,
          group: sel._id,
          isAdmin: (localState.adminChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
        }
        await groupInProjectsApi.postCreate(newGroupInProjectData);
      }

      // Ghi log
      const logData: ISystemLogReqCreate = {
        customer: user?.customer._id,
        father: user?.customer._id,
        content: `${user?.username} thay đổi nhóm người dùng trong dự án ${fatherName}`,
        type: LogType.Project,
        actionLink: '/dashboard/projects/list',
        createdBy: user?.id,
      }
      await logsApi.postCreate(logData);

    }

    // In case folder permission
    if (transferMode === TransferType.folder) {
      // Xóa tất cả các nhóm trong folder hiện tại
      await groupInFoldersApi.deleteInFolder(fatherId);
      // Thêm lại dữ liệu nhóm trong folder
      const groupIds: {
        group: string,
        isEdit: boolean,
        isUpdate: boolean,
        isDownload: boolean,
        isApprove: boolean,
        isConfirm: boolean,
      }[] = [];
      for (const sel of localState.right) {
        groupIds.push({
          group: sel._id,
          isEdit: (localState.editChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isUpdate: (localState.updateChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isDownload: (localState.downloadChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isApprove: (localState.approveChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isConfirm: (localState.confirmChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
        });
        const newGroupInProjectData: IGroupInFolderReqCreate = {
          folder: fatherId,
          group: sel._id,
          isEdit: (localState.editChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isUpdate: (localState.updateChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isDownload: (localState.downloadChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isApprove: (localState.approveChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
          isConfirm: (localState.confirmChecked.filter(i => i._id === sel._id).length > 0) ? true : false,
        }
        await groupInFoldersApi.postCreate(newGroupInProjectData);
      }

      // Áp permit cho tất cả thư mục con: đệ quy
      if (localState.copyPermit === true) {
        const applyDto: ISubFolderPermitReqCreate = {
          fatherId: fatherId,
          groupIds: JSON.stringify(groupIds),
          uid: user?.id,
          role: user?.class.uclass,
        }
        await foldersApi.applySubFolderPermit(applyDto);
      }
      
      // Ghi log
      const logData: ISystemLogReqCreate = {
        customer: user?.customer._id,
        father: user?.project._id,
        content: `${user?.username} thay đổi nhóm người dùng trong thư mục ${fatherName}`,
        type: LogType.Project,
        actionLink: '/dashboard/cloud/files-manager',
        createdBy: user?.id,
      }
      await logsApi.postCreate(logData);
    }
    setLocalState((prevState: ILocalState) => ({ ...prevState, isSubmitting: false }));
    onLoadData();
    onClose();
  }

  const handleCopy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      copyPermit: event.target.checked,
    }));
  };

  return (
    <CardContent sx={{ spacing: 1 }} >
      <Grid container justifyContent="center" alignItems="center" sx={{ width: 'auto', p: 0 }} >
        <Grid item xs={12} md={4} >{customTable(`${translate('common.available_groups')}`, TransferType.left, localState.left )}</Grid>
        <Grid item xs={12} md={2}>
          <Grid container direction="column" alignItems="center" sx={{ p: 1 }} >
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
              sx={{ my: 1 }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
            </Button>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
              sx={{ my: 1 }}
            >
              <Iconify icon="eva:arrow-ios-back-fill" width={18} />
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>{customTable(`${translate('common.selected_groups')}`, transferMode, localState.right )}</Grid>
      </Grid>
      <Stack spacing={3} alignItems="flex-end" sx={{ m: 2 }}>
        <Stack direction='row'>
          {(isFileManager === true) ?
            <FormControlLabel
              control={<Checkbox defaultChecked onChange={handleCopy} />}
              label={`${translate('cloud.apply_father_permit_forsub')}`}
            />
            : null
          }

          <Button color="inherit" variant="outlined" onClick={onClose} sx={{ mr: 3 }} startIcon={<Iconify icon="material-symbols:cancel-outline" />}>
            {`${translate('common.cancel')}`}
          </Button>

          <LoadingButton variant="contained" loading={localState.isSubmitting} onClick={handleSave} startIcon={<Iconify icon="ic:sharp-group-add" />} >
            {`${translate('common.save_changes')}`}
          </LoadingButton>
        </Stack>
      </Stack>
    </CardContent>
  );
}
