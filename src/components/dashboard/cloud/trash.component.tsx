import React from 'react';
import { useSettingsContext } from '../../settings';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @mui
import {
  Box,
  Button,
  Card,
  Grid,
  Table,
  Tooltip,
  TableBody,
  Typography,
  Container,
  IconButton,
  TableContainer,
  Stack,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses, LoadingButton } from '@mui/lab';
// components
import Iconify from '../../iconify';
import Scrollbar from '../../scrollbar';
import ConfirmDialog from '../../confirm-dialog';
import CustomBreadcrumbs from '../../custom-breadcrumbs';
import DateRangePicker from '../../../components/date-range-picker';
// sections
import { FileFilterButton } from '../../../sections/@dashboard/file';
import TrashListView from 'src/sections/@dashboard/trash/view/TrashListView';
import DeleteTrashesDialog from 'src/sections/@dashboard/trash/DeleteTrashesDialog';
// type
import { ITrashAttribute, ITrashFunction } from 'src/containers/dashboard/cloud/trash.container';
import { IFolder } from 'src/shared/types/folder';
import TrashDetailsDrawer from 'src/sections/@dashboard/trash/item/TrashDetailsDrawer';
import RestoreTrashesDialog from 'src/sections/@dashboard/trash/RestoreTrashesDialog';
import EmptyTrashDialog from 'src/sections/@dashboard/trash/EmptyTrashDialog';
// -------------------------------------------------------------------

type ITrashComponent = {
  props: ITrashAttribute,
  func: ITrashFunction
};

function TrashComponent({props, func}: ITrashComponent) {
  const { themeStretch } = useSettingsContext();
  const isDesktop = useResponsive('up', 'lg');
  
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }} >

        <CustomBreadcrumbs
          heading={`${props.translate('cloud.trash')}`}
          links={[
            {
              name: `${props.translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${props.translate('cloud.trash')}` },
          ]}
          action={
            <></>
          }
        />

        <Stack
          spacing={2.5}
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ md: 'center' }}
            sx={{ width: 1 }}
          >
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <>
                <FileFilterButton
                  isSelected={!!props.isSelectedValuePicker}
                  startIcon={<Iconify icon="eva:calendar-fill" />}
                  onClick={props.onOpenPicker}
                >
                  {props.isSelectedValuePicker ? props.shortLabel : `${props.translate('cloud.select_date')}`}
                </FileFilterButton>

                <DateRangePicker
                  title={`${props.translate('cloud.select_date_range')}`}
                  variant="calendar"
                  startDate={props.startDate}
                  endDate={props.endDate}
                  onChangeStartDate={props.handleChangeStartDate}
                  onChangeEndDate={props.handleChangeEndDate}
                  open={props.openPicker}
                  onClose={props.onClosePicker}
                  onReset={props.handleClearAll}
                  isSelected={props.isSelectedValuePicker}
                  isError={props.isError}
                />
              </>

            </Stack>
          </Stack>

          <Tooltip title={`${props.translate('cloud.empty_trash')}`} placement='top'>
            <Button
              type="submit"
              variant="contained"
              onClick={() => func.handleEmptyTrashDialog(true)}
            >
              <Iconify icon="tabler:trash-x-filled" />
            </Button>
          </Tooltip>
        </Stack>

        <Grid container spacing={2} >
          <Grid item xs={12} md={12} >
            <Card sx={{ borderRadius: '5px !important', p: 1 }} >
              <TrashListView
                table={props.table}
                tableData={props.localState.tableData}
                pageCount={props.localState.pageCount}
                //
                onDeleteRow={func.handleDeleteTrash}
                onRestoreRow={func.handleRestoreTrash}
                onHandleDeleleTrashes={func.handleDeleteTrashesDialog}
                onHandleRestoreTrashes={func.handleRestoreTrashesDialog}
                //
                detailsId={(props.localState.detailItem !== undefined && props.localState.detailItem !== null) ? props.localState.detailItem._id : ''}
                onDetails={func.handleDetailsDialog}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      {(props.localState.detailItem !== null && props.localState.detailItem !== undefined) ? 
        <TrashDetailsDrawer
          item={props.localState.detailItem}
          itemType={props.localState.detailType}
          open={props.localState.openDetails}
          onClose={func.handleCloseDetailsDialog}
          onRestoreRow={() => func.handleRestoreTrash(props.localState.detailItem?._id as string, props.localState.detailType)}
          onDeleteRow={() => func.handleDeleteTrash(props.localState.detailItem?._id as string, props.localState.detailType)}
        />
        : null
      }

      <ConfirmDialog {...props.localState.dataDialog} />

      <DeleteTrashesDialog
        open={props.localState.openDeleteTrashesDialog}
        table={props.table}
        tableData={props.localState.tableData}
        onClose={() => func.handleDeleteTrashesDialog(false)}
      />

      <RestoreTrashesDialog
        open={props.localState.openRestoreTrashesDialog}
        table={props.table}
        tableData={props.localState.tableData}
        onClose={() => func.handleRestoreTrashesDialog(false)}
      />

      <EmptyTrashDialog
        open={props.localState.openEmptyTrashDialog}
        // tableData={props.localState.tableData}
        onClose={() => func.handleEmptyTrashDialog(false)}
      />

    </>
  )
}

TrashComponent.propTypes = {}

export default TrashComponent;
