// @mui
import {
  Avatar,
  Button,
  IconButton,
  ListItem,
  ListItemText,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
// locales
import { useLocales } from 'src/locales';
// type
import { IGroup } from 'src/shared/types/group';
// zustand
import useGroup from 'src/redux/groupStore';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';
import useUclass from 'src/redux/uclassStore';
import { IUclassReqCreate } from 'src/shared/types/uclass';
import userclassesApi from 'src/api/userclassesApi';
import { useAuthContext } from 'src/auth/useAuthContext';
// ----------------------------------------------------------------------

type Props = {
  group: IGroup;
  users: string[];
  loadAllUser: VoidFunction;
  onClose: () => void;
  // onSelectGroup: (group: IGroup) => void;
};

export default function SelectGroupItem({ group, users, loadAllUser, onClose }: Props) {
  const { user } = useAuthContext();
  const isDesktop = useResponsive('up', 'lg');
  const { translate } = useLocales();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    uclasses,
    loading,
    selectedUclass,
    setUclasses,
    countUclasses,
    setSelectedUclass,
    setLoading,
  } = useUclass(
    (state) => ({ 
      uclasses: state.datas,
      loading: state.loading,
      selectedUclass: state.selectedData,
      setUclasses: state.setDatas,
      countUclasses: state.countDatas,
      setSelectedUclass: state.setSelectedData,
      setLoading: state.setLoading,
    }),
    shallow
  );

  const {
    selectedGroup,
  } = useGroup(
    (state) => ({ 
      selectedGroup: state.selectedData,
    }),
    shallow
  );

  const onSelectGroup = async (group: IGroup) => {
    setIsSubmitting(true);
    if (selectedUclass !== null && group !== null) {
      const updateData: IUclassReqCreate = {
        groupId: group._id,
        groupName: group.groupname,
        groupTitle: group.title,
        updatedById: user?.id,
        updatedByName: user?.username,
      }
      
      const selectedUClassId = selectedUclass?._id ?? '';
      await userclassesApi.updateById(selectedUClassId, updateData);
    }
    if (users.length > 0 && group !== null) {
      const updateData: IUclassReqCreate = {
        groupId: group._id,
        groupName: group.groupname,
        groupTitle: group.title,
        updatedById: user?.id,
        updatedByName: user?.username,
      }
      for (const uid of users) {
        const ucFilter = uclasses.filter(uc => uc._id === uid);
        if (ucFilter.length > 0) {
          const ui = ucFilter[0];
          await userclassesApi.updateById(ui._id, updateData);
        }
      }
    }
    loadAllUser();
    setIsSubmitting(false);
    onClose();
  }
  
  return (
    <>
      <ListItem
        disableGutters
        sx={{
          flexGrow: 1,
          pr: 1,
          pb: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: '#00ab5526',
          px: 2,
          mb: 1,
          backgroundColor: (group._id === selectedUclass?.groupId) ? '#00ab5526' : 'none',
        }}
      >
        <Avatar
          alt={group.groupname}
          src={process.env.REACT_APP_APIFILE + `/images/${group.logo}`}
          sx={{ width: 50, height: 50 }}
        />

        <ListItemText
          primary={`${group.groupname}`}
          secondary={`${group.title}`}
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2', color: 'primary' }}
          secondaryTypographyProps={{ noWrap: true, typography: 'caption' }}
          sx={{ ml: 3 }}
        />

        <Button
          size="large"
          color="primary"
          startIcon={<Iconify icon='fluent:select-all-on-24-regular' />}
          onClick={() => onSelectGroup(group)}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            p: 2,
          }}
        >
          {`${translate('common.select')}`}
        </Button>

      </ListItem>

    </>
  );
}
