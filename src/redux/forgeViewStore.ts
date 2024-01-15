import { create } from "zustand";
// type
import { IMainTask } from "src/shared/types/mainTask";
import { IForgeObject, IForgeObjectData, IMarkupSettings } from "src/shared/types/forgeObject";

interface forgeViewState {
  isSplit: boolean;
  setIsSplit: (value: boolean) => void;
  //
  forgeLoading: boolean;
  setForgeLoading: (value: boolean) => void;
  //
  subLoading: boolean;
  setSubLoading: (value: boolean) => void;
  //
  previewUrn: string;
  setPreviewUrn: (urn: string) => void;

  currentTask: IMainTask | null;
  setCurrentTask: (task: IMainTask | null) => void;

  forgeObjectData: IForgeObjectData[];
  setForgeObjectData: (data: IForgeObjectData[]) => void;

  firstObject: IForgeObject | null;
  setFirstObject: (obj: IForgeObject | null) => void;

  firstSubObject: IForgeObject | null;
  setFirstSubObject: (obj: IForgeObject | null) => void;

  selectedObject: IForgeObject | null;
  setSelectedObject: (obj: IForgeObject | null) => void;

  forgeViewer: any | null;
  setForgeViewer: (obj: any) => void;

  subViewer: any | null;
  setSubViewer: (obj: any) => void;

  markupSettings: IMarkupSettings | null;
  setMarkupSettings: (obj: IMarkupSettings | null) => void;

  filterProperty: string;
  setFilterProperty: (prop: string) => void;
  filterKey: string;
  setFilterKey: (value: string) => void;

  // for model compare
  is2D: boolean;
  setIs2d: (value: boolean) => void;
  sheetA: any | null;
  setSheetA: (obj: any) => void;
  sheetB: any | null;
  setSheetB: (obj: any) => void;

  viewerGhosting: boolean;
  setViewerGhosting: (value: boolean) => void;
}

const useForgeViewState = create<forgeViewState>()((set, get) => ({
  isSplit: false,
  setIsSplit: (value: boolean) => {
    set(() => ({ isSplit: value }));
  },
  //
  forgeLoading: false,
  setForgeLoading: (value: boolean) => {
    set(() => ({ forgeLoading: value }));
  },
  //
  subLoading: false,
  setSubLoading: (value: boolean) => {
    set(() => ({ subLoading: value }));
  },
  //
  previewUrn: '',
  setPreviewUrn: (urn: string) => {
    set(() => ({ previewUrn: urn }));
  },

  currentTask: null,
  setCurrentTask: (task: IMainTask | null) => {
    set(() => ({ currentTask: task }));
  },

  forgeObjectData: [],
  setForgeObjectData: (data: IForgeObjectData[]) => {
    set(() => ({ forgeObjectData: data }));
  },

  firstObject: null,
  setFirstObject: (obj: IForgeObject | null) => {
    set(() => ({ firstObject: obj }));
  },

  firstSubObject: null,
  setFirstSubObject: (obj: IForgeObject | null) => {
    set(() => ({ firstSubObject: obj }));
  },

  selectedObject: null,
  setSelectedObject: (obj: IForgeObject | null) => {
    set(() => ({ selectedObject: obj }));
  },

  forgeViewer: null,
  setForgeViewer: (obj: any) => {
    set(() => ({ forgeViewer: obj }));
  },

  subViewer: null,
  setSubViewer: (obj: any) => {
    set(() => ({ subViewer: obj }));
  },

  // markupSettings: {
  //   strokeWidth: 0.005,
  //   strokeColor: '#ff0000',
  //   strokeOpacity: 1,
  //   fillColor: '#ff0000',
  //   fillOpacity: 0,
  //   fontSize: 0.005,
  // },
  markupSettings: null,
  setMarkupSettings: (obj: IMarkupSettings | null) => {
    set(() => ({ markupSettings: obj }));
  },

  filterProperty: '',
  setFilterProperty: (prop: string) => {
    set(() => ({ filterProperty: prop }));
  },
  filterKey: '',
  setFilterKey: (value: string) => {
    set(() => ({ filterKey: value }));
  },

  // Dùng cho model compare
  is2D: false,
  setIs2d: (value: boolean) => {
    set(() => ({ is2D: value }));
  },
  sheetA: null,
  setSheetA: (obj: any) => {
    set(() => ({ sheetA: obj }));
  },
  sheetB: null,
  setSheetB: (obj: any) => {
    set(() => ({ sheetB: obj }));
  },

  viewerGhosting: true,
  setViewerGhosting: (value: boolean) => {
    set(() => ({ viewerGhosting: value }));
  },
}));

export default useForgeViewState;
