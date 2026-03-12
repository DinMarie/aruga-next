'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// This allows us to pass an optional subtitle to the Header
interface HeaderProps {
  subtitle?: string; 
}

export default function Header({ subtitle }: HeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="header" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 20px', 
      backgroundColor: '#8c6d8c', // Standardized purple background
      color: 'white',
      borderBottom: '2px solid #8e6e9e'
    }}>
      
      {/* LEFT SIDE: Logo and City Name */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/cswd.png" alt="CSWD Logo" style={{ width: '45px', height: '45px' }} />
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>CSWDO - Biñan City</h2>
      </div>

      {/* MIDDLE: Optional Subtitle (Only renders if you provide it!) */}
      {subtitle && (
        <h3 style={{ margin: 0, fontSize: '14px', flex: 1, textAlign: 'center' }}>
          {subtitle}
        </h3>
      )}

      {/* RIGHT SIDE: User Dropdown */}
      <div className="dropdown" style={{ position: 'relative' }}>
        <button 
          className="dropbtn" 
          onClick={() => setShowMenu(!showMenu)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer' }}
        >
          Username ▼
        </button>
        
        <div 
          className="dropdown-content" 
          style={{ 
            display: showMenu ? 'block' : 'none',
            position: 'absolute',
            right: 0,
            top: '30px',
            background: 'white',
            minWidth: '120px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          <a href="#" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#333' }}>
            Profile
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); router.push('/'); }}
            style={{ display: 'block', padding: '10px', textDecoration: 'none', color: 'red', borderTop: '1px solid #eee' }}
          >
            Logout
          </a>
        </div>
      </div>

    </div>
  );
}