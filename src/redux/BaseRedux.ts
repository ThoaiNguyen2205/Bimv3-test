
export const BaseRedux: any = (set: Function, get: Function) => ({
  datas: [],
  selectedData: null,
  loading: false,
  dataTree: [],
  count: 0,
  /**
   * Binding list records
   * @param datas: any[]
   */
  setDatas: (datas: any[]) => {
    set(() => ({ datas: datas }));
  },

  /**
   * Count total record
   * @returns number
   */
  countDatas: () => {
    return get().datas.length;
  },

  /**
   * Add a new item
   * @param data 
   */
  addData: (data: any) => {
    set((state: any) => {
      return {
        ...state,
        datas: [...state.datas, data],
      }
    });
  },

  /**
   * Replace an item
   * @param data 
   */
  replaceData: (data: any) => {
    set((state: any) => {
      const arr2 = state.datas.slice();
      const oldItem = arr2.find((o: any) => o._id === data._id);
      if (oldItem) {
        const oldItemIndex = arr2.indexOf(oldItem);
        arr2.splice(oldItemIndex, 1, data);
      }
      return {
        ...state,
        datas: arr2
      }
    });
  },

  /**
   * Remove an item
   * @param id 
   */
  removeData: (id: string) => {
    set((state: any) => {
      return {
        ...state,
        datas: state.datas.filter((obj: any) => obj._id !== id)
      }
    });
  },

  /**
   * Selected an item
   * @param data 
   */
  setSelectedData: (data: any | null) => {
    set((state: any) => {
      return {
        ...state,
        selectedData: data
      }
    });
  },

  /**
   * Toggle flag to show/hide loading window
   * @param value 
   */
  setLoading: (value: boolean) => {
    set((state: any) => {
      return {
        ...state,
        loading: value
      }
    });
  },

  /**
   * Binding list records
   * @param dataTree: any[]
   */
  setDataTree: (dataTree: any[]) => {
    set(() => ({ dataTree: dataTree }));
  },

});