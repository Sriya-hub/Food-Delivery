import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import bgImage from "../../assets/background.png";

/* ══════════════════════════════
   TOAST SYSTEM
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
    toasts, removeToast,
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

/* ══════════════════════════════════════════════
   LIVE CLOCK
══════════════════════════════════════════════ */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="live-clock">
      <div className="clock-time">
        <span className="clock-hm">{pad(now.getHours())}:{pad(now.getMinutes())}</span>
        <span className="clock-sec">{pad(now.getSeconds())}</span>
      </div>
      <div className="clock-date">
        {days[now.getDay()]}, {months[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAINTENANCE PAGE
══════════════════════════════════════════════ */
function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} · ${h12}:${pad(d.getMinutes())} ${ampm}`;
}

function CountdownTimer({ endDate }) {
  const calcLeft = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    const totalSec = Math.floor(diff / 1000);
    return {
      h: Math.floor(totalSec / 3600),
      m: Math.floor((totalSec % 3600) / 60),
      s: totalSec % 60,
    };
  };

  const [left, setLeft] = useState(calcLeft());
  useEffect(() => {
    const t = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="countdown">
      <div className="countdown__label">Estimated time remaining</div>
      <div className="countdown__tiles">
        <div className="countdown__tile">
          <span className="countdown__num">{pad(left.h)}</span>
          <span className="countdown__unit">hrs</span>
        </div>
        <div className="countdown__sep">:</div>
        <div className="countdown__tile">
          <span className="countdown__num">{pad(left.m)}</span>
          <span className="countdown__unit">min</span>
        </div>
        <div className="countdown__sep">:</div>
        <div className="countdown__tile">
          <span className="countdown__num">{pad(left.s)}</span>
          <span className="countdown__unit">sec</span>
        </div>
      </div>
    </div>
  );
}

function MaintenancePage({ startDate, endDate, onAdminClick }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  return (
    <div className={`maint-page ${mounted ? "maint-page--mounted" : ""}`}>
      {/* animated orbs */}
      <div className="maint-orbs" aria-hidden="true">
        <div className="orb orb--1" />
        <div className="orb orb--2" />
        <div className="orb orb--3" />
      </div>

      {/* gear grid bg */}
      <div className="maint-grid" aria-hidden="true" />

      <div className="maint-inner">

        {/* Brand top */}
        <div className="maint-brand">
          <div className="maint-brand__icon">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="rgba(255,255,255,0.15)" />
              <path d="M12 28c0-6 4-10 8-10s8 4 8 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 18V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 14l4-4 4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="maint-brand__name">Foodie</span>
        </div>

        {/* Card */}
        <div className="maint-card">

          {/* Gear icon */}
          <div className="maint-gear-wrap">
            <div className="maint-gear maint-gear--outer">
              <svg viewBox="0 0 80 80" fill="none">
                <path d="M40 24a16 16 0 100 32 16 16 0 000-32z" stroke="currentColor" strokeWidth="3"/>
                <path d="M40 4v8M40 68v8M4 40h8M68 40h8M12.7 12.7l5.6 5.6M61.7 61.7l5.6 5.6M12.7 67.3l5.6-5.6M61.7 18.3l5.6-5.6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="maint-status-badge">
            <span className="maint-pulse" />
            Scheduled Maintenance
          </div>

          <h1 className="maint-title">We'll be right back</h1>
          <p className="maint-desc">
            Our team is performing scheduled maintenance and server upgrades to bring you an even better experience. All services will be restored shortly.
          </p>

          {/* Window */}
          <div className="maint-window">
            <div className="maint-window__header">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Maintenance Window
            </div>
            <div className="maint-window__rows">
              <div className="maint-window__row">
                <span className="maint-window__key">Start</span>
                <span className="maint-window__val">{formatDateTime(startDate)}</span>
              </div>
              <div className="maint-window__divider" />
              <div className="maint-window__row">
                <span className="maint-window__key">End</span>
                <span className="maint-window__val maint-window__val--end">{formatDateTime(endDate)}</span>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {endDate && <CountdownTimer endDate={endDate} />}

          {/* Live clock */}
          <LiveClock />

          {/* Alert */}
          <div className="maint-alert">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            All services will be fully restored immediately after the maintenance window.
          </div>

          <p className="maint-apology">
            We apologise for any inconvenience and appreciate your patience.
          </p>

          {/* Admin login link */}
          <button className="maint-admin-btn" onClick={onAdminClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Admin Login
          </button>

        </div>

        <p className="maint-footer">Department of IT Services · Foodie Platform</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   LOGIN COMPONENT
══════════════════════════════ */
function Login() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted,      setMounted]      = useState(false);

  /* ── Maintenance state ── */
  const [maintenance,    setMaintenance]    = useState(false);
  const [maintStart,     setMaintStart]     = useState(null);
  const [maintEnd,       setMaintEnd]       = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  /* ── Check maintenance on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/settings`
        );
        const s = data.settings;
        if (s?.maintenanceMode) {
          const now  = new Date();
          const from = s.maintenanceStartDate ? new Date(s.maintenanceStartDate) : null;
          const to   = s.maintenanceEndDate   ? new Date(s.maintenanceEndDate)   : null;
          /* show maintenance only if within the window */
          const inWindow = (!from || now >= from) && (!to || now <= to);
          if (inWindow) {
            setMaintenance(true);
            setMaintStart(s.maintenanceStartDate);
            setMaintEnd(s.maintenanceEndDate);
            return;
          }
        }
      } catch (_) { /* ignore — let login proceed normally */ }
      setTimeout(() => setMounted(true), 50);
    })();
  }, []);

  /* If admin clicks "Admin Login" on the maintenance page */
  const handleAdminClick = () => {
    setMaintenance(false);
    setShowAdminLogin(true);
    setTimeout(() => setMounted(true), 50);
  };

  /* ── handle login ── */
  const handleLogin = async () => {
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address."); return; }

    /* If we came from the maintenance admin-login path, only allow admins */
    try {
      setLoading(true);
      toast.info("Signing you in…", 2500);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      const { user, token } = data;

      if (user.isBlocked) {
        toast.error("Your account has been blocked. Please contact support.");
        setLoading(false);
        return;
      }

      /* If login was triggered from maintenance admin-only path, block non-admins */
      if (showAdminLogin && user.role !== "admin") {
        toast.error("Only administrators can log in during maintenance.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token",  token);
      localStorage.setItem("user",   JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      localStorage.setItem("role",   user.role);
      if (user.role === "merchant") localStorage.setItem("merchantId", user._id);

      toast.success("Welcome back! 🎉");

      setTimeout(() => {
        if (user.role === "customer") {
          navigate("/");
        } else if (user.role === "delivery") {
          const deliveryStatus = data.deliveryStatus;
          if (!deliveryStatus || !deliveryStatus.profileExists) navigate("/deliverypartner-registration");
          else if (deliveryStatus.approvalStatus === "Pending")  navigate("/delivery-review");
          else if (deliveryStatus.approvalStatus === "Rejected") navigate("/delivery-rejected");
          else if (deliveryStatus.approvalStatus === "Approved") navigate("/delivery/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "merchant") {
          if (!user.registrationCompleted)  navigate("/merchant-registration");
          else if (!user.isApproved)        navigate("/waiting-approval");
          else                              navigate("/merchant/dashboard");
        }
      }, 1200);

    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Your account has been blocked. Please contact support.");
      } else {
        toast.error(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Maintenance screen ── */
  if (maintenance) {
    return (
      <>
        <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
        <MaintenancePage
          startDate={maintStart}
          endDate={maintEnd}
          onAdminClick={handleAdminClick}
        />
      </>
    );
  }

  /* ══════════════════════════════
     RENDER — NORMAL LOGIN
  ══════════════════════════════ */
  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className={`login-page ${mounted ? "login-page--mounted" : ""}`}>

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="left-overlay" />
          <FloatingFoods />
          <div className="login-left__content">

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
              <h1>Fresh from<br /><em>the kitchen</em><br />to your door.</h1>
              <p>Premium ingredients, chef-crafted meals, delivered at the speed of hunger.</p>
            </div>

            <div className="stat-pills">
              <div className="pill"><strong>50K+</strong><span>Happy Diners</span></div>
              <div className="pill"><strong>200+</strong><span>Restaurants</span></div>
              <div className="pill"><strong>4.9★</strong><span>Rating</span></div>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-card">

            {showAdminLogin && (
              <div className="admin-maintenance-banner">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Maintenance mode active — admin access only
              </div>
            )}

            <div className="card-header">
              <div className="card-badge">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 9.5l-4-2.5V5h1v2.7l3.5 2.1-.5.7z" />
                </svg>
                {showAdminLogin ? "Admin Sign In" : "Quick Sign In"}
              </div>
              <h2>{showAdminLogin ? "Admin Portal" : "Welcome back"}</h2>
              <p>{showAdminLogin ? "Enter your admin credentials to continue" : "Sign in and start ordering delicious food"}</p>
            </div>

            <div className="social-divider"><span>continue with email</span></div>

            <div className="form-fields">
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
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="password">
                  Password
                  <Link to="/forgot-password" className="forgot-link" tabIndex={-1}>Forgot password?</Link>
                </label>
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
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
              </div>
            </div>

            <button
              className={`login-btn ${loading ? "login-btn--loading" : ""} ${showAdminLogin ? "login-btn--admin" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" />Signing in…</>
              ) : (
                <>
                  {showAdminLogin ? "Access Admin Panel" : "Sign In"}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            {!showAdminLogin && (
              <>
                <p className="signup-prompt">
                  New to Foodie? <Link to="/signup">Create a free account →</Link>
                </p>
                <p className="terms-note">
                  By signing in you agree to our{" "}
                  <a href="/terms">Terms</a> &amp; <a href="/privacy">Privacy Policy</a>.
                </p>
              </>
            )}

            {showAdminLogin && (
              <button className="back-to-maint" onClick={() => { setMaintenance(true); setShowAdminLogin(false); setMounted(false); }}>
                ← Back to maintenance page
              </button>
            )}

          </div>
        </div>

      </div>
    </>
  );
}

export default Login;