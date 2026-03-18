'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import styles from '../styles/loginstyle.module.css'; 

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 500; // 50 seconds

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const lockUntil = localStorage.getItem("lockUntil");
    if (lockUntil && Date.now() < parseInt(lockUntil)) {
      startCountdown(parseInt(lockUntil));
    }
  }, []);

  const startCountdown = (lockUntil: number) => {
    setIsLocked(true);
    const timer = setInterval(() => {
      let remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        setIsLocked(false);
        setLockTimeRemaining(0);
        localStorage.removeItem("lockUntil");
        localStorage.removeItem("loginAttempts");
        setSuccess("✅ Login unlocked. You can try again.");
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setLockTimeRemaining(remaining);
      }
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLocked) {
      setError("⚠ Login locked. Please wait.");
      return;
    }

    const email = username.trim() + "@cswdo-binan.com";
    let attempts = parseInt(localStorage.getItem("loginAttempts") || "0");

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("lockUntil");
        setSuccess("✅ Login successful");
        setTimeout(() => router.push('/table'), 1000);
      })
      .catch(() => {

        // Delay error message for 4 seconds
        setTimeout(() => {

          attempts++;
          localStorage.setItem("loginAttempts", attempts.toString());
          let remaining = MAX_ATTEMPTS - attempts;

          if (attempts >= MAX_ATTEMPTS) {
            const lockUntil = Date.now() + LOCK_SECONDS * 1000;
            localStorage.setItem("lockUntil", lockUntil.toString());
            startCountdown(lockUntil);
            setError("🔒 Too many failed attempts. Locked for 10 seconds.");
          } else {
            setError(`❌ Wrong password. Attempts remaining: ${remaining}`);
          }

        }, 4000);

      });
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.overlay}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <img src="/logo1.png" className={styles.logo} alt="City Logo" />
            <div className={styles.title}>
              <h1>City Social Welfare and Development Office</h1>
              <p>City of Biñan</p>
            </div>
            <img src="/cswd.png" className={styles.logo} alt="CSWD Logo" />
          </div>

          <h2>Welcome Back!</h2>

          {error && <div style={{ background: '#e74c3c', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
          {success && <div style={{ background: '#2ecc71', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold' }}>{success}</div>}

          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={isLocked}>
              {isLocked ? `Locked (${lockTimeRemaining}s)` : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}