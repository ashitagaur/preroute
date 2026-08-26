import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiEdit3, FiActivity } from 'react-icons/fi';
import styles from './Layout.module.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoBlue}>Prep</span>
        <span className={styles.logoDark}>route</span>
      </div>
      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <FiHome size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tests/create" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <FiEdit3 size={20} />
          <span>Test Creation</span>
        </NavLink>
        <NavLink to="/tracking" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <FiActivity size={20} />
          <span>Test Tracking</span>
        </NavLink>
      </nav>
    </aside>
  );
};
