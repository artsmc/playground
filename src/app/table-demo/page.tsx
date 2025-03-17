'use client';

import React from 'react';
import { DataProvider } from '../../context/DataContext';
import { SortProvider } from '../../context/SortContext';
import { FilterProvider } from '../../context/FilterContext';
import { PaginationProvider } from '../../context/PaginationContext';
import { Table } from '../../components/Table';
import styles from './page.module.css';

export default function TableDemo() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Table Demo</h1>
      <p className={styles.description}>
        A simple table component with row selection using React Context and Reducer
      </p>

      <SortProvider>
        <FilterProvider>
          <PaginationProvider>
            <DataProvider>
              <Table />
            </DataProvider>
          </PaginationProvider>
        </FilterProvider>
      </SortProvider>
    </div>
  );
}
