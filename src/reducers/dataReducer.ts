import { FPDSRecordFlat } from "@/app/types/types";

export interface TableColumn {
  key: string;
  header: string;
  order?: number;
}
export interface DataState {
  data: FPDSRecordFlat[];
  columns:{
    [key: string]: {
      key: string;
      visible: boolean;
      order?: number;
    };
  }
  loading: boolean;
  error: string | null;
}

export const initialDataState: DataState = {
  data: [],
  columns: {},
  loading: false,
  error: null
};
export enum DataActionTypes {
  FETCH_DATA_START = 'FETCH_DATA_START',
  FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS',
  FETCH_DATA_ERROR = 'FETCH_DATA_ERROR',
  FETCH_DATA_UPDATE = 'FETCH_DATA_UPDATE',
  FETCH_DATA_UPDATE_SUCCESS = 'FETCH_DATA_UPDATE_SUCCESS',
  INSERT_COLUMN = 'INSERT_COLUMN'
}

interface FetchDataStartAction {
  type: DataActionTypes.FETCH_DATA_START;
}

interface FetchDataSuccessAction {
  type: DataActionTypes.FETCH_DATA_SUCCESS
  payload: FPDSRecordFlat[];
}
interface FetchDataUpdateAction {
  type: DataActionTypes.FETCH_DATA_UPDATE;
}
interface FetchDataUpdateSuccessAction {
  type: DataActionTypes.FETCH_DATA_UPDATE_SUCCESS;
  payload: FPDSRecordFlat[];
}

interface FetchDataErrorAction {
  type: DataActionTypes.FETCH_DATA_ERROR;
  payload: string;
}

interface InsertColumnAction {
  type: DataActionTypes.INSERT_COLUMN;
  payload: {[key: string]: {key: string;visible: boolean;order?: number;}}
}

export type DataAction =
  | FetchDataStartAction
  | FetchDataSuccessAction
  | FetchDataErrorAction
  | FetchDataUpdateAction
  | FetchDataUpdateSuccessAction
  | InsertColumnAction;


export const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case DataActionTypes.FETCH_DATA_START:
      return { ...state, loading: true, error: null };
    case DataActionTypes.FETCH_DATA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case DataActionTypes.FETCH_DATA_ERROR:
      return { ...state, loading: false, error: action.payload };
    case DataActionTypes.FETCH_DATA_UPDATE:
      return { ...state, loading:false, error: null };
    case DataActionTypes.FETCH_DATA_UPDATE_SUCCESS:
      return { ...state, loading:false, data: action.payload };
    case DataActionTypes.INSERT_COLUMN:
      return {
        ...state,
        columns: {
          ...state.columns,
          ...action.payload
        }
      };
    default:
      return state;
  }
};
