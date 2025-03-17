import React, { useRef, useMemo, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { FPDSRecordFlat } from '@/app/types/types';

// Define a type that extends FPDSRecordFlat to include the id property
export interface RowData extends FPDSRecordFlat {
  id: string;
  [key: string]: string | number | boolean | Date | null | undefined;
}
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import TableCell from './columns/TableCell';
import { useDataContext } from '../../context/DataContext';
import { useSortContext } from '../../context/SortContext';
import { SortActionTypes } from '../../reducers/sortReducer';

// Function to clean column titles
function cleanTitle(key: string): string {
  // Split on double underscores.
  const segments = key.split('__');

  // For each segment, insert a space before uppercase letters that follow a lowercase letter.
  const cleanedSegments = segments.map(segment =>
    segment.replace(/([a-z])([A-Z])/g, '$1 $2')
  );

  // Join all segments with a space.
  const joined = cleanedSegments.join(' ');

  // Capitalize the first letter of each word.
  const title = joined
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return title;
}




export const StandardTable: React.FC = () => {
    const { data, columns } = useDataContext();
    const { state: { sortBy: sortKey, sortDirection }, dispatch } = useSortContext();
    const tableRef = useRef<HTMLDivElement>(null);

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

    const columnKeys = useMemo(() => Object.keys(columns), [columns]);

    return (
        <div className="table-shadow-wrapper">
            <div className='table-container' ref={tableRef}>
                <table className='table'>
                    <thead>
                        <tr>
                            {columnKeys.map((key) => (
                                <th
                                    key={key}
                                    className='table-header'
                                >
                                    <div className="table-header-content">
                                        {/* useMemo for the cleaned title */}
                                        <span>{cleanTitle(key)}</span>
                                        <button 
                                            className="sort-icon" 
                                            onClick={() => debouncedSort(key)}
                                            aria-label={`Sort by ${cleanTitle(key)}`}
                                        >
                                            {sortKey === key ? (
                                                sortDirection === 'asc' ? (
                                                    <FontAwesomeIcon icon={faSortUp} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faSortDown} />
                                                )
                                            ) : (
                                                <FontAwesomeIcon icon={faSort} />
                                            )}
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data as unknown as RowData[]).map((row) => (
                            <tr
                                key={row.id}
                                className={`table-row`}>
                                {columnKeys.map((key) => (
                                    <td key={`${row.id}-${key}`} className='table-cell'>
                                        <TableCell row={row} columnKey={key} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
