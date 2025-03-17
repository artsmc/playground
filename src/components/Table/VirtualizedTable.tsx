import React, { useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './Table.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useDataContext } from '../../context/DataContext';
import { useSortContext } from '../../context/SortContext';
import { SortActionTypes } from '../../reducers/sortReducer';
import { debounce } from 'lodash';
import TableCell from './columns/TableCell';
import { FPDSRecordFlat } from '@/app/types/types';

export interface RowData extends FPDSRecordFlat {
  id: string;
  [key: string]: string | number | boolean | Date | null | undefined;
}

function cleanTitle(key: string): string {
  return key
    .split('__')
    .map(segment => segment.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface VirtualizedTableProps {
  loading?: boolean;
  error?: string | null;
}

const VirtualizedTableComponent: React.FC<VirtualizedTableProps> = ({ loading, error }) => {
  const { data, columns } = useDataContext();
  const { state: { sortBy: sortKey, sortDirection }, dispatch } = useSortContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const columnKeys = useMemo(() => Object.keys(columns), [columns]);

  const rowVirtualizer = useVirtualizer({
    count: data.length + 1, // +1 for the header row
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => index === 0 ? 100 : 150, // Different size for header
    overscan: 10,
  });

  const columnVirtualizer = useVirtualizer({
    count: columnKeys.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 310 + 32, // Include padding in the estimate.
    horizontal: true,
    overscan: 5,
  });

  const debouncedSort = useMemo(() => debounce((key: string) => {
    if (sortKey !== key) {
      dispatch({ type: SortActionTypes.SET_SORT, payload: { columnKey: key, direction: 'asc' } });
    } else {
      dispatch({ type: SortActionTypes.SET_SORT, payload: { columnKey: key, direction: sortDirection === 'asc' ? 'desc' : 'asc' } });
    }
  }, 300), [sortKey, sortDirection, dispatch]);

    useEffect(() => {
      return () => {
          debouncedSort.cancel();
      };
    }, [debouncedSort]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const totalWidth = columnVirtualizer.getTotalSize();

  if (loading) {
    return <div className="table-wrap"><div className="table-shadow-wrapper"><div className="loading-indicator">Loading data...</div></div></div>;
  }

  if (error) {
    return <div className="table-wrap"><div className="table-shadow-wrapper"><div className="error-message">Error: {error}</div></div></div>;
  }

  return (
    <div className="table-wrap">
      <div className="table-shadow-wrapper">
        <div
          className="table-container"
          ref={containerRef}
          style={{ overflow: "auto" }}
        >
          <div style={{ height: `${totalHeight}px`, width: `${totalWidth}px`, position: 'relative' }}>
            <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <tbody>
                {virtualRows.map((virtualRow) => {
                  const isHeaderRow = virtualRow.index === 0;
                  const rowData = isHeaderRow ? null : (data[virtualRow.index - 1] as RowData); // -1 because of header
                  const rowKey = isHeaderRow ? 'header' : rowData!.id;

                  return (
                    <tr
                      key={rowKey}
                      className={isHeaderRow ? "table-header-row" : "table-row"}
                      style={{
                        height: `${virtualRow.size}px`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: `translateY(${virtualRow.start}px)`,
                        width: '100%',
                      }}
                    >
                      {virtualColumns.map((virtualColumn) => {
                        const key = columnKeys[virtualColumn.index];
                        return (
                          <td
                            key={key}
                            className={isHeaderRow ? "table-header" : "table-cell"}
                            style={{ width: `${virtualColumn.size}px`}}
                          >
                            {isHeaderRow ? (
                              <div className="table-header-content">
                                <span>{cleanTitle(key)}</span>
                                <button
                                  className="sort-icon"
                                  onClick={() => debouncedSort(key)}
                                  aria-label={`Sort by ${cleanTitle(key)}`}
                                >
                                  {sortKey === key ? (
                                    sortDirection === "asc" ? (
                                      <FontAwesomeIcon icon={faSortUp} />
                                    ) : (
                                      <FontAwesomeIcon icon={faSortDown} />
                                    )
                                  ) : (
                                    <FontAwesomeIcon icon={faSort} />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <TableCell row={rowData!} columnKey={key} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

VirtualizedTableComponent.displayName = 'VirtualizedTableComponent';

export const VirtualizedTable = React.memo(VirtualizedTableComponent);