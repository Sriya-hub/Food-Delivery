import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/login"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({
      name:    parsed.name    || "",
      email:   parsed.email   || "",
      phone:   parsed.phone   || "",
      address: parsed.address || "",
    });
  }, [navigate]);

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = () => {
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };

  const handleChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  if (!user) return null;

  return (
    <>
      <Header />

      <div className="pf-page">

        {/* ── Decorative background blobs ── */}
        <div className="pf-blob pf-blob--1" aria-hidden="true" />
        <div className="pf-blob pf-blob--2" aria-hidden="true" />

        <div className="pf-container">

          {/* ── Back ── */}
          <button className="pf-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>

          {/* ── Hero ── */}
          <div className="pf-hero">
            <div className="pf-hero__glow" aria-hidden="true" />
            <div className="pf-hero__avatar">{initials}</div>
            <div className="pf-hero__info">
              <h1 className="pf-hero__name">{user.name}</h1>
              <p className="pf-hero__email">{user.email}</p>
              <span className="pf-hero__badge">🍴 Foodie Member</span>
            </div>
          </div>

          {/* ── Toast ── */}
          {saved && (
            <div className="pf-toast" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Profile updated successfully!
            </div>
          )}

          {/* ── Info card ── */}
          <div className="pf-card">
            <div className="pf-card__head">
              <div className="pf-card__title">
                <div className="pf-card__title-dot" />
                Personal Information
              </div>
              {!editing ? (
                <button className="pf-edit-btn" onClick={() => setEditing(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="pf-edit-actions">
                  <button className="pf-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="pf-save-btn"   onClick={handleSave}>Save Changes</button>
                </div>
              )}
            </div>

            <div className="pf-fields">
              <PfField
                label="Full Name" value={form.name} editing={editing} type="text"
                placeholder="Your full name" onChange={v => handleChange("name", v)}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
              />
              <PfField
                label="Email Address" value={form.email} editing={editing} type="email"
                placeholder="your@email.com" onChange={v => handleChange("email", v)}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>}
              />
              <PfField
                label="Phone Number" value={form.phone} editing={editing} type="tel"
                placeholder="Add phone number" onChange={v => handleChange("phone", v)}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.36 19 19.45 19.45 0 0 1 5 12.64 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              />
              <PfField
                label="Delivery Address" value={form.address} editing={editing} type="text"
                placeholder="Add default delivery address" onChange={v => handleChange("address", v)}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
              />
            </div>
          </div>

          {/* ── Quick links ── */}
          <div className="pf-links">
            <PfLink
              label="My Orders" sublabel="Track & view your order history"
              accent="#ff6b2b" onClick={() => navigate("/my-orders")}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>}
            />
            <PfLink
              label="Table Bookings" sublabel="Manage your restaurant reservations"
              accent="#7c3aed" onClick={() => navigate("/reservations")}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>}
            />
            <PfLink
              label="My Cart" sublabel="View items waiting in your cart"
              accent="#ff3b7a" onClick={() => navigate("/cart")}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
            />
          </div>

          {/* ── Logout ── */}
          <button className="pf-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>

        </div>
      </div>
    </>
  );
}

/* ── Field sub-component ── */
function PfField({ label, value, editing, onChange, type, placeholder, icon }) {
  return (
    <div className="pf-field">
      <div className="pf-field__icon">{icon}</div>
      <div className="pf-field__body">
        <span className="pf-field__label">{label}</span>
        {editing ? (
          <input
            className="pf-field__input"
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
          />
        ) : (
          <p className="pf-field__value">
            {value || <em className="pf-field__empty">{placeholder}</em>}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Quick-link sub-component ── */
function PfLink({ label, sublabel, accent, onClick, icon }) {
  return (
    <button className="pf-link" onClick={onClick} style={{ "--acc": accent }}>
      <span className="pf-link__icon">{icon}</span>
      <span className="pf-link__text">
        <span className="pf-link__label">{label}</span>
        <span className="pf-link__sub">{sublabel}</span>
      </span>
      <svg className="pf-link__arrow" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  );
}