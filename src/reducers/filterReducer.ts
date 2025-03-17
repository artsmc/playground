
export interface FilterState {
  filters: {
    [key: string]: TableFilter;
  };
}

export interface TableFilter {
  value: string | number | boolean;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
}

export const initialFilterState: FilterState = {
  filters: {}
};

export enum FilterActionTypes {
  SET_FILTER = 'SET_FILTER',
  CLEAR_FILTER = 'CLEAR_FILTER',
  CLEAR_ALL_FILTERS = 'CLEAR_ALL_FILTERS'
}

interface SetFilterAction {
  type: FilterActionTypes.SET_FILTER;
  payload: {
    key: string;
    filter: TableFilter;
  };
}

interface ClearFilterAction {
  type: FilterActionTypes.CLEAR_FILTER;
  payload: string;
}

interface ClearAllFiltersAction {
  type: FilterActionTypes.CLEAR_ALL_FILTERS;
}

export type FilterAction =
  | SetFilterAction
  | ClearFilterAction
  | ClearAllFiltersAction;

export const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case FilterActionTypes.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.filter
        }
      };
    case FilterActionTypes.CLEAR_FILTER:
      const newFilters = { ...state.filters };
      delete newFilters[action.payload];
      return {
        ...state,
        filters: newFilters
      };
    case FilterActionTypes.CLEAR_ALL_FILTERS:
      return {
        ...state,
        filters: {}
      };
    default:
      return state;
  }
};
