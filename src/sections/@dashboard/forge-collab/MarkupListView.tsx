import { useState, useRef, useCallback, useEffect } from 'react';
// @mui
import { Collapse, Box, Divider, Stack, InputAdornment, TextField, MenuItem, Button, Tooltip } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import {
  useTable,
  getComparator,
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
//
import { IFileOrFolder, IFolder, IFileAndFolderSearching } from 'src/shared/types/folder';
import ImageCollabItem from './ImageCollabItem';
import OfficeCollabItem from './OfficeCollabItem';
import { useLocales } from 'src/locales';
import { IForgeObject, IForgeObjectData } from 'src/shared/types/forgeObject';
import { LogType, TaskCategory } from 'src/shared/enums';
import CadCollabItem from './CadCollabItem';

import Scrollbar from 'src/components/scrollbar/Scrollbar';
import useMarkup from 'src/redux/markupStore';
import { shallow } from 'zustand/shallow';
import useForgeViewState from 'src/redux/forgeViewStore';
import { IMarkup, IMarkupReqCreate, IMarkupResGetAll } from 'src/shared/types/markup';
import { IFile } from 'src/shared/types/file';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useSnackbar } from 'src/components/snackbar';
import markupsApi from 'src/api/markupsApi';
import MarkupItem from './MarkupItem';
import uploadsApi from 'src/api/uploadsApi';
import LoadingWindow from 'src/components/loading-screen/LoadingWindow';
import forgesApi from 'src/api/forgesApi';
// ----------------------------------------------------------------------

type ILocalState = {
  filterName: string;
  markupTitle: string;
  isLoading: boolean;
};

