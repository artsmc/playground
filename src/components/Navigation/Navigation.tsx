'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Home
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link 
            href="/table-demo" 
            className={`${styles.navLink} ${pathname === '/table-demo' ? styles.active : ''}`}
          >
            Table Demo
          </Link>
        </li>
      </ul>
    </nav>
  );
};
