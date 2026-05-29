import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token") || "";
}
function saveUserLocal(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export default function Profile() {
  const navigate = useNavigate();

  const [user,    setUser]    = useState(null);
  const [phone,   setPhone]   = useState("");
  const [editing, setEditing] = useState(false);
  const [toast,   setToast]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [mounted, setMounted] = useState(false);

  const [addresses,    setAddresses]    = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm,     setAddrForm]     = useState({
    label: "Home", line1: "", line2: "", city: "", pincode: "", isDefault: false,
  });
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { navigate("/login"); return; }
    const parsed = JSON.parse(raw);
    setUser(parsed);
    setPhone(parsed.phoneNumber || "");
    setAddresses(parsed.deliveryAddresses || []);
    fetchProfile();
    setTimeout(() => setMounted(true), 60);
  }, [navigate]);

  async function fetchProfile() {
    try {
      const res  = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setPhone(data.user.phoneNumber || "");
        setAddresses(data.user.deliveryAddresses || []);
        saveUserLocal(data.user);
      }
    } catch { /* silent */ }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user); saveUserLocal(data.user); setEditing(false);
        showToast("success", "Profile updated successfully!");
      } else { showToast("error", data.message || "Update failed"); }
    } catch { showToast("error", "Network error — please try again"); }
    finally  { setSaving(false); }
  }

  async function handleAddAddress() {
    if (!addrForm.line1.trim()) { showToast("error", "Address line 1 is required"); return; }
    setAddrSaving(true);
    try {
      const res  = await fetch(`${API_URL}/api/profile/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.deliveryAddresses);
        const u = { ...user, deliveryAddresses: data.deliveryAddresses };
        setUser(u); saveUserLocal(u);
        setShowAddrForm(false);
        setAddrForm({ label: "Home", line1: "", line2: "", city: "", pincode: "", isDefault: false });
        showToast("success", "Address saved!");
      } else { showToast("error", data.message || "Could not save address"); }
    } catch { showToast("error", "Network error — please try again"); }
    finally  { setAddrSaving(false); }
  }

  async function handleDeleteAddress(addressId) {
    try {
      const res  = await fetch(`${API_URL}/api/profile/address/${addressId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.deliveryAddresses);
        const u = { ...user, deliveryAddresses: data.deliveryAddresses };
        setUser(u); saveUserLocal(u);
        showToast("success", "Address removed");
      }
    } catch { showToast("error", "Could not remove address"); }
  }

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const totalOrders    = user?.orderCount    ?? 0;
  const totalAddresses = addresses.length;

  if (!user) return null;

  return (
    <div className={`pf ${mounted ? "pf--in" : ""}`}>
      <Header />

      {/* ── HERO ── */}
      <div className="pf__hero">
        <div className="pf__hero-inner">
          {/* Left: badge + title + sub */}
          <div className="pf__hero-left">
            <div className="pf__badge">✦ My Profile</div>
            <h1 className="pf__title">
              My <em>Account</em>
            </h1>
            <p className="pf__sub">Manage your personal info, addresses and preferences.</p>
          </div>

          {/* Right: avatar card */}
          <div className="pf__hero-right">
            <div className="pf__avatar">{initials}</div>
            <div className="pf__hero-meta">
              <span className="pf__hero-name">{user.name}</span>
              <span className="pf__hero-email">{user.email}</span>
              <span className="pf__hero-member">🍴 Foodie Member</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="pf__stats">
          {[
            { v: totalOrders,    l: "Orders"    },
            { v: totalAddresses, l: "Addresses" },
            { v: user.phoneNumber ? "Added" : "—", l: "Phone" },
          ].map(({ v, l }) => (
            <div className="pf__stat" key={l}>
              <strong>{v}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="pf__wrap">

        {/* Toast */}
        {toast && (
          <div className={`pf__toast pf__toast--${toast.type}`} role="status">
            {toast.type === "success"
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            }
            {toast.msg}
          </div>
        )}

        {/* ── PERSONAL INFORMATION CARD ── */}
        <div className="pf__card">
          <div className="pf__card-head">
            <div className="pf__card-title">
              <div className="pf__card-dot" />
              Personal Information
            </div>
            {!editing ? (
              <button className="pf__edit-btn" onClick={() => setEditing(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="pf__edit-actions">
                <button className="pf__cancel-btn" onClick={() => { setEditing(false); setPhone(user.phoneNumber || ""); }}>Cancel</button>
                <button className="pf__save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="pf__fields">
            <PfField
              label="Full Name" value={user.name} editing={false} locked
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
            />
            <PfField
              label="Email Address" value={user.email} editing={false} locked
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7"/></svg>}
            />
            <PfField
              label="Phone Number" value={phone} editing={editing} type="tel"
              placeholder="Add phone number" onChange={setPhone}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.36 19 19.45 19.45 0 0 1 5 12.64 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
            />
          </div>
        </div>

        {/* ── DELIVERY ADDRESSES CARD ── */}
        <div className="pf__card">
          <div className="pf__card-head">
            <div className="pf__card-title">
              <div className="pf__card-dot pf__card-dot--purple" />
              Delivery Addresses
            </div>
            <button className="pf__edit-btn" onClick={() => setShowAddrForm(v => !v)}>
              {showAddrForm ? (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancel</>
              ) : (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Add New</>
              )}
            </button>
          </div>

          {showAddrForm && (
            <div className="pf__addr-form">
              <div className="pf__addr-grid">
                <div className="pf__addr-group pf__addr-group--half">
                  <label className="pf__field-label">Label</label>
                  <select className="pf__field-input" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))}>
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <div className="pf__addr-group pf__addr-group--half pf__addr-check-row">
                  <label className="pf__check-label">
                    <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} />
                    Set as default
                  </label>
                </div>
                <div className="pf__addr-group">
                  <label className="pf__field-label">Address Line 1 *</label>
                  <input className="pf__field-input" placeholder="Street, Building, Flat no." value={addrForm.line1} onChange={e => setAddrForm(p => ({ ...p, line1: e.target.value }))} />
                </div>
                <div className="pf__addr-group">
                  <label className="pf__field-label">Address Line 2</label>
                  <input className="pf__field-input" placeholder="Area, Landmark (optional)" value={addrForm.line2} onChange={e => setAddrForm(p => ({ ...p, line2: e.target.value }))} />
                </div>
                <div className="pf__addr-group pf__addr-group--half">
                  <label className="pf__field-label">City</label>
                  <input className="pf__field-input" placeholder="City" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="pf__addr-group pf__addr-group--half">
                  <label className="pf__field-label">Pincode</label>
                  <input className="pf__field-input" placeholder="000000" value={addrForm.pincode} onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value }))} />
                </div>
              </div>
              <button className="pf__save-btn pf__addr-submit" onClick={handleAddAddress} disabled={addrSaving}>
                {addrSaving ? "Saving…" : "Save Address"}
              </button>
            </div>
          )}

          {addresses.length === 0 && !showAddrForm && (
            <div className="pf__addr-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
              <span>No delivery addresses yet. Add one!</span>
            </div>
          )}

          <div className="pf__addr-list">
            {addresses.map(addr => (
              <div key={addr._id} className={`pf__addr-item${addr.isDefault ? " pf__addr-item--default" : ""}`}>
                <div className="pf__addr-icon">
                  {addr.label === "Work"
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  }
                </div>
                <div className="pf__addr-body">
                  <div className="pf__addr-top">
                    <span className="pf__addr-label">{addr.label}</span>
                    {addr.isDefault && <span className="pf__addr-default-badge">Default</span>}
                  </div>
                  <p className="pf__addr-text">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}{addr.city ? `, ${addr.city}` : ""}{addr.pincode ? ` - ${addr.pincode}` : ""}
                  </p>
                </div>
                <button className="pf__addr-delete" onClick={() => handleDeleteAddress(addr._id)} title="Remove address">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="pf__links">
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

        {/* ── LOGOUT ── */}
        <button className="pf__logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>

      </div>
    </div>
  );
}

/* ── PfField ── */
function PfField({ label, value, editing, onChange, type = "text", placeholder, icon, locked }) {
  return (
    <div className="pf__field">
      <div className="pf__field-icon">{icon}</div>
      <div className="pf__field-body">
        <span className="pf__field-label">
          {label}
          {locked && <span className="pf__lock-badge">cannot change</span>}
        </span>
        {editing && !locked ? (
          <input className="pf__field-input" type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        ) : (
          <p className={`pf__field-value${locked ? " pf__field-value--locked" : ""}`}>
            {value || <em className="pf__field-empty">{placeholder || "—"}</em>}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── PfLink ── */
function PfLink({ label, sublabel, accent, onClick, icon }) {
  return (
    <button className="pf__link" onClick={onClick} style={{ "--acc": accent }}>
      <span className="pf__link-icon">{icon}</span>
      <span className="pf__link-text">
        <span className="pf__link-label">{label}</span>
        <span className="pf__link-sub">{sublabel}</span>
      </span>
      <svg className="pf__link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  );
}