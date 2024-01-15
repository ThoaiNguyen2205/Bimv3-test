import { useState, useRef } from 'react';
// @mui
import { Collapse, Box, Divider, Stack, InputAdornment, TextField, MenuItem, Button } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import {
  useTable,
  getComparator,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
//
import ImageCollabItem from './ImageCollabItem';
import OfficeCollabItem from './OfficeCollabItem';
import { useLocales } from 'src/locales';
import { IForgeObjectData } from 'src/shared/types/forgeObject';
import { TaskCategory } from 'src/shared/enums';
import CadCollabItem from './CadCollabItem';

import Scrollbar from 'src/components/scrollbar/Scrollbar';
import ModelCollabItem from './ModelCollabItem';
// ----------------------------------------------------------------------

type ILocalState = {
  filterName: string;
};

type Props = {
  category?: TaskCategory;
  linkFolderId: string;
  imageObjects: IForgeObjectData[];
  //
  onItemClick: (id: string) => void;
  handleDeleteForgeObject: (objId: string | null) => void;
  onModelClick: (id: string) => void;
};

export default function ImageListView({
  category,
  linkFolderId,
  imageObjects,
  //
  onItemClick,
  handleDeleteForgeObject,
  onModelClick,
}: Props) {
  const { translate } = useLocales();
  const containerRef = useRef(null);

  const table: TableProps = useTable();

  const [localState, setLocalState] = useState<ILocalState>({
    filterName: '',
  });

  function applyFilter({
    inputData,
    comparator,
    filterName,
  }: {
    inputData: IForgeObjectData[];
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
      const filterByName: IForgeObjectData[] = [];
      for (const item of inputData) {
        if (item.forgeObject.displayName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1) {
          filterByName.push(item);
        }
      }
      inputData = filterByName;

    }
  
    return inputData;
  }
  
  const dataFiltered = applyFilter({
    inputData: imageObjects,
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

  return (
    <>
      <Box ref={containerRef}>
        <Stack
          spacing={2}
          alignItems="center"
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          sx={{ px: 1, mb: 2 }}
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
        
        <Scrollbar sx={{ height: 'calc(100vh - 160px)'}}>
          {(category === TaskCategory.ImageCollaboration) ? 
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((image) => (
                <ImageCollabItem
                  key={image.forgeObject._id}
                  linkFolderId={linkFolderId}
                  imageData={image}
                  //
                  handleClick={() => onItemClick(image.forgeObject._id)}
                  onDeleteForgeObject={() => handleDeleteForgeObject(image.forgeObject._id)}
                />
              ))}
            </Stack>
            : null
          }

          {(category === TaskCategory.OfficeCollaboration) ? 
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((office) => (
                <OfficeCollabItem
                  key={office.forgeObject._id}
                  linkFolderId={linkFolderId}
                  imageData={office}
                  //
                  handleClick={() => onItemClick(office.forgeObject._id)}
                  onDeleteForgeObject={() => handleDeleteForgeObject(office.forgeObject._id)}
                />
              ))}
            </Stack>
            : null
          }

          {(category === TaskCategory.CadCollaboration) ? 
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((cad) => (
                <CadCollabItem
                  key={cad.forgeObject._id}
                  linkFolderId={linkFolderId}
                  imageData={cad}
                  //
                  handleClick={() => onItemClick(cad.forgeObject._id)}
                  onDeleteForgeObject={() => handleDeleteForgeObject(cad.forgeObject._id)}
                />
              ))}
            </Stack>
            : null
          }

          {(category === TaskCategory.ModelCollaboration) ? 
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((cad) => (
                <ModelCollabItem
                  key={cad.forgeObject._id}
                  linkFolderId={linkFolderId}
                  imageData={cad}
                  //
                  handleClick={onModelClick}
                  onDeleteForgeObject={() => handleDeleteForgeObject(cad.forgeObject._id)}
                />
              ))}
            </Stack>
            : null
          }

          {/* {(category === TaskCategory.GlbCollaboration) ? 
            <Stack spacing={2} sx={{ pb: 2 }}>
              {dataFiltered && dataFiltered.map((cad) => (
                <CadCollabItem
                  key={cad.forgeObject._id}
                  linkFolderId={linkFolderId}
                  imageData={cad}
                  //
                  handleClick={() => onItemClick(cad.forgeObject._id)}
                  onDeleteForgeObject={() => handleDeleteForgeObject(cad.forgeObject._id)}
                />
              ))}
            </Stack>
            : null
          } */}
          
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
        
        {isNotFound ? 
          <EmptyContent
            title={`${translate('common.no_data')}`}
            sx={{
              '& span.MuiBox-root': { height: 160 },
            }}
          />
          : null
        }

      </Box>

    </>
  );
}
