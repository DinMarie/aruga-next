"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 500;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setLockTimeRemaining(remaining);
      }
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        setTimeout(() => router.push("/table"), 1000);
      })
      .catch(() => {
        setTimeout(() => {
          attempts++;
          localStorage.setItem("loginAttempts", attempts.toString());
          let remaining = MAX_ATTEMPTS - attempts;

          if (attempts >= MAX_ATTEMPTS) {
            const lockUntil = Date.now() + LOCK_SECONDS * 1000;
            localStorage.setItem("lockUntil", lockUntil.toString());
            startCountdown(lockUntil);
            setError("🔒 Too many failed attempts. Locked for 10 minutes.");
          } else {
            setError(`❌ Wrong password. Attempts remaining: ${remaining}`);
          }
        }, 4000);
      });
  };

  return (
    <div className="loginWrapper">
      <div className="overlay">
        <div className="loginCard">
          <div className="loginHeader">
            <img src="/logo1.png" className="logo" alt="City Logo" />
            <div className="title">
              <h1>City Social Welfare and Development Office</h1>
              <p>City of Biñan</p>
            </div>
            <img src="/cswd.png" className="logo" alt="CSWD Logo" />
          </div>

          <h2>Welcome Back!</h2>

          {error && (
            <div
              style={{
                background: "#e74c3c",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                background: "#2ecc71",
                color: "white",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* ✅ Wrap username the same way as password so both line up */}
            <div style={{ width: "100%", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "0",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password wrapper */}
            <div
              style={{
                position: "relative",
                width: "100%",
                marginBottom: "15px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  paddingRight: "70px",
                  marginBottom: "0",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "auto",
                  padding: "0",
                  margin: "0",
                  background: "none",
                  border: "none",
                  borderRadius: "0",
                  color: "#888",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  lineHeight: "1",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLocked}
              style={{ marginTop: "5px" }}
            >
              {isLocked ? `Locked (${lockTimeRemaining}s)` : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
