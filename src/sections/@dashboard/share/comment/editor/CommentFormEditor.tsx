import '../../../../../utils/highlight';
// next
import dynamic from 'next/dynamic';
// @mui
import { Skeleton } from '@mui/material';
//
import Scrollbar from '../../../../../components/scrollbar/Scrollbar';

import { useLocales } from '../../../../../locales';
import { EditorProps } from '../../../../../components/editor';
import EditorToolbar, { formats } from './CommentEditorToolbar';
import { CommentStyledEditor } from './CommentStyledEditor';
import EmojiPicker from 'emoji-picker-react';
import { Quill } from 'react-quill';
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
        position: 'absolute'
      }}
    />
  )
});

// ----------------------------------------------------------------------

export default function CommentEditorForm({
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
      container: `#${id}`
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true
    },
    syntax: true,
    clipboard: {
      matchVisual: false
    }
  };
  const toolbarOptions = {
    container: [['emoji']],
    handlers: {
      emoji: function () {}
    }
  };

  // const quill = new Quill('.ql-formats', {
  //   modules: {
  //     toolbar: toolbarOptions,
  //     'emoji-toolbar': true,
  //     'emoji-shortname': true,
  //     'emoji-textarea': true
  //   },
  //   placeholder: 'Compose an epic...',
  //   theme: 'snow'
  // });
  const { translate } = useLocales();
  return (
    <>
      <CommentStyledEditor
        sx={{
          width: '100%',
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`
          }),
          ...sx
        }}>
        <EditorToolbar id={id} isSimple={simple} />
        <EmojiPicker
          searchDisabled={true}
          onEmojiClick={(e) => {
            console.log(e.emoji);
          }}
        />
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
      </CommentStyledEditor>

      {helperText && helperText}
    </>
  );
}
