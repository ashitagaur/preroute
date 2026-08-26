import React from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './Layout.module.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.headerRight}>
        <button className={styles.iconButton}>
          <FiBell size={20} />
        </button>
        <div className={styles.profile} onClick={logout}>
          <div className={styles.avatar}>
            <img src="https://ui-avatars.com/api/?name=Alex+Wando&background=F59E0B&color=fff" alt="Avatar" />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Alex Wando</span>
            <span className={styles.userRole}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
