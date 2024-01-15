interface eventState {
  openPopover: HTMLElement | null;
  openClass: boolean;
  openBlock: boolean;
  openDelete: boolean;
}

// Action enums
export enum UserItemActions {
  setOpenPopover = 'setOpenPopover',
  setOpenClass = 'setOpenClass',
  setOpenBlock = 'setOpenBlock',
  setOpenDelete = 'setOpenDelete',
}

// Actions
type setOpenPopover = { type: UserItemActions.setOpenPopover, payload: HTMLElement | null };
type setOpenClass = { type: UserItemActions.setOpenClass, payload: boolean };
type setOpenBlock = { type: UserItemActions.setOpenBlock, payload: boolean };
type setOpenDelete = { type: UserItemActions.setOpenDelete, payload: boolean };
type eventActions = setOpenPopover | setOpenClass | setOpenBlock | setOpenDelete;

// Reducer
export const eventReducer = (state: eventState, action: eventActions) => {
  switch (action.type) {
    case UserItemActions.setOpenPopover:
      return { ...state, openPopover: action.payload };
    case UserItemActions.setOpenClass:
      return { ...state, openClass: action.payload };
    case UserItemActions.setOpenBlock:
      return { ...state, openBlock: action.payload };
    case UserItemActions.setOpenDelete:
      return { ...state, openDelete: action.payload };
    default:
      return state;
  }
}