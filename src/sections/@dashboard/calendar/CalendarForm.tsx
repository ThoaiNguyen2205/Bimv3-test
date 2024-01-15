import * as Yup from 'yup';
import merge from 'lodash/merge';
import { isBefore } from 'date-fns';
import { EventInput } from '@fullcalendar/core';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import {
  Box,
  Stack,
  Button,
  Tooltip,
  TextField,
  IconButton,
  DialogActions,
  Typography,
  MenuItem
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  LocalizationProvider,
  MobileDatePicker,
  MobileDateTimePicker
} from '@mui/x-date-pickers';
// @types
import { ICalendarEvent } from '../../../@types/calendar';
// components
import Iconify from '../../../components/iconify';
import { ColorSinglePicker } from '../../../components/color-utils';
import FormProvider, {
  RHFTextField,
  RHFSwitch
} from '../../../components/hook-form';
import dynamic from 'next/dynamic';
import { useLocales } from 'src/locales';
import useCalendarStore from 'src/redux/calendarStore/calendarStore';
import { shallow } from 'zustand/shallow';
import { useState } from 'react';
import vi from 'date-fns/locale/vi';
import en from 'date-fns/locale/en-US';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useDocCategory from 'src/redux/docCategoryStore';

const RHFSunEditor = dynamic(
  () => import('src/components/hook-form/RHFSunEditor'),
  { ssr: false }
);
// ----------------------------------------------------------------------

type FormValuesProps = ICalendarEvent;
type ILocalState = {
  selectedCategoryId: string;
};
type Props = {
  colorOptions: string[];
  event: EventInput | null | undefined;
  range: {
    start: Date;
    end: Date;
  } | null;
  onCancel: VoidFunction;
  onDeleteEvent: VoidFunction;
  onCreateUpdateEvent: (newEvent: ICalendarEvent) => void;
};

// ----------------------------------------------------------------------

const getInitialValues = (
  event: EventInput | null | undefined,
  range: { start: Date; end: Date } | null
) => {
  const initialEvent: FormValuesProps = {
    title: '',
    description: '',
    color: '#1890FF',
    allDay: false,
    start: range
      ? new Date(range.start).toISOString()
      : new Date().toISOString(),
    end: range ? new Date(range.end).toISOString() : new Date().toISOString()
  };

  if (event || range) {
    return merge({}, initialEvent, event);
  }

  return initialEvent;
};

// ----------------------------------------------------------------------

export default function CalendarForm({
  event,
  range,
  colorOptions,
  onCreateUpdateEvent,
  onDeleteEvent,
  onCancel
}: Props) {
  const { currentLang } = useLocales();
  const hasEventData = !!event;
  const { translate } = useLocales();
  const [localState, setLocalState] = useState<ILocalState>({
    selectedCategoryId: ''
  });
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const { content, setContent } = useCalendarStore(
    (state) => ({
      content: state.content,
      setContent: state.setContent
    }),
    shallow
  );
  const { blogCategories } = useDocCategory(
    (state) => ({
      blogCategories: state.datas
    }),
    shallow
  );
  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    description: Yup.string().max(5000)
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(event, range)
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting }
  } = methods;

  const values = watch();
  const isDateError =
    values.start && values.end
      ? isBefore(new Date(values.end), new Date(values.start))
      : false;
  const onSubmit = async (data: FormValuesProps) => {
    try {
      const newEvent = {
        title: data.title,
        description: content,
        color: data.color,
        allDay: data.allDay,
        start: data.start,
        end: data.end
      };
      onCreateUpdateEvent(newEvent);
      onCancel();
      reset();
    } catch (error) {
      console.error(error);
    }
  };
  const handleChangeContent = (value: string) => {
    setContent(encodeURIComponent(value));
  };
  //hanle change Category
  const onChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalState((prevState: ILocalState) => ({
      ...prevState,
      selectedCategoryId: event?.target.value
    }));
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ px: 3 }}>
        <RHFTextField name="title" label={`${translate('documents.title')}`} />
        <TextField
          className="create-card__content-category"
          name="category"
          fullWidth
          select
          label={`${translate('documents.category')}`}
          value={localState.selectedCategoryId || ''}
          onChange={onChangeCategory}>
          {blogCategories.map((option) => (
            <MenuItem
              className="category__menu-item"
              key={option._id}
              value={option._id}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize'
              }}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
        <Typography className="item-card__editor-title" variant="subtitle2">
          {`${translate('common.content')}`}
        </Typography>

        <RHFSunEditor
          value={decodeURIComponent(content)}
          height="300"
          handleEditorChange={handleChangeContent}
        />

        <RHFSwitch name="allDay" label={`${translate('calendar.all_day')}`} />
        {values.allDay === true ? (
          <>
            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <LocalizationProvider
                  locale={currentLang.value === 'vi' ? vi : en}
                  dateAdapter={AdapterDateFns}>
                  <MobileDatePicker
                    {...field}
                    onChange={(newValue: Date | null) =>
                      field.onChange(newValue)
                    }
                    label={`${translate('cloud.start_date')}`}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    inputFormat={'dd/MM/yyyy'}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <LocalizationProvider
                  locale={currentLang.value === 'vi' ? vi : en}
                  dateAdapter={AdapterDateFns}>
                  <MobileDatePicker
                    {...field}
                    onChange={(newValue: Date | null) =>
                      field.onChange(newValue)
                    }
                    label={`${translate('cloud.end_date')}`}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                    inputFormat={'dd/MM/yyyy'}
                  />
                </LocalizationProvider>
              )}
            />
          </>
        ) : (
          <>
            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <LocalizationProvider
                  locale={currentLang.value === 'vi' ? vi : en}
                  dateAdapter={AdapterDateFns}>
                  <MobileDateTimePicker
                    {...field}
                    onChange={(newValue: Date | null) =>
                      field.onChange(newValue)
                    }
                    label={`${translate('cloud.start_date')}`}
                    // inputFormat="dd/MM/yyyy hh:mm a"
                    inputFormat={'dd/MM/yyyy hh:mm a'}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <LocalizationProvider
                  locale={currentLang.value === 'vi' ? vi : en}
                  dateAdapter={AdapterDateFns}>
                  <MobileDateTimePicker
                    {...field}
                    onChange={(newValue: Date | null) =>
                      field.onChange(newValue)
                    }
                    label={`${translate('cloud.end_date')}`}
                    inputFormat={'dd/MM/yyyy hh:mm a'}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!isDateError}
                        helperText={
                          isDateError && `${translate('cloud.date_range_note')}`
                        }
                      />
                    )}
                  />
                </LocalizationProvider>
              )}
            />
          </>
        )}

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorSinglePicker
              value={field.value}
              onChange={field.onChange}
              colors={colorOptions}
            />
          )}
        />
      </Stack>

      <DialogActions>
        {hasEventData && (
          <Tooltip title={`${translate('calendar.delete_event')}`}>
            <IconButton onClick={onDeleteEvent}>
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onCancel}>
          {`${translate('common.cancel')}`}
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {hasEventData
            ? `${translate('common.update')}`
            : `${translate('common.add')}`}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
