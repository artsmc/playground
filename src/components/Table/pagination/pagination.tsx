import React from 'react';
import { usePaginationContext } from '@/context/PaginationContext';
import { useDataContext } from '@/context/DataContext';
import { PaginationActionTypes } from '@/reducers/paginationReducer';
import './pagination.scss';

const getVisiblePages = (currentPage: number, totalPages: number) => {
  let startPage = currentPage;
  let endPage = currentPage + 2;

  // If we're near the end, show previous+current+next
  if (endPage > totalPages) {
    startPage = Math.max(1, currentPage - 1);
    endPage = totalPages;
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
};

export const Pagination: React.FC = () => {
  const { state: paginationState, dispatch } = usePaginationContext();
  const { data } = useDataContext();
  const totalPages = Math.ceil(data.length / paginationState.limit);
  const visiblePages = getVisiblePages(paginationState.page, totalPages);
  const pageLimits = [5, 10, 25, 50, 100];

  const handlePageChange = (page: number) => {
    dispatch({ type: PaginationActionTypes.SET_PAGE, payload: page });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    dispatch({
      type: PaginationActionTypes.SET_LIMIT,
      payload: newLimit
    });
  };

  return (
    <div className="pagination-container">
      <div className="page-limit-select">
        <label htmlFor="page-limit">Rows per page:</label>
        <select
          id="page-limit"
          value={paginationState.limit}
          onChange={handleLimitChange}
        >
          {pageLimits.map(limit => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </select>
      </div>

      <div className="paginate-wrapper">
        {paginationState.page > 1 && (
          <button
            className="pager"
            onClick={() => handlePageChange(paginationState.page - 1)}
          >
            Previous
          </button>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pager ${page === paginationState.page ? 'selected' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {paginationState.page < totalPages && (
          <button
            className="pager"
            onClick={() => handlePageChange(paginationState.page + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
