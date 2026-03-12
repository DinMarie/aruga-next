'use client'; // This tells Next.js this is an interactive client-side component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import '../styles/loginstyle.css'; // Import your custom CSS

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Used to navigate between pages

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Replicating your logic: adding the domain to the username
    const email = username + "@cswdo-binan.com"; 

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("✅ Login successful");
        router.push('/table'); // Redirects to the table page
      })
      .catch((err) => {
        setError("❌ Wrong password or user not found.");
      });
  };

  return (
    <div className="overlay">
      <div className="login-card">
        <div className="header">
          <img src="/logo1.png" className="logo" alt="City Logo" />
          <div className="title">
            <h1>City Social Welfare and Development Office</h1>
            <p>City of Biñan</p>
          </div>
          <img src="/cswd.png" className="logo" alt="CSWD Logo" />
        </div>

        <h2>Welcome Back!</h2>

        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Replaces getElementById
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}