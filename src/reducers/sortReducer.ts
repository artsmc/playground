

export interface SortState {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc' | null;
}

export const initialSortState: SortState = {
  sortBy: null,
  sortDirection: null
};

export enum SortActionTypes {
  SET_SORT = 'SET_SORT',
  RESET_SORT = 'RESET_SORT'
}

interface SetSortAction {
  type: SortActionTypes.SET_SORT;
  payload: {
    columnKey: string;
    direction: 'asc' | 'desc';
  };
}

interface ResetSortAction {
  type: SortActionTypes.RESET_SORT;
}

export type SortAction =
  | SetSortAction
  | ResetSortAction;

export const sortReducer = (state: SortState, action: SortAction): SortState => {
  switch (action.type) {
    case SortActionTypes.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.columnKey,
        sortDirection: action.payload.direction
      };
    case SortActionTypes.RESET_SORT:
      return {
        ...state,
        sortBy: null,
        sortDirection: null
      };
    default:
      return state;
  }
};
