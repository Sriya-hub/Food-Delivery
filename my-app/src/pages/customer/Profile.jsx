import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./Profile.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem("token") || "";
}

function saveUserLocal(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();

  const [user,    setUser]    = useState(null);
  const [phone,   setPhone]   = useState("");
  const [editing, setEditing] = useState(false);
  const [toast,   setToast]   = useState(null); // { type: "success"|"error", msg }
  const [saving,  setSaving]  = useState(false);

  /* Address state */
  const [addresses,    setAddresses]    = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm,     setAddrForm]     = useState({
    label: "Home", line1: "", line2: "", city: "", pincode: "", isDefault: false,
  });
  const [addrSaving, setAddrSaving] = useState(false);

  /* ── Load user from localStorage then refresh from server ── */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    const parsed = JSON.parse(raw);
    setUser(parsed);
    setPhone(parsed.phoneNumber || "");
    setAddresses(parsed.deliveryAddresses || []);

    /* Refresh from DB */
    fetchProfile();
  }, [navigate]);

  async function fetchProfile() {
    try {
      const res  = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setPhone(data.user.phoneNumber || "");
        setAddresses(data.user.deliveryAddresses || []);
        saveUserLocal(data.user);
      }
    } catch { /* silent — local data already shown */ }
  }

  /* ── Save phone number ── */
  async function handleSave() {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/profile`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        saveUserLocal(data.user);
        setEditing(false);
        showToast("success", "Profile updated successfully!");
      } else {
        showToast("error", data.message || "Update failed");
      }
    } catch {
      showToast("error", "Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  /* ── Add delivery address ── */
  async function handleAddAddress() {
    if (!addrForm.line1.trim()) {
      showToast("error", "Address line 1 is required");
      return;
    }
    setAddrSaving(true);
    try {
      const res  = await fetch(`${API}/profile/address`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.deliveryAddresses);
        const updatedUser = { ...user, deliveryAddresses: data.deliveryAddresses };
        setUser(updatedUser);
        saveUserLocal(updatedUser);
        setShowAddrForm(false);
        setAddrForm({ label: "Home", line1: "", line2: "", city: "", pincode: "", isDefault: false });
        showToast("success", "Address saved!");
      } else {
        showToast("error", data.message || "Could not save address");
      }
    } catch {
      showToast("error", "Network error — please try again");
    } finally {
      setAddrSaving(false);
    }
  }

  /* ── Delete delivery address ── */
  async function handleDeleteAddress(addressId) {
    try {
      const res  = await fetch(`${API}/profile/address/${addressId}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.deliveryAddresses);
        const updatedUser = { ...user, deliveryAddresses: data.deliveryAddresses };
        setUser(updatedUser);
        saveUserLocal(updatedUser);
        showToast("success", "Address removed");
      }
    } catch {
      showToast("error", "Could not remove address");
    }
  }

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (!user) return null;

  return (
    <>
      <Header />

      <div className="pf-page">
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
          {toast && (
            <div className={`pf-toast pf-toast--${toast.type}`} role="status">
              {toast.type === "success" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              )}
              {toast.msg}
            </div>
          )}

          {/* ══════════════════════════════════
              PERSONAL INFORMATION CARD
          ══════════════════════════════════ */}
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
                  <button className="pf-cancel-btn" onClick={() => { setEditing(false); setPhone(user.phoneNumber || ""); }}>
                    Cancel
                  </button>
                  <button className="pf-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="pf-fields">
              {/* Name — read only */}
              <PfField
                label="Full Name"
                value={user.name}
                editing={false}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                locked
              />
              {/* Email — read only */}
              <PfField
                label="Email Address"
                value={user.email}
                editing={false}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>}
                locked
              />
              {/* Phone — editable */}
              <PfField
                label="Phone Number"
                value={phone}
                editing={editing}
                type="tel"
                placeholder="Add phone number"
                onChange={setPhone}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.36 19 19.45 19.45 0 0 1 5 12.64 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
              />
            </div>
          </div>

          {/* ══════════════════════════════════
              DELIVERY ADDRESSES CARD
          ══════════════════════════════════ */}
          <div className="pf-card">
            <div className="pf-card__head">
              <div className="pf-card__title">
                <div className="pf-card__title-dot" style={{ background: "linear-gradient(135deg,#7c3aed,#ff3b7a)" }} />
                Delivery Addresses
              </div>
              <button className="pf-edit-btn" onClick={() => setShowAddrForm(v => !v)}>
                {showAddrForm ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Add New
                  </>
                )}
              </button>
            </div>

            {/* Add address form */}
            {showAddrForm && (
              <div className="pf-addr-form">
                <div className="pf-addr-form__grid">
                  <div className="pf-addr-form__group pf-addr-form__group--half">
                    <label className="pf-field__label">Label</label>
                    <select
                      className="pf-field__input"
                      value={addrForm.label}
                      onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))}
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="pf-addr-form__group pf-addr-form__group--half pf-addr-form__default-row">
                    <label className="pf-addr-form__check-label">
                      <input
                        type="checkbox"
                        checked={addrForm.isDefault}
                        onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                      />
                      Set as default
                    </label>
                  </div>
                  <div className="pf-addr-form__group">
                    <label className="pf-field__label">Address Line 1 *</label>
                    <input
                      className="pf-field__input"
                      placeholder="Street, Building, Flat no."
                      value={addrForm.line1}
                      onChange={e => setAddrForm(p => ({ ...p, line1: e.target.value }))}
                    />
                  </div>
                  <div className="pf-addr-form__group">
                    <label className="pf-field__label">Address Line 2</label>
                    <input
                      className="pf-field__input"
                      placeholder="Area, Landmark (optional)"
                      value={addrForm.line2}
                      onChange={e => setAddrForm(p => ({ ...p, line2: e.target.value }))}
                    />
                  </div>
                  <div className="pf-addr-form__group pf-addr-form__group--half">
                    <label className="pf-field__label">City</label>
                    <input
                      className="pf-field__input"
                      placeholder="City"
                      value={addrForm.city}
                      onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div className="pf-addr-form__group pf-addr-form__group--half">
                    <label className="pf-field__label">Pincode</label>
                    <input
                      className="pf-field__input"
                      placeholder="000000"
                      value={addrForm.pincode}
                      onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  className="pf-save-btn pf-addr-form__submit"
                  onClick={handleAddAddress}
                  disabled={addrSaving}
                >
                  {addrSaving ? "Saving…" : "Save Address"}
                </button>
              </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !showAddrForm && (
              <div className="pf-addr-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span>No delivery addresses yet. Add one!</span>
              </div>
            )}

            <div className="pf-addr-list">
              {addresses.map(addr => (
                <div key={addr._id} className={`pf-addr-item${addr.isDefault ? " pf-addr-item--default" : ""}`}>
                  <div className="pf-addr-item__icon">
                    {addr.label === "Work" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    )}
                  </div>
                  <div className="pf-addr-item__body">
                    <div className="pf-addr-item__top">
                      <span className="pf-addr-item__label">{addr.label}</span>
                      {addr.isDefault && <span className="pf-addr-item__default-badge">Default</span>}
                    </div>
                    <p className="pf-addr-item__text">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}{addr.city ? `, ${addr.city}` : ""}{addr.pincode ? ` - ${addr.pincode}` : ""}
                    </p>
                  </div>
                  <button
                    className="pf-addr-item__delete"
                    onClick={() => handleDeleteAddress(addr._id)}
                    title="Remove address"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
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

/* ══════════════════════════════════════════
   PfField — displays or edits one field
   locked = true  →  read-only, greyed out
══════════════════════════════════════════ */
function PfField({ label, value, editing, onChange, type = "text", placeholder, icon, locked }) {
  return (
    <div className="pf-field">
      <div className="pf-field__icon">{icon}</div>
      <div className="pf-field__body">
        <span className="pf-field__label">
          {label}
          {locked && <span className="pf-field__lock-badge">cannot change</span>}
        </span>
        {editing && !locked ? (
          <input
            className="pf-field__input"
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
          />
        ) : (
          <p className={`pf-field__value${locked ? " pf-field__value--locked" : ""}`}>
            {value || <em className="pf-field__empty">{placeholder || "—"}</em>}
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PfLink — quick-link row
══════════════════════════════════════════ */
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