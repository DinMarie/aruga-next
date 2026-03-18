'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderProps {
  subtitle?: string;
  username?: string;
}

export default function Header({ subtitle, username }: HeaderProps) {

  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <>
      <div className={styles.header}>
        
        {/* LEFT SIDE */}
        <div className={styles.headerLeft}>
          <img src="/cswd.png" alt="CSWD Logo" className={styles.logo} />
          <h2 className={styles.title}>CSWDO - Biñan City</h2>
        </div>

        {/* MIDDLE */}
        {subtitle && (
          <h3 className={styles.subtitle}>
            {subtitle}
          </h3>
        )}

        {/* RIGHT SIDE */}
        <div className={styles.dropdown}>
          <button
            className={styles.dropbtn}
            onClick={() => setShowMenu(!showMenu)}
          >
            {username || "Username"} ▼
          </button>

          {showMenu && (
            <div className={styles.dropdownContent}>

              <a href="#" className={styles.dropdownItem}>
                Profile
              </a>

              <a
                href="#"
                className={styles.logoutItem}
                onClick={(e) => {
                  e.preventDefault();
                  setShowMenu(false);
                  setShowLogoutModal(true);
                }}
              >
                Logout
              </a>

            </div>
          )}
        </div>

      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>

            <p className={styles.modalText}>
              Are you sure you want to logout?
            </p>

            <div className={styles.modalButtons}>

              <button
                className={styles.yesBtn}
                onClick={handleLogout}
              >
                YES
              </button>

              <button
                className={styles.noBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                NO
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
}