import React from 'react';

interface TableContentProps {
  children: React.ReactNode;
}

export const TableContent: React.FC<TableContentProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

export default TableContent;
