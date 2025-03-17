import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import TableCell from './columns/TableCell';

const VirtualizedTableIsolatedTest = () => {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i.toString(),
    name: `Item ${i}`,
    value: Math.random()
  }));

  const parentRef = React.useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef}
      style={{
        height: '500px',
        width: '600px',
        overflow: 'auto',
        border: '1px solid #ccc'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TableCell
              row={data[virtualRow.index]}
              columnKey="name"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedTableIsolatedTest;
