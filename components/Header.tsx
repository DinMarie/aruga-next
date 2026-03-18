'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="header">
        
        {/* LEFT SIDE */}
        <div className="headerLeft">
          <img src="/cswd.png" alt="CSWD Logo" className="logo" />
          <h2 className="title">CSWDO - Biñan City</h2>
        </div>

        {/* MIDDLE */}
        {subtitle && (
          <h3 className="subtitle">
            {subtitle}
          </h3>
        )}

        {/* RIGHT SIDE */}
        <div className="dropdown">
          <button
            className="dropbtn"
            onClick={() => setShowMenu(!showMenu)}
          >
            {username || "Username"} ▼
          </button>

          {showMenu && (
            <div className="dropdownContent">

              <a href="#" className="dropdownItem">
                Profile
              </a>

              <a
                href="#"
                className="logoutItem"
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
        <div className="modalOverlay">
          <div className="modalBox">

            <p className="modalText">
              Are you sure you want to logout?
            </p>

            <div className="modalButtons">

              <button
                className="yesBtn"
                onClick={handleLogout}
              >
                YES
              </button>

              <button
                className="noBtn"
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