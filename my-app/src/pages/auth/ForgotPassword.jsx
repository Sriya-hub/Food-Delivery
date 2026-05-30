import "./ForgotPassword.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import bgImage from "../../assets/background.png";

/* ══════════════════════════════
   TOAST SYSTEM  (identical to Login)
══════════════════════════════ */
let toastId = 0;

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type} ${t.exiting ? "toast--exit" : "toast--enter"}`}
        >
          <span className="toast__icon">
            {t.type === "success" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t.type === "error" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            )}
            {t.type === "info" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className="toast__message">{t.message}</span>
          <button className="toast__close" onClick={() => removeToast(t.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
          <div className="toast__bar" />
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
  };

  return {
    toasts,
    removeToast,
    success: (m, d) => addToast(m, "success", d),
    error:   (m, d) => addToast(m, "error",   d),
    info:    (m, d) => addToast(m, "info",     d),
  };
}

/* ══════════════════════════════
   FLOATING FOOD BUBBLES
══════════════════════════════ */
const FOOD_ICONS = ["🍕","🍣","🥗","🍜","🥐","🍓","🫐","🥩","🍷","🧁","🌮","🍔"];

function FloatingFoods() {
  return (
    <div className="floating-foods" aria-hidden="true">
      {FOOD_ICONS.map((icon, i) => (
        <span key={i} className="food-bubble" style={{ "--i": i }}>{icon}</span>
      ))}
    </div>
  );
}

/* ══════════════════════════════
   STEP INDICATOR
══════════════════════════════ */
const STEPS = ["Email", "Verify OTP", "New Password"];

function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, idx) => {
        const state =
          idx < current ? "done" : idx === current ? "active" : "idle";
        return (
          <div key={idx} className={`step step--${state}`}>
            <div className="step__bubble">
              {state === "done" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            <span className="step__label">{label}</span>
            {idx < STEPS.length - 1 && <div className="step__line" />}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════
   OTP INPUT (6-box)
══════════════════════════════ */
function OtpInput({ value, onChange }) {
  const digits = Array(6).fill("");
  value.split("").forEach((ch, i) => { if (i < 6) digits[i] = ch; });

  const handleKey = (e, idx) => {
    const { key } = e;

    if (key === "Backspace") {
      const next = value.slice(0, idx === value.length ? idx - 1 : idx);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }

    if (!/^\d$/.test(key)) return;

    const arr = digits.slice();
    arr[idx] = key;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
    e.preventDefault();
  };

  return (
    <div className="otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          className={`otp-box ${d ? "otp-box--filled" : ""}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onPaste={handlePaste}
          onKeyDown={(e) => handleKey(e, i)}
          onChange={() => {}}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════
   FORGOT PASSWORD COMPONENT
══════════════════════════════ */
function ForgotPassword() {
  const navigate = useNavigate();
  const toast    = useToast();

  /* ── state ── */
  const [step,            setStep]            = useState(0); // 0 = email, 1 = otp, 2 = new password
  const [email,           setEmail]           = useState("");
  const [otp,             setOtp]             = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [mounted,         setMounted]         = useState(false);
  const [resendCooldown,  setResendCooldown]  = useState(0); // seconds
  const [animDir,         setAnimDir]         = useState("forward"); // forward | backward

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* ── cooldown timer ── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ── helpers ── */
  const advance = (dir = "forward") => {
    setAnimDir(dir);
    setStep((s) => (dir === "forward" ? s + 1 : s - 1));
  };

  /* ════════════════════════
     STEP 0 — Send OTP
  ════════════════════════ */
  const handleSendOtp = async () => {
    if (!email) { toast.error("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Sending OTP to your email…", 2500);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });

      toast.success("OTP sent! Check your inbox. 📬");
      setResendCooldown(60);
      advance("forward");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════
     STEP 1 — Verify OTP
  ════════════════════════ */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error("Please enter the complete 6-digit OTP."); return; }

    try {
      setLoading(true);
      toast.info("Verifying your OTP…", 2000);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email, otp });

      toast.success("OTP verified! ✅ Now set a new password.");
      advance("forward");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ── resend OTP ── */
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      toast.success("OTP resent! Check your inbox. 📬");
      setResendCooldown(60);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════
     STEP 2 — Reset Password
  ════════════════════════ */
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Updating your password…", 2000);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successfully! 🎉 Redirecting to login…", 3000);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── password strength ── */
  const strength = (() => {
    if (!newPassword) return { level: 0, label: "", color: "" };
    let score = 0;
    if (newPassword.length >= 8)               score++;
    if (/[A-Z]/.test(newPassword))             score++;
    if (/[0-9]/.test(newPassword))             score++;
    if (/[^A-Za-z0-9]/.test(newPassword))      score++;
    const map = [
      { level: 1, label: "Weak",   color: "#ef4444" },
      { level: 2, label: "Fair",   color: "#f97316" },
      { level: 3, label: "Good",   color: "#eab308" },
      { level: 4, label: "Strong", color: "#22c55e" },
    ];
    return map[score - 1] || { level: 0, label: "", color: "" };
  })();

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */
  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className={`fp-page ${mounted ? "fp-page--mounted" : ""}`}>

        {/* ── LEFT PANEL ── */}
        <div className="fp-left" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="left-overlay" />
          <FloatingFoods />
          <div className="fp-left__content">

            <div className="brand">
              <div className="brand__logo">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.2)" />
                  <path d="M12 28c0-6 4-10 8-10s8 4 8 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 14l4-4 4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="brand__name">Foodie</span>
            </div>

            <div className="hero-text">
              <h1>Locked out?<br /><em>No worries.</em><br />We've got you.</h1>
              <p>Reset your password in seconds and get back to enjoying great food.</p>
            </div>

            {/* Left-panel step preview */}
            <div className="left-steps">
              {STEPS.map((label, idx) => (
                <div key={idx} className={`left-step ${idx === step ? "left-step--active" : idx < step ? "left-step--done" : ""}`}>
                  <div className="left-step__dot">
                    {idx < step ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="fp-right">
          <div className={`fp-card fp-card--${animDir}`} key={step}>

            <StepIndicator current={step} />

            {/* ════════ STEP 0 — EMAIL ════════ */}
            {step === 0 && (
              <div className="fp-step-body">
                <div className="card-header">
                  <div className="card-badge">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3zm0 2a1 1 0 00-1 1v3l2.5 1.5.5-.87L8 9V6a1 1 0 00-1-1z" />
                    </svg>
                    Step 1 of 3
                  </div>
                  <h2>Forgot Password?</h2>
                  <p>Enter your registered email and we'll send you a one-time code.</p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label htmlFor="fp-email">Email address</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <path d="M2 8l10 6 10-6" />
                        </svg>
                      </span>
                      <input
                        id="fp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                <button
                  className={`fp-btn ${loading ? "fp-btn--loading" : ""}`}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" />Sending OTP…</>
                  ) : (
                    <>
                      Send OTP
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="fp-back-link">
                  Remembered it? <Link to="/login">Back to Sign In →</Link>
                </p>
              </div>
            )}

            {/* ════════ STEP 1 — OTP ════════ */}
            {step === 1 && (
              <div className="fp-step-body">
                <div className="card-header">
                  <div className="card-badge">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 9.5l-4-2.5V5h1v2.7l3.5 2.1-.5.7z" />
                    </svg>
                    Step 2 of 3
                  </div>
                  <h2>Enter OTP</h2>
                  <p>
                    We sent a 6-digit code to{" "}
                    <strong className="fp-email-highlight">{email}</strong>
                  </p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label>One-time password</label>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                </div>

                <button
                  className={`fp-btn ${loading ? "fp-btn--loading" : ""}`}
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" />Verifying…</>
                  ) : (
                    <>
                      Verify OTP
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="resend-row">
                  {resendCooldown > 0 ? (
                    <span className="resend-timer">Resend OTP in <strong>{resendCooldown}s</strong></span>
                  ) : (
                    <button className="resend-btn" onClick={handleResend} disabled={loading}>
                      Didn't receive it? <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                <button
                  className="fp-ghost-btn"
                  onClick={() => advance("backward")}
                  disabled={loading}
                >
                  ← Change email
                </button>
              </div>
            )}

            {/* ════════ STEP 2 — NEW PASSWORD ════════ */}
            {step === 2 && (
              <div className="fp-step-body">
                <div className="card-header">
                  <div className="card-badge">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12 6h-1V5A3 3 0 005 5v1H4a1 1 0 00-1 1v7a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1zm-5 5.73V13H7v-1.27a1.5 1.5 0 111 0zM10 6H6V5a2 2 0 014 0v1z" />
                    </svg>
                    Step 3 of 3
                  </div>
                  <h2>New Password</h2>
                  <p>Choose a strong password you haven't used before.</p>
                </div>

                <div className="form-fields">
                  {/* New password */}
                  <div className="field-group">
                    <label htmlFor="fp-new-pw">New password</label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </span>
                      <input
                        id="fp-new-pw"
                        type={showNew ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowNew((v) => !v)}
                        aria-label="Toggle new password"
                      >
                        {showNew ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {newPassword && (
                      <div className="strength-bar-wrap">
                        <div className="strength-bar">
                          {[1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className="strength-bar__seg"
                              style={{
                                background: seg <= strength.level ? strength.color : "var(--border)",
                                transition: "background 0.3s ease",
                              }}
                            />
                          ))}
                        </div>
                        <span className="strength-label" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="field-group">
                    <label htmlFor="fp-confirm-pw">Confirm password</label>
                    <div className={`input-wrapper ${confirmPassword && confirmPassword !== newPassword ? "input-wrapper--error" : ""} ${confirmPassword && confirmPassword === newPassword ? "input-wrapper--success" : ""}`}>
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </span>
                      <input
                        id="fp-confirm-pw"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label="Toggle confirm password"
                      >
                        {showConfirm ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <span className="match-hint match-hint--no">Passwords don't match</span>
                    )}
                    {confirmPassword && confirmPassword === newPassword && (
                      <span className="match-hint match-hint--yes">✓ Passwords match</span>
                    )}
                  </div>
                </div>

                <button
                  className={`fp-btn ${loading ? "fp-btn--loading" : ""}`}
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" />Resetting…</>
                  ) : (
                    <>
                      Reset Password
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}

export default ForgotPassword;