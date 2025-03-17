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
    const headerRowRef = useRef<HTMLTableRowElement>(null); // Ref for the header ROW

    const columnKeys = useMemo(() => Object.keys(columns), [columns]);

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 150,
        overscan: 10,
    });

    const columnVirtualizer = useVirtualizer({
        count: columnKeys.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 310 + 32,  // Include padding
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

    // Horizontal scroll sync (CORRECTED)
    useEffect(() => {
        const container = containerRef.current;
        const headerRow = headerRowRef.current;

        if (container && headerRow) {
            const handleScroll = () => {
                // Apply transform directly to the header ROW
                headerRow.style.transform = `translateX(-${container.scrollLeft}px)`;
            };

            container.addEventListener('scroll', handleScroll);
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, []); // Empty dependency array: only run on mount/unmount

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
                <div className="table-container" ref={containerRef} style={{ overflow: "auto" }}>
                    <div style={{ height: `${totalHeight + 100}px`, width: `${totalWidth}px`, position: 'relative' }}>
                        <table className="table" style={{ tableLayout: 'fixed', width: '100%' }}>
                            <thead>
                                {/* Apply ref to the header ROW */}
                                <tr ref={headerRowRef} style={{ width: '100%', position: 'relative' }}>
                                    {virtualColumns.map((virtualColumn) => {
                                        const key = columnKeys[virtualColumn.index];
                                        return (
                                            <th key={key} className="table-header" style={{ width: `${virtualColumn.size}px` }}>
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
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody style={{ marginTop: '100px' }}>
                                {virtualRows.map((virtualRow) => {
                                    const row = data[virtualRow.index] as RowData;
                                    return (
                                        <tr
                                            key={row.id}
                                            className="table-row"
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
                                                    <td key={key} className="table-cell" style={{ width: `${virtualColumn.size}px` }}>
                                                        <TableCell row={row} columnKey={key} />
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