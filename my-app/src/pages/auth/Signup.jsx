import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

/* =========================
   TOAST SYSTEM
========================= */

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
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, duration);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  };

  return {
    toasts,
    removeToast,
    success: (msg, dur) => addToast(msg, "success", dur),
    error:   (msg, dur) => addToast(msg, "error",   dur),
    info:    (msg, dur) => addToast(msg, "info",    dur),
  };
}

/* =========================
   FLOATING FOOD ICONS
========================= */

const FOOD_ICONS = ["🍕", "🍣", "🥗", "🍜", "🥐", "🍓", "🫐", "🥩", "🍷", "🧁"];

function FloatingFoods() {
  return (
    <div className="floating-foods" aria-hidden="true">
      {FOOD_ICONS.map((icon, i) => (
        <span key={i} className="food-bubble" style={{ "--i": i }}>
          {icon}
        </span>
      ))}
    </div>
  );
}

/* =========================
   ROLE OPTIONS
========================= */

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    desc: "Order food & groceries",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "merchant",
    label: "Merchant",
    desc: "List & sell your products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l1-5h16l1 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
        <path d="M9 9v12M15 9v12" />
      </svg>
    ),
  },
  {
    value: "delivery",
    label: "Delivery",
    desc: "Deliver orders & earn",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

/* =========================
   MAIN SIGNUP COMPONENT
========================= */

function Signup() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep]               = useState(1); // 1 = role pick, 2 = form
  const [role, setRole]               = useState("");
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  /* Password strength */
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)              score++;
    if (/[A-Z]/.test(pw))            score++;
    if (/[0-9]/.test(pw))            score++;
    if (/[^A-Za-z0-9]/.test(pw))    score++;
    return score;
  };

  const strength      = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthClass = ["", "weak", "fair", "good", "strong"][strength];

  /* =========================
     HANDLE SIGNUP
  ========================= */

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Creating your account…", 2500);

      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        role,
      });

      toast.success("Account created! Welcome to OmniRetail 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
      console.error(error);
      if (error.response) {
        toast.error(error.response.data.message || "Signup failed. Please try again.");
      } else {
        toast.error("Unable to reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  /* =========================
     STEP 1 — ROLE PICKER
  ========================= */

  const RolePicker = () => (
    <div className="role-picker">
      <div className="card-header">
        <div className="card-badge">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 10H7V7h2v4zm0-6H7V3h2v2z" />
          </svg>
          Get Started
        </div>
        <h2>Join OmniRetail</h2>
        <p>Choose how you'd like to use the platform</p>
      </div>

      <div className="role-cards">
        {ROLES.map((r) => (
          <button
            key={r.value}
            className={`role-card ${role === r.value ? "role-card--active" : ""}`}
            onClick={() => setRole(r.value)}
          >
            <span className="role-card__icon">{r.icon}</span>
            <span className="role-card__body">
              <strong>{r.label}</strong>
              <span>{r.desc}</span>
            </span>
            <span className="role-card__check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <button
        className={`login-btn ${!role ? "login-btn--disabled" : ""}`}
        onClick={() => role && setStep(2)}
        disabled={!role}
      >
        Continue
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className="signup-prompt">
        Already have an account?{" "}
        <Link to="/login">Sign in →</Link>
      </p>
    </div>
  );

  /* =========================
     STEP 2 — FORM
  ========================= */

  const SignupForm = () => (
    <>
      <div className="card-header">
        <button className="back-btn" onClick={() => setStep(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="card-badge" style={{ marginTop: "14px" }}>
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 9.5l-4-2.5V5h1v2.7l3.5 2.1-.5.7z" />
          </svg>
          {ROLES.find((r) => r.value === role)?.label} Account
        </div>
        <h2>Create account</h2>
        <p>Fill in your details to get started</p>
      </div>

      <div className="social-divider">
        <span>your information</span>
      </div>

      <div className="form-fields">

        {/* FULL NAME */}
        <div className="field-group">
          <label htmlFor="name">Full name</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="name"
              autoFocus
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="field-group">
          <label htmlFor="email">Email address</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 8l10 6 10-6" />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="field-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
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

          {/* STRENGTH METER */}
          {password && (
            <div className="strength-meter">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`strength-bar ${strength >= lvl ? `strength-bar--${strengthClass}` : ""}`}
                  />
                ))}
              </div>
              <span className={`strength-label strength-label--${strengthClass}`}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="field-group">
          <label htmlFor="confirm-password">Confirm password</label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
              className={
                confirmPassword
                  ? password === confirmPassword
                    ? "input--match"
                    : "input--mismatch"
                  : ""
              }
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label="Toggle confirm password visibility"
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
          {confirmPassword && password !== confirmPassword && (
            <p className="field-error">Passwords don't match</p>
          )}
        </div>

      </div>

      {/* SIGNUP BUTTON */}
      <button
        className={`login-btn ${loading ? "login-btn--loading" : ""}`}
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Creating account…
          </>
        ) : (
          <>
            Create Account
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      <p className="signup-prompt">
        Already have an account?{" "}
        <Link to="/login">Sign in →</Link>
      </p>

      <p className="terms-note">
        By creating an account you agree to our{" "}
        <a href="/terms">Terms of Service</a> &amp;{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </>
  );

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className={`login-page ${mounted ? "login-page--mounted" : ""}`}>

        {/* ===== LEFT PANEL ===== */}
        <div className="login-left">
          <FloatingFoods />

          <div className="login-left__content">
            <div className="brand">
              <div className="brand__logo">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
                  <path d="M12 28c0-6 4-10 8-10s8 4 8 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 14l4-4 4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="brand__name">OmniRetail</span>
            </div>

            <div className="hero-text">
              <h1>
                Your table
                <br />
                <em>awaits you</em>
                <br />
                everywhere.
              </h1>
              <p>
                Join thousands of food lovers, merchants,
                and delivery partners on OmniRetail.
              </p>
            </div>

            <div className="stat-pills">
              <div className="pill">
                <strong>50K+</strong>
                <span>Happy Diners</span>
              </div>
              <div className="pill">
                <strong>200+</strong>
                <span>Restaurants</span>
              </div>
              <div className="pill">
                <strong>4.9★</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>

          <div className="left-decoration" aria-hidden="true">
            <div className="deco-ring deco-ring--1" />
            <div className="deco-ring deco-ring--2" />
            <div className="deco-ring deco-ring--3" />
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="login-right">
          <div className={`login-card ${step === 2 ? "login-card--form" : ""}`}>
            {step === 1 ? <RolePicker /> : <SignupForm />}
          </div>
        </div>

      </div>
    </>
  );
}

export default Signup;