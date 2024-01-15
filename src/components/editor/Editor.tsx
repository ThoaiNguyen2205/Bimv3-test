import '../../utils/highlight';
// next
import dynamic from 'next/dynamic';
// @mui
import { Skeleton } from '@mui/material';
//
import Scrollbar from '../../components/scrollbar';
import { EditorProps } from './types';
import { StyledEditor } from './styles';
import EditorToolbar, { formats } from './EditorToolbar';
import { useLocales } from 'src/locales';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <Skeleton
      variant="rounded"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: 1,
        position: 'absolute',
      }}
    />
  ),
});

// ----------------------------------------------------------------------

export default function Editor({
  id = 'bimnext-editor',
  error,
  value,
  onChange,
  simple = false,
  helperText,
  sx,
  ...other
}: EditorProps) {
  const modules = {
    toolbar: {
      container: `#${id}`,
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };
  const { translate } = useLocales();
  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
          }),
          ...sx,
        }}
      >
        <EditorToolbar id={id} isSimple={simple} />
        <Scrollbar sx={{ minHeight: 60, maxHeight: 250 }}>
          <ReactQuill
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={`${translate('common.write_content')}`}
            {...other}
          />
        </Scrollbar>
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}