export default function MarkupListView() {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const containerRef = useRef(null);

  const table: TableProps = useTable();

  const {
    isSplit,
    setIsSplit,
    forgeLoading,
    setForgeLoading,
    subLoading,
    setSubLoading,
    previewUrn,
    setPreviewUrn,
    currentTask,
    setCurrentTask,
    forgeObjectData,
    setForgeObjectData,
    firstObject,
    setFirstObject,
    firstSubObject,
    setFirstSubObject,
    selectedObject,
    setSelectedObject,
    forgeViewer,
    setForgeViewer,
    subViewer,
    setSubViewer,
    markupSettings,
    setMarkupSettings,
  } = useForgeViewState(
    (state) => ({
      isSplit: state.isSplit,
      setIsSplit: state.setIsSplit,
      forgeLoading: state.forgeLoading,
      setForgeLoading: state.setForgeLoading,
      subLoading: state.subLoading,
      setSubLoading: state.setSubLoading,
      previewUrn: state.previewUrn,
      setPreviewUrn: state.setPreviewUrn,
      currentTask: state.currentTask,
      setCurrentTask: state.setCurrentTask,
      forgeObjectData: state.forgeObjectData,
      setForgeObjectData: state.setForgeObjectData,
      firstObject: state.firstObject,
      setFirstObject: state.setFirstObject,
      firstSubObject: state.firstSubObject,
      setFirstSubObject: state.setFirstSubObject,
      selectedObject: state.selectedObject,
      setSelectedObject: state.setSelectedObject,
      forgeViewer: state.forgeViewer,
      setForgeViewer: state.setForgeViewer,
      subViewer: state.subViewer,
      setSubViewer: state.setSubViewer,
      markupSettings: state.markupSettings,
      setMarkupSettings: state.setMarkupSettings,
    }),
    shallow
  );

  const {
    markups,
    setMarkups,
    selectedMarkup,
    setSelectedMarkup,
    countMarkups,
  } = useMarkup(
    (state) => ({
      markups: state.datas,
      setMarkups: state.setDatas,
      selectedMarkup: state.selectedData,
      setSelectedMarkup: state.setSelectedData,
      countMarkups: state.countDatas,
    }),
    shallow
  );

  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
    markupTitle: '',
    isLoading: false,
  });

  const loadAllMarkups = useCallback(async () => {
    if (currentTask !== null && selectedObject !== null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, isLoading: true }));
      let params = {};
      if (currentTask.category === TaskCategory.ModelCollaboration) {
        params = {
          task: currentTask._id,
        }
      } else {
        params = {
          task: currentTask._id,
          fileid: selectedObject._id,
        }
      }

      const markupsRes: IMarkupResGetAll = await markupsApi.getAllMarkups(params) as IMarkupResGetAll;
      setMarkups(markupsRes.data);
      setLocalState((prevState: ILocalState) => ({ ...prevState, isLoading: false }));
    }
  }, [selectedObject]);

  useEffect(() => {
    loadAllMarkups();
  }, [selectedObject]);

  function applyFilter({
    inputData,
    comparator,
    filterName,
  }: {
    inputData: IMarkup[];
    comparator: (a: any, b: any) => number;
    filterName: string;
  }) {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);
  
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
  
    inputData = stabilizedThis.map((el) => el[0]);
  
    if (filterName) {
      const filterByName: IMarkup[] = [];
      for (const item of inputData) {
        if (item.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1) {
          filterByName.push(item);
        }
      }
      inputData = filterByName;
    }
  
    return inputData;
  }
  
  const dataFiltered = applyFilter({
    inputData: markups,
    comparator: getComparator(table.order, table.orderBy),
    filterName: localState.filterName,
  });

  const isNotFound = (dataFiltered.length < 1);
  const isFiltered = !!localState.filterName;

  const handleFilter = (filterName: string, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null) => {
    var filterData: any = null;
    if (filterName === 'filterName')
    {
      filterData = { filterName: event?.target.value };
    } else {
      filterData = { filterName: '' };
    }
    if (filterData != null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, ...filterData }));
    }
  };

  const handleMarkupTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null) => {
    if (event != null) {
      setLocalState((prevState: ILocalState) => ({ ...prevState, markupTitle: event?.target.value }));
    }
  };

  const addNewMarkup = async () => {
    if (localState.markupTitle === '') {
      enqueueSnackbar(`${translate('coordinator.markup_title_required')}`, {variant: "error"});
      return;
    }
    const markupExtension = forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
    if (markupExtension.editMode) {
      const viewstateData = forgeViewer.getState();
      const markupsStringData = markupExtension.generateData();
      let viewable = '';
      if (currentTask?.category !== TaskCategory.ImageCollaboration) {
        viewable = forgeViewer.model.getDocumentNode().data.guid;
      }
      
      const newMarkup: IMarkupReqCreate = {
        task: currentTask?._id,
        title: localState.markupTitle,
        fileid: '',
        viewable: '',
        viewstate: JSON.stringify(viewstateData),
        markup: markupsStringData,
        type: currentTask?.category,
        createdBy: user?.id,
        createdGroup: user?.group._id,
      }
      if (currentTask?.category === TaskCategory.ModelCollaboration) {
        if (forgeObjectData.length === 1) {
          newMarkup.viewable = viewable;
        }
      }
      if (currentTask?.category === TaskCategory.CadCollaboration || currentTask?.category === TaskCategory.OfficeCollaboration) {
        newMarkup.fileid = selectedObject?._id;
        newMarkup.viewable = viewable;
      }
      if (currentTask?.category === TaskCategory.ImageCollaboration) {
        newMarkup.fileid = selectedObject?._id;
      }
      
      await markupsApi.postCreate(newMarkup);
      loadAllMarkups();
      setLocalState((prevState: ILocalState) => ({ ...prevState, markupTitle: '' }));
      markupExtension.leaveEditMode();
      markupExtension.hide();
    }    
  }

  const handleMarkupClick = async (markupId: string) => {
    const markupFilter = markups.filter((e) => e._id === markupId);
    if (markupFilter.length > 0) {
      const mvData = markupFilter[0];
      if (forgeViewer !== null) {
        let markupExtension = forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
        // markupExtension.clear();
        markupExtension.hide();

        setSelectedMarkup(mvData);
        try {
          if (currentTask?.category !== TaskCategory.ImageCollaboration) {
            if (mvData.viewable !== undefined && mvData.viewable !== '') {
              var restoreViewablePromise = new Promise((resolve, reject) => {
                var listener = function (event: any) {
                  if (event.model) {
                    forgeViewer.removeEventListener(
                      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, 
                      listener
                    );
                    // @ts-ignore
                    resolve();
                  }
                }
                forgeViewer.addEventListener(
                  Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
                  listener,
                );

                // Load viewable node:
                const docNode = forgeViewer.model.getDocumentNode();
                const rootNode = docNode.getRootNode();
                const viewable = rootNode.findByGuid(mvData.viewable);
                forgeViewer.loadDocumentNode(rootNode.getDocument(), viewable);
                
              }); 
              await restoreViewablePromise;
            }
          }
        } catch (e: any){
          console.log(e);
        } finally {
          var restorePromise = new Promise((resolve, reject) => {
            var listener = function (event: any) {
              if (event.value.finalFrame) {
                forgeViewer.removeEventListener(
                  Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT, 
                  listener
                );
                // @ts-ignore
                resolve();
              }
            }
            forgeViewer.addEventListener(
              Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT,
              listener
            );
            forgeViewer.restoreState(JSON.parse(mvData.viewstate));
          }); 
          await restorePromise;
          if (mvData.markup !== '') {
            markupExtension = forgeViewer.getExtension("Autodesk.Viewing.MarkupsCore");
            markupExtension.enterEditMode();
            markupExtension.leaveEditMode();
            markupExtension.show();
            markupExtension.loadMarkups(mvData.markup, "Layer_1");
          }
          // thêm tham số url param
          let params = new URLSearchParams(window.location.search);
          let taskParam = params.get('task');
          let objId = params.get('obj');
          if (taskParam && objId) {
            window.history.pushState({}, ``, `?task=${taskParam}&obj=${objId}&markup=${markupId}`);
          } 
        }

      }
    }
  }

  const handleDeleteMarkup = (markupId: string) => {

  }

  return (
    <>
      <Box ref={containerRef}>
        {(currentTask?.isUpdate === true || currentTask?.isApprove === true) ?
          <Stack
            spacing={2}
            alignItems="center"
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            sx={{ px: 1, mb: 1 }}
          >
            <TextField
              size='small'
              fullWidth
              value={localState.markupTitle}
              onChange={(e) => handleMarkupTitleChange(e)}
              placeholder={`${translate('documents.title')}`}
            />
            <Tooltip title={`${translate('coordinator.add_markup')}`} placement='top'>
              <Button
                variant='contained'
                color="primary"
                sx={{ flexShrink: 0 }}
                onClick={() => addNewMarkup()}
              >
                <Iconify icon="ic:twotone-add-task" />
              </Button>
            </Tooltip>
          </Stack>
          : null
        }

        <Stack
          spacing={2}
          alignItems="center"
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          sx={{ px: 1, mb: 1 }}
        >
          <TextField
            size='small'
            fullWidth
            value={localState.filterName}
            onChange={(e) => handleFilter('filterName', e)}
            placeholder={`${translate('common.search')}`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {isFiltered && (
            <Button
              color="error"
              sx={{ flexShrink: 0 }}
              onClick={() => handleFilter('reset', null)}
              startIcon={<Iconify icon="eva:trash-2-outline" />}
            >
              {`${translate('common.clear')}`}
            </Button>
          )}
        </Stack>

        {localState.isLoading ?
          <LoadingWindow />
          :
          <Scrollbar sx={{ height: 'calc(100vh - 210px)'}}>
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((markup) => (
                <MarkupItem
                  key={markup._id}
                  markupData={markup}
                  //
                  handleClick={() => {handleMarkupClick(markup._id)}}
                  onDeleteMarkup={() => {handleDeleteMarkup(markup._id)}}
                />
              ))}
            </Stack>
            
            {isNotFound ? (
              <EmptyContent
                title={`${translate('common.no_data')}`}
                sx={{
                  '& span.MuiBox-root': { height: 160 },
                }}
              />
            ) : (
              <></>
            )}
          </Scrollbar>
        }
      </Box>

    </>
  );
}
