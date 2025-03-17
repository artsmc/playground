import { createContext, useReducer, ReactNode, Dispatch, useContext } from 'react';
import {
  PaginationState,
  PaginationAction,
  paginationReducer,
  initialPaginationState
} from '../reducers/paginationReducer';

type PaginationContextType = {
  state: PaginationState;
  dispatch: Dispatch<PaginationAction>;
};

export const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

export const PaginationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(paginationReducer, initialPaginationState);

  return (
    <PaginationContext.Provider value={{ state, dispatch }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  return context;
};
