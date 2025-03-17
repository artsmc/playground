export interface PaginationState {
  page: number;
  limit: number;
}

export const initialPaginationState: PaginationState = {
  page: 1,
  limit: 20
};

export enum PaginationActionTypes {
  SET_PAGE = 'SET_PAGE',
  SET_LIMIT = 'SET_LIMIT',
  NEXT_PAGE = 'NEXT_PAGE',
  PREV_PAGE = 'PREV_PAGE'
}

interface SetPageAction {
  type: PaginationActionTypes.SET_PAGE;
  payload: number;
}

interface SetLimitAction {
  type: PaginationActionTypes.SET_LIMIT;
  payload: number;
}

interface NextPageAction {
  type: PaginationActionTypes.NEXT_PAGE;
}

interface PrevPageAction {
  type: PaginationActionTypes.PREV_PAGE;
}

export type PaginationAction =
  | SetPageAction
  | SetLimitAction
  | NextPageAction
  | PrevPageAction;

export const paginationReducer = (state: PaginationState, action: PaginationAction): PaginationState => {
  switch (action.type) {
    case PaginationActionTypes.SET_PAGE:
      return {
        ...state,
        page: action.payload
      };
    case PaginationActionTypes.SET_LIMIT:
      return {
        ...state,
        limit: action.payload,
        page: 1 // Reset to first page when changing limit
      };
    case PaginationActionTypes.NEXT_PAGE:
      return {
        ...state,
        page: state.page + 1
      };
    case PaginationActionTypes.PREV_PAGE:
      return {
        ...state,
        page: Math.max(1, state.page - 1)
      };
    default:
      return state;
  }
};
