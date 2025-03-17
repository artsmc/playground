import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { TableRow } from '@/app/types/types';
import {
  formatCurrency,
  formatDate,
  formatObject,
  isDateColumn,
  isCurrencyColumn
} from '@/utils/formatUtils';

interface TableCellProps {
  row: TableRow | { id: string; [key: string]: string | number | boolean | Date | null | undefined };
  columnKey: string;
}

const TableCellComponent: React.FC<TableCellProps> = ({ row, columnKey }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simple loading effect - show loading indicator briefly when cell is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200); // Short fixed delay for better performance
    
    return () => clearTimeout(timer);
  }, []);
  
  const value = useMemo(() => {
    let val = row[columnKey];

    // Handle nested keys
    if (val === undefined && columnKey.includes('__')) {
      const keyParts = columnKey.split('__');
      let currentObj: unknown = row;
      for (const part of keyParts) {
        if (typeof currentObj === 'object' && currentObj !== null && part in currentObj) {
          currentObj = (currentObj as Record<string, unknown>)[part];
        } else {
          currentObj = undefined;
          break;
        }
      }
      val = currentObj as string | number | boolean;
    }
    return val;
  }, [row, columnKey]);


  const formattedDate = useMemo(() => {
    if (!isDateColumn(columnKey)) return '';
    try {
      const strValue = String(value);
      const dateValue = new Date(strValue);
      if (!isNaN(dateValue.getTime())) {
        return formatDate(dateValue);
      }
    } catch {
      return '';
    }
    return '';
  }, [value, columnKey]);

  const formattedCurrency = useMemo(() => {
    if (!isCurrencyColumn(columnKey)) return '';
    if (typeof value === 'string' || typeof value === 'number') {
      return formatCurrency(value);
    }
    return '';
  }, [value, columnKey]);

  const stringifiedObject = useMemo(() => {
    if (typeof value !== 'object') return '';
    return formatObject(value);
  }, [value]);

  if (value === undefined || value === null) return <span />;

  // Render with loading state
  return (
    <div className="table-cell-loading">
      {!isLoaded && <div className="loading-circle" />}
      <div className={`table-cell-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Content rendering based on type */}
        {isDateColumn(columnKey) && formattedDate ? (
          <span>{formattedDate}</span>
        ) : isCurrencyColumn(columnKey) && formattedCurrency ? (
          <span>{formattedCurrency}</span>
        ) : typeof value === 'object' && stringifiedObject ? (
          <span>{stringifiedObject}</span>
        ) : typeof value === 'string' && value.startsWith('http') ? (
          <Link href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </Link>
        ) : typeof value === 'boolean' ? (
          <span>{value ? 'Yes' : 'No'}</span>
        ) : (
          <span>{String(value)}</span>
        )}
      </div>
    </div>
  );
};

// Memoize the component with prop comparison
const TableCell = React.memo(TableCellComponent, (prevProps, nextProps) => {
  // Compare row IDs and column keys first for quick check
  if (prevProps.row.id !== nextProps.row.id || 
      prevProps.columnKey !== nextProps.columnKey) {
    return false;
  }
  
  // Deep compare the specific column value
  const prevValue = prevProps.row[prevProps.columnKey];
  const nextValue = nextProps.row[nextProps.columnKey];
  
  // Handle nested objects
  if (typeof prevValue === 'object' && typeof nextValue === 'object') {
    return JSON.stringify(prevValue) === JSON.stringify(nextValue);
  }
  
  return prevValue === nextValue;
});

TableCell.displayName = 'MemoizedTableCell';

export default TableCell;
