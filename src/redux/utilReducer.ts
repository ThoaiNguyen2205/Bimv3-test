const UtilReducer = {
  // START LOADING
  startLoading(state: any) {
    state.isLoading = true;
  },

  // HAS ERROR
  hasError(state: any, action: any) {
    state.isLoading = false;
    state.error = action.payload;
  },

  // GET DATAS: List
  getDatasSuccess(state: any, action: any) {
    state.isLoading = false;
    state.datas = action.payload;
  },

  // GET DATA: A Record
  getDataSuccess(state: any, action: any) {
    state.isLoading = false;
    state.data = action.payload;
  },

  // ADD NEW RECORD
  addData(state: any, action: any) {
    return { ...state, data: action.payload }
  },

  // REMOVE A RECORD
  removeData(state: any, action: any) {
    if (action.payload !== '') {
      return { ...state, data: state.data.filter((obj: any) => obj.id !== action.payload) }
    } else {
      return { ...state };
    }
  }
}

export default UtilReducer;