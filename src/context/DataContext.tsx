import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { dataReducer, initialDataState, DataAction, DataState, DataActionTypes } from '../reducers/dataReducer';
import { usePaginationContext } from './PaginationContext';
import { useFilterContext } from './FilterContext';
import { useSortContext } from './SortContext';
import { FPDSRecordFlat } from '@/app/types/types';

interface DataContextType extends DataState {
  dispatch: React.Dispatch<DataAction>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialDataState);

  // Get state from other contexts
  const { state: paginationState } = usePaginationContext();
  const { state: filterState } = useFilterContext();
  const { state: sortState } = useSortContext();

  const fetchData = useCallback(async (isUpdate = false) => {
    try {
      // Dispatch data loading action
      dispatch({
        type: isUpdate ? DataActionTypes.FETCH_DATA_UPDATE : DataActionTypes.FETCH_DATA_START
      });
      // Build the URL with all the parameters from different contexts
      const url = `/api/csv?page=${paginationState.page}&pageSize=${paginationState.limit}&sort=${sortState.sortBy || ''}&direction=${sortState.sortDirection || ''}&filters=${JSON.stringify(filterState.filters)}`;
      const response = await fetch(url);
      const result = await response.json();
      // Add id column if it doesn't exist
      result.data = result.data.map((row: FPDSRecordFlat, index: number) => ({
        id: `row-${index}`,
        ...row
      }));

      // Dispatch data success action
      dispatch({
        type: isUpdate ? DataActionTypes.FETCH_DATA_UPDATE_SUCCESS : DataActionTypes.FETCH_DATA_SUCCESS,
        payload: result.data
      });

      // Map the keys from the first data object to create columns
      if (!isUpdate && result.data.length > 0) {
        const firstDataObject = result.data[0];
        const columnsObject: { [key: string]: { key: string; visible: boolean; order?: number; }; } = {};
        // Create a column entry for each key in the data object
        Object.keys(firstDataObject).forEach((key, index) => {
          columnsObject[key] = {
            key,
            visible: true,
            order: index
          };
        });
        // Dispatch the INSERT_COLUMN action with the columns object
        dispatch({
          type: DataActionTypes.INSERT_COLUMN,
          payload: columnsObject
        });
      }
    } catch (error) {
      // Dispatch error action
      dispatch({
        type: DataActionTypes.FETCH_DATA_ERROR,
        payload: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [paginationState.page, paginationState.limit, sortState.sortBy, sortState.sortDirection, filterState.filters]);

  // Fetch data on initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data when pagination changes
  useEffect(() => {
    fetchData(true);
  }, [paginationState.page, paginationState.limit]);

  // Fetch data when sort changes
  useEffect(() => {
    if (sortState.sortBy) {
      fetchData(true);
    }
  }, [sortState.sortBy, sortState.sortDirection]);

  // Fetch data when filters change
  useEffect(() => {
    fetchData(true);
  }, [filterState.filters]);

  return (
    <DataContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
