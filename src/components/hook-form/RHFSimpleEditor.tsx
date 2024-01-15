import React, { useRef, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import SunEditorCore from 'suneditor/src/lib/core';
import plugins from 'suneditor/src/plugins';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { UploadBeforeHandler, UploadInfo } from 'suneditor-react/dist/types/upload';

import uploadsApi from 'src/api/uploadsApi';
import { IUploadRes } from 'src/shared/types/upload';

// import lang from 'suneditor/src/lang';
// import vi from 'suneditor/src/lang/vi';

/**
 * https://github.com/mkhstar/suneditor-react/blob/master/README.md
 * https://github.com/JiHong88/SunEditor/blob/master/README.md#options
 */

type PropsObject = {
  height?: string;
  value?: string;
  handleEditorChange?: (content: string) => void;
};
const RHFSimpleEditor = (props: PropsObject) => {
  // const editorDefaultFontStyle = "font-family: Arial; font-size: 14x;";
  const editorDefaultFontStyle = 'font-family: CircularStd; font-size: 16px;';
  const editorHeight = props.height ? `${props.height}` : '200';
  const editorToolbar = [
    // 'undo', 'redo',
    // 'font', 'fontSize', 'formatBlock',
    // 'paragraphStyle', 'blockquote',
    'bold',
    'underline',
    'italic',
    // 'strike', 'subscript', 'superscript',
    // 'fontColor', 'hiliteColor',
    // 'textStyle',
    'removeFormat',
    // 'outdent', 'indent',
    'align',
    // 'horizontalRule',
    'list',
    'lineHeight',
    // 'table',
    'link',
    'image',
    'video' /** 'audio', 'math', */, // You must add the 'katex' library at options to use the 'math' plugin.
    /** 'imageGallery', */ // You must add the "imageGalleryUrl".
    // 'showBlocks', 'codeView',
    // 'preview', 'fullScreen',
    // 'print', 'save', 'template',
    /** 'dir', 'dir_ltr', 'dir_rtl' */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
  ];

  /**
   * @type {React.MutableRefObject<SunEditor>} get type definitions for editor
   */
  const editor = useRef<SunEditorCore>();

  // The sunEditor parameter will be set to the core suneditor instance when this function is called
  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editor.current = sunEditor;
  };

  useEffect(() => {
    if (editor.current === undefined) return;
  }, [editor, props.value]);

  /**
   * Upload a new image via Server
   * @param files
   * @param info
   * @param uploadHandler
   * @returns
   */
  const handleImageUploadBefore = (
    files: File[],
    info: object,
    uploadHandler: UploadBeforeHandler
  ) => {
    try {
      // Upload image to Server
      const formData = new FormData();
      formData.append('image', files[0]);
      uploadsApi
        .uploadImage(formData, (e: any) => {})
        .then((res: IUploadRes) => {
          const response = {
            // The response must have a "result" array.
            result: [
              {
                url: `${process.env.REACT_APP_APIFILE}images/${res.filename}`,
                name: files[0].name,
                size: files[0].size,
              },
            ],
          };
          uploadHandler(response);
        })
        .catch((e) => {
          console.log('file: handleImageUploadBefore ~ e:', e);
          uploadHandler(e);
        });

      return false;
    } catch (err) {
      uploadHandler(err.toString());
    }
  };

  /**
   * Overwrite image element on Editor
   * @param targetImgElement
   * @param index
   * @param state
   * @param imageInfo
   * @param remainingFilesCount
   */
  const handleImageUpload = (
    targetImgElement: HTMLImageElement,
    index: number,
    state: string,
    imageInfo: UploadInfo<HTMLImageElement>,
    remainingFilesCount: number
  ) => {
    // console.log(targetImgElement, index, state, imageInfo, remainingFilesCount)
    // get the url from handleImageUploadBefore function
    if (targetImgElement === null) return;
    const p = document.createElement('br');
    targetImgElement.after(p);
  };

  return (
    <>
      <SunEditor 
          getSunEditorInstance={getSunEditorInstance}
          setContents={props.value}
          setDefaultStyle={ editorDefaultFontStyle }
          setOptions={{
              plugins: plugins,
              height: 'auto',
              minHeight: editorHeight,
              buttonList: [ editorToolbar ],
              imageWidth: '300',
              imageHeight: '200',
              // lang: vi,
          }}
          onChange={props.handleEditorChange}
          onImageUploadBefore={handleImageUploadBefore}
          onImageUpload={handleImageUpload} 
      />
    </>
  );
};
export default RHFSimpleEditor;
