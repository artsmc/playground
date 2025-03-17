import { createContext, useReducer, ReactNode, Dispatch, useContext } from 'react';
import {
  SortState,
  SortAction,
  sortReducer,
  initialSortState
} from '../reducers/sortReducer';

type SortContextType = {
  state: SortState;
  dispatch: Dispatch<SortAction>;
};

export const SortContext = createContext<SortContextType | undefined>(undefined);

export const SortProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(sortReducer, initialSortState);

  return (
    <SortContext.Provider value={{ state, dispatch }}>
      {children}
    </SortContext.Provider>
  );
};

export const useSortContext = () => {
  const context = useContext(SortContext);
  if (context === undefined) {
    throw new Error('useSortContext must be used within a SortProvider');
  }
  return context;
};
