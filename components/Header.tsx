'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css'; // Import the new CSS module!

// This allows us to pass an optional subtitle to the Header
interface HeaderProps {
  subtitle?: string; 
}

export default function Header({ subtitle }: HeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={styles.header}>
      
      {/* LEFT SIDE: Logo and City Name */}
      <div className={styles.headerLeft}>
        <img src="/cswd.png" alt="CSWD Logo" className={styles.logo} />
        <h2 className={styles.title}>CSWDO - Biñan City</h2>
      </div>

      {/* MIDDLE: Optional Subtitle (Only renders if you provide it!) */}
      {subtitle && (
        <h3 className={styles.subtitle}>
          {subtitle}
        </h3>
      )}

      {/* RIGHT SIDE: User Dropdown */}
      <div className={styles.dropdown}>
        <button 
          className={styles.dropbtn} 
          onClick={() => setShowMenu(!showMenu)}
        >
          Username ▼
        </button>
        
        <div 
          className={styles.dropdownContent} 
          style={{ display: showMenu ? 'block' : 'none' }} // Kept inline since it toggles via state
        >
          <a href="#" className={styles.dropdownItem}>
            Profile
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); router.push('/'); }}
            className={styles.logoutItem}
          >
            Logout
          </a>
        </div>
      </div>

    </div>
  );
}