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
import {
  FileListView,
  FileGridView,
  FileFilterType,
  FileFilterName,
  FileFilterButton,
  FileChangeViewButton,
  TopHeader,
  NewFolderDialog,
  GroupsInFolderDialog,
  FolderVersionDialog,
  MoveFolderDialog,
  UploadFilesDialogs,
  UploadFolderDialog,
  PreviewFileDialog,
  SearchAllDialog,
  FileDetailsDrawer,
} from '../../../sections/@dashboard/file';
import FolderLinkCard from 'src/sections/@dashboard/file/item/FolderLinkCard';
import CommentEditor from 'src/sections/@dashboard/discussion/editor/CommentEditor';
// type
import { IFilesAttribute, IFilesFunction } from 'src/containers/dashboard/cloud/files.container';
import { IFolder } from 'src/shared/types/folder';
import DeleteItemsDialog from 'src/sections/@dashboard/file/DeleteItemsDialog';
import CreateFolderTemplates from 'src/sections/@dashboard/file/CreateFolderTemplates';
import DownloadZip from 'src/sections/@dashboard/file/portal/DownloadZip';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
// -------------------------------------------------------------------

const FILE_TYPE_OPTIONS = [
  'folder',
  'txt',
  'zip',
  'audio',
  'image',
  'video',
  'word',
  'excel',
  'powerpoint',
  'pdf',
  'photoshop',
  'illustrator',
  'cad',
  'csv',
  'e57',
  'ifc',
  'navis',
  'revit',
  'project',
  'model',
];

const folderNameStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  minWidth: '50px',
  maxWidth: '150px',
  textOverflow: 'ellipsis',
  alignItems: 'left',
  justifyContent: 'left',
  flexGrow: 1,
}

// ----------------------------------------------------------------------

type IFilesComponent = {
  props: IFilesAttribute,
  func: IFilesFunction
};

