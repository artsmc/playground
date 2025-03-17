import React, { createContext, useReducer, ReactNode, Dispatch, useContext } from 'react';
import {
  FilterState,
  FilterAction,
  filterReducer,
  initialFilterState
} from '../reducers/filterReducer';

type FilterContextType = {
  state: FilterState;
  dispatch: Dispatch<FilterAction>;
};

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);

  return (
    <FilterContext.Provider value={{ state, dispatch }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
