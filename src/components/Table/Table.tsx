import React from 'react';
import { VirtualizedTable } from './VirtualizedTable';
import { Pagination } from './pagination/pagination';
import { TableContent } from './TableContent';

export const Table: React.FC = () => {
  return (
    <TableContent>
        <VirtualizedTable />
        <Pagination />
    </TableContent>
  );
};