function FilesComponent({props, func}: IFilesComponent) {
  const { themeStretch } = useSettingsContext();
  const isFiltered = props.localState.filterName !== '' || props.localState.filterType.length > 0;
  const isDesktop = useResponsive('up', 'lg');
  
  return (
    <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: '5px !important' }} >

      {isDesktop ? 
        <CustomBreadcrumbs
          heading={`${props.translate('cloud.files_manager')}`}
          links={[
            {
              name: `${props.translate('nav.dashboard')}`,
              href: PATH_DASHBOARD.root,
            },
            { name: `${props.translate('cloud.files_manager')}` },
          ]}
          action={
            <TopHeader
              selectedFolder={props.selectedFolder}
              handleUploadFolder={() => func.handleUploadFolder(true)}
              handleUploadFilesDialog={() => func.handleUploadFiles(true)}
              handleNewFolderDialog={() => func.handleNewFolderDialog()}
              handleExportFolderTemplate={func.handleExportFolderTemplate}
              handleImportFoldetTemplateDialog={() => func.handleImportFoldetTemplateDialog(true)}
            />
          }
        />
        :
        <TopHeader
          handleUploadFolder={() => func.handleUploadFolder(true)}
          selectedFolder={props.selectedFolder}
          handleUploadFilesDialog={() => func.handleUploadFiles(true)}
          handleNewFolderDialog={() => func.handleNewFolderDialog()}
          handleExportFolderTemplate={func.handleExportFolderTemplate}
          handleImportFoldetTemplateDialog={() => func.handleImportFoldetTemplateDialog(true)}
        />
      }

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
          <Button
            variant="soft"
            color={props.localState.searchMode ? 'success' : 'inherit'}
            startIcon={<Iconify icon="mdi:cloud-search" />}
            onClick={() => func.handleSearchAll(true)}
          >
            {`${props.translate('cloud.search_all')}`}
          </Button>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <>
              <FileFilterName
                filterName={props.localState.filterName}
                holderText={`${props.translate('cloud.search_in_folder')}`}
                onFilterName={props.handleFilterName}
              />

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

            <FileFilterType
              filterType={props.localState.filterType}
              onFilterType={props.handleFilterType}
              optionsType={FILE_TYPE_OPTIONS}
              onReset={() => props.setFilterType([])}
            />

            {isFiltered && (
              <Button
                variant="soft"
                color="error"
                onClick={props.handleClearAll}
                startIcon={<Iconify icon="eva:trash-2-outline" />}
              >
                {`${props.translate('common.clear')}`}
              </Button>
            )}

          </Stack>
        </Stack>

        <FileChangeViewButton value={props.localState.view} onChange={props.handleChangeView} />
      </Stack>

      <Grid container spacing={2} >
        <Grid item xs={12} md={3} >
          <Card sx={{ borderRadius: '5px !important', p: 1 }}>
            <Scrollbar>
              <TreeView
                aria-label="file-manager"
                defaultExpandIcon={<Iconify icon={'bx:folder'} color="#ffc144" width={24} height={24} />}
                defaultEndIcon={<Iconify icon={'bxs:folder'} color="#ffc144" width={24} height={24} />}
                defaultCollapseIcon={<Iconify icon={'bx:folder-open'} color="#ffc144" width={24} height={24} />}
                sx={{ flexGrow: 1, overflowY: 'auto' }}
                selected={props.selectedFolder ? props.selectedFolder._id : ''}
                expanded={props.localState.fLinks.map((e) => e._id)}
              >
                { func.renderFoldersTree(props.foldersTree) }
              </TreeView>
            </Scrollbar>
          </Card>
        </Grid>
        <Grid item xs={12} md={9} >
          {props.localState.isLoading ? 
            <LoadingWindow />
            :
            <Card sx={{ borderRadius: '5px !important', p: 1 }} >
              {!props.localState.searchMode ? 
                <Box sx={{ mb: 1 }} >
                  <FolderLinkCard fLinks={props.localState.fLinks} onLinkClick={func.onLinkClick} folderNameStyle={folderNameStyle} searchMode={props.localState.searchMode} />
                </Box> 
                : null
              }

              {props.localState.view === 'list' ? (
                <FileListView
                  table={props.table}
                  tableData={props.localState.tableData}
                  dataFiltered={props.dataFiltered}
                  isNotFound={props.isNotFound}
                  //
                  onOpenRow={func.handleOpenFolder}
                  onRenameRow={func.handleEditFolder}
                  onPermission={func.handleSetPermission}
                  onDeleteRow={func.handleDeleteFolder}
                  onFolderVersion={func.handleFolderVersion}
                  onMoveFolder={func.handleMoveFolder}
                  //
                  onPreviewFile={func.handlePreviewFile}
                  onMoveFile={func.handleMoveFile}
                  onDeleteFile={func.handleDeleteFile}
                  //
                  searchMode={props.localState.searchMode}
                  searchRes={props.localState.searchRes}
                  onLinkClick={func.onLinkClick}
                  folderNameStyle={folderNameStyle}
                  //
                  detailsId={(props.localState.detailItem !== undefined && props.localState.detailItem !== null) ? props.localState.detailItem._id : ''}
                  onDetails={func.handleDetailsDialog}
                  //
                  onDownloadSelected={func.onDownloadSelected}
                  onMoveItems={func.handleMoveItems}
                  onDeleteItemsDialog={func.handleDeleteItemsDialog}
                />
              ) : (
                <FileGridView
                  table={props.table}
                  tableData={props.localState.tableData}
                  dataFiltered={props.dataFiltered}
                  isNotFound={props.isNotFound}
                  //
                  onOpenRow={func.handleOpenFolder}
                  onRenameRow={func.handleEditFolder}
                  onPermission={func.handleSetPermission}
                  onDeleteRow={func.handleDeleteFolder}
                  onFolderVersion={func.handleFolderVersion}
                  onMoveFolder={func.handleMoveFolder}
                  //
                  onPreviewFile={func.handlePreviewFile}
                  onMoveFile={func.handleMoveFile}
                  onDeleteFile={func.handleDeleteFile}
                  //
                  searchMode={props.localState.searchMode}
                  searchRes={props.localState.searchRes}
                  onLinkClick={func.onLinkClick}
                  folderNameStyle={folderNameStyle}
                  //
                  detailsId={(props.localState.detailItem !== undefined && props.localState.detailItem !== null) ? props.localState.detailItem._id : ''}
                  onDetails={func.handleDetailsDialog}
                  //
                  onDownloadSelected={func.onDownloadSelected}
                  onMoveItems={func.handleMoveItems}
                  onDeleteItemsDialog={func.handleDeleteItemsDialog}
                />
              )}
            </Card>
          }
        </Grid>
      </Grid>

      <NewFolderDialog
        open={props.localState.openNewFolderDialog}
        isEdit={props.localState.isEdit}
        renameFolder={props.localState.renameFolder}
        onClose={() => func.closeNewFolderDialog()}
        getFolderTree={func.getFolderTree}
        // onLoadFolders={func.treeItemOnClick}
      />

      <GroupsInFolderDialog
        open={props.localState.openFolderPermissionDialog}
        isFileManager={true}
        onClose={() => func.handleSetPermission(null)}
        onLoadData={func.treeItemOnClick}
      />

      <MoveFolderDialog
        open={props.localState.openMoveFolderDialog}
        onClose={() => func.handleMoveFolder(null)}
        moveMode={props.localState.moveMode}
        moveFolder={props.localState.renameFolder}
        moveFile={props.localState.moveFile}
        moveItems={props.localState.moveItems}
        fatherFolder={props.selectedFolder}
        fatherGetFolderTree={func.getFolderTree}
        fatherOnLoadFolders={func.treeItemOnClick}
      />

      <FolderVersionDialog
        open={props.localState.openFolderVersionDialog}
        onClose={() => func.handleFolderVersion(null)}
        renameFolder={props.localState.renameFolder}
        onLoadFolders={func.treeItemOnClick}
      />

      <UploadFilesDialogs
        open={props.localState.openUploadFilesDialog}
        onClose={() => func.handleUploadFiles(false)}
        onLoadFolders={func.treeItemOnClick}
      />

      <UploadFolderDialog
        open={props.localState.openUploadFolderDialog}
        onClose={() => func.handleUploadFolder(false)}
        onLoadFolders={func.treeItemOnClick}
        getFolderTree={func.getFolderTree}
      />

      <CreateFolderTemplates
        open={props.localState.openImportFolderTemplateDialog}
        onClose={() => func.handleImportFoldetTemplateDialog(false)}
        onLoadFolders={func.treeItemOnClick}
        getFolderTree={func.getFolderTree}
      />

      <PreviewFileDialog
        open={props.localState.openPreviewFileDialog}
        onClose={() => func.handlePreviewFile(null)}
        fileId={props.localState.previewFileId}
        files={props.files}
      />

      <SearchAllDialog
        open={props.localState.openSearchAllDialog}
        searchKey={''}
        onClose={() => func.handleSearchAll(false)}
        onLoadFolders={func.treeItemOnClick}
        setSearchAllData={func.setSearchAllData}
      />

      <FileDetailsDrawer
        item={props.localState.detailItem}
        itemType={props.localState.detailType}
        open={props.localState.openDetails}
        onClose={func.handleCloseDetailsDialog}
        onOpenRow={() => {
          func.handleCloseDetailsDialog();
          func.handleOpenFolder(props.localState.detailItem?._id || '', props.localState.detailType);
        }}
        treeItemOnClick={func.treeItemOnClick}
        handlePreviewFile={func.handlePreviewFile}
      />

      <ConfirmDialog {...props.localState.dataDialog} />

      <DeleteItemsDialog
        open={props.localState.openDeleteItemsDialog}
        table={props.table}
        tableData={props.localState.tableData}
        onClose={() => func.handleDeleteItemsDialog(false)}
      />

      {props.localState.openDownloadSelected ?
        <DownloadZip />
        : null
      }
    </Container>
  )
}

FilesComponent.propTypes = {}

export default FilesComponent
