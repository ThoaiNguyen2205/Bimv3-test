// components
import { ExtendFile } from './types';

// ----------------------------------------------------------------------

// Define more types here
const FORMAT_PDF = ['pdf'];
const FORMAT_TEXT = ['txt'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_ZIP = ['zip', 'rar', 'iso'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_AUDIO = ['wav', 'aif', 'mp3', 'aac'];
const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'svg'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];

const FORMAT_CAD = ['dwg', 'dwt', 'dxf', 'dng', 'dxb'];
const FORMAT_REVIT = ['rvt', 'rfa'];
const FORMAT_IFC = ['ifc'];
const FORMAT_CSV = ['csv'];
const FORMAT_E57 = ['e57'];
const FORMAT_NAVIS = ['nwd', "nwc"];
const FORMAT_PROJECT = ['mpp'];
const FORMAT_MODEL = ['obj', 'fbx', 'dae', '3ds', 'blend', 'gltf', 'glb', 'pln', 'npl', 'skp', 'stl', '3dm', 'ndw', ];

const iconUrl = (icon: string) => `/assets/icons/files/${icon}.svg`;

// ----------------------------------------------------------------------

export function fileFormat(fileUrl: string | undefined) {
  let format;

  switch (fileUrl?.includes(fileTypeByUrl(fileUrl))) {
    case FORMAT_TEXT.includes(fileTypeByUrl(fileUrl)):
      format = 'txt';
      break;
    case FORMAT_ZIP.includes(fileTypeByUrl(fileUrl)):
      format = 'zip';
      break;
    case FORMAT_AUDIO.includes(fileTypeByUrl(fileUrl)):
      format = 'audio';
      break;
    case FORMAT_IMG.includes(fileTypeByUrl(fileUrl)):
      format = 'image';
      break;
    case FORMAT_VIDEO.includes(fileTypeByUrl(fileUrl)):
      format = 'video';
      break;
    case FORMAT_WORD.includes(fileTypeByUrl(fileUrl)):
      format = 'word';
      break;
    case FORMAT_EXCEL.includes(fileTypeByUrl(fileUrl)):
      format = 'excel';
      break;
    case FORMAT_POWERPOINT.includes(fileTypeByUrl(fileUrl)):
      format = 'powerpoint';
      break;
    case FORMAT_PDF.includes(fileTypeByUrl(fileUrl)):
      format = 'pdf';
      break;
    case FORMAT_PHOTOSHOP.includes(fileTypeByUrl(fileUrl)):
      format = 'photoshop';
      break;
    case FORMAT_ILLUSTRATOR.includes(fileTypeByUrl(fileUrl)):
      format = 'illustrator';
      break;
    case FORMAT_CAD.includes(fileTypeByUrl(fileUrl)):
      format = 'cad';
      break;
    case FORMAT_REVIT.includes(fileTypeByUrl(fileUrl)):
      format = 'revit';
      break;
    case FORMAT_IFC.includes(fileTypeByUrl(fileUrl)):
      format = 'ifc';
      break;
    case FORMAT_CSV.includes(fileTypeByUrl(fileUrl)):
      format = 'csv';
      break;
    case FORMAT_E57.includes(fileTypeByUrl(fileUrl)):
      format = 'e57';
      break;
    case FORMAT_NAVIS.includes(fileTypeByUrl(fileUrl)):
      format = 'navis';
      break;
    case FORMAT_PROJECT.includes(fileTypeByUrl(fileUrl)):
      format = 'project';
      break;
    case FORMAT_MODEL.includes(fileTypeByUrl(fileUrl)):
      format = 'model';
      break;
    default:
      format = fileTypeByUrl(fileUrl);
  }

  return format;
}

// ----------------------------------------------------------------------

export function fileThumb(fileUrl: string) {
  let thumb;

  switch (fileFormat(fileUrl)) {
    case 'folder':
      thumb = iconUrl('ic_folder');
      break;
    case 'txt':
      thumb = iconUrl('ic_txt');
      break;
    case 'zip':
      thumb = iconUrl('ic_zip');
      break;
    case 'audio':
      thumb = iconUrl('ic_audio');
      break;
    case 'video':
      thumb = iconUrl('ic_video');
      break;
    case 'word':
      thumb = iconUrl('ic_word');
      break;
    case 'excel':
      thumb = iconUrl('ic_excel');
      break;
    case 'powerpoint':
      thumb = iconUrl('ic_power_point');
      break;
    case 'pdf':
      thumb = iconUrl('ic_pdf');
      break;
    case 'photoshop':
      thumb = iconUrl('ic_pts');
      break;
    case 'illustrator':
      thumb = iconUrl('ic_ai');
      break;
    case 'image':
      thumb = iconUrl('ic_img');
      break;
    case 'cad':
      thumb = iconUrl('ic_cad');
      break;
    case 'revit':
      thumb = iconUrl('ic_revit');
      break;
    case 'ifc':
      thumb = iconUrl('ic_ifc');
      break;
    case 'csv':
      thumb = iconUrl('ic_csv');
      break;
    case 'e57':
      thumb = iconUrl('ic_e57');
      break;
    case 'navis':
      thumb = iconUrl('ic_nwd');
      break;
    case 'project':
      thumb = iconUrl('ic_project');
      break;
    case 'model':
      thumb = iconUrl('ic_model');
      break;
    default:
      thumb = iconUrl('ic_file');
  }
  return thumb;
}

// ----------------------------------------------------------------------

export function fileTypeByUrl(fileUrl = '') {
  return (fileUrl && fileUrl.split('.').pop()) || '';
}

// ----------------------------------------------------------------------

export function fileNameByUrl(fileUrl: string) {
  return fileUrl.split('/').pop();
}

// ----------------------------------------------------------------------

export function fileData(file: ExtendFile | string) {
  // Url
  if (typeof file === 'string') {
    return {
      key: file,
      preview: file,
      name: fileNameByUrl(file),
      type: fileTypeByUrl(file),
    };
  }

  // File
  return {
    key: file.preview,
    name: file.name,
    size: file.size,
    path: file.path,
    type: file.type,
    preview: file.preview,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
  };
}
