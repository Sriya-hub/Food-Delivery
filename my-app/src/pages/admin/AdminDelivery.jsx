import { useEffect, useState } from "react";
import "./AdminDelivery.css";

const API = "http://localhost:5000";

/* ══════════════════════════════
   BADGE
══════════════════════════════ */
function Badge({ status }) {
  const key = status?.toLowerCase();
  return (
    <span className={`ad-badge ${key}`}>
      <span className="ad-badge-dot" />
      {status}
    </span>
  );
}

/* ══════════════════════════════
   DOCUMENT IMAGE
══════════════════════════════ */
function DocImg({ src, label }) {
  if (!src) return null;
  const url = `${API}/${src.replace(/\\/g, "/")}`;
  return (
    <div>
      <p className="ad-doc-label">{label}</p>
      <img
        src={url}
        alt={label}
        className="ad-doc-img"
        onClick={() => window.open(url, "_blank")}
        onError={e => { e.target.style.display = "none"; }}
      />
    </div>
  );
}

/* ══════════════════════════════
   INFO ROW
══════════════════════════════ */
function InfoRow({ label, val }) {
  return (
    <div className="ad-info-row">
      <span className="ad-info-label">{label}</span>
      <span className="ad-info-val">{val || "—"}</span>
    </div>
  );
}

/* ══════════════════════════════
   SECTION
══════════════════════════════ */
function Section({ title, children }) {
  return (
    <div className="ad-info-section">
      <p className="ad-section-title">{title}</p>
      {children}
    </div>
  );
}

/* ══════════════════════════════
   AVATAR
══════════════════════════════ */
function Avatar({ src, name, size = "sm" }) {
  const [err, setErr] = useState(false);
  const url = src ? `${API}/${src.replace(/\\/g, "/")}` : null;

  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        className={size === "lg" ? "ad-modal-avatar" : "ad-avatar"}
        onError={() => setErr(true)}
      />
    );
  }

  return (
    <div className={size === "lg" ? "ad-modal-avatar-fallback" : "ad-avatar-fallback"}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

/* ══════════════════════════════
   PROFILE MODAL
══════════════════════════════ */
function ProfileModal({ partner, onClose, onAction }) {
  const [reason, setReason]         = useState("");
  const [showReject, setShowReject] = useState(false);

  const status = partner.isActive === false ? "Blocked" : partner.approvalStatus;

  return (
    <div className="ad-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal">

        {/* Header */}
        <div className="ad-modal-header">
          <Avatar src={partner.profilePhoto} name={partner.fullName} size="lg" />
          <div className="ad-modal-meta">
            <h2 className="ad-modal-name">{partner.fullName}</h2>
            <p className="ad-modal-contact">{partner.mobile} · {partner.email}</p>
            <Badge status={status} />
          </div>
          <button className="ad-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="ad-modal-body">

          {/* LEFT */}
          <div>
            <Section title="Personal Details">
              <InfoRow label="Full Name" val={partner.fullName} />
              <InfoRow label="Mobile"    val={partner.mobile} />
              <InfoRow label="Email"     val={partner.email} />
              <InfoRow label="DOB"       val={partner.dob} />
              <InfoRow label="Gender"    val={partner.gender} />
            </Section>

            <Section title="Address">
              <InfoRow label="House No" val={partner.address?.houseNo} />
              <InfoRow label="Street"   val={partner.address?.street} />
              <InfoRow label="Area"     val={partner.address?.area} />
              <InfoRow label="City"     val={partner.address?.city} />
              <InfoRow label="State"    val={partner.address?.state} />
              <InfoRow label="Pincode"  val={partner.address?.pincode} />
            </Section>

            <Section title="Work Details">
              <InfoRow label="Work Type"      val={partner.workType} />
              <InfoRow label="Working Hours"  val={partner.workingHours} />
              <InfoRow label="Preferred Area" val={partner.preferredArea} />
              <InfoRow label="Location"       val={partner.locationPermission ? "Granted ✓" : "Denied ✗"} />
            </Section>

            <Section title="Emergency Contact">
              <InfoRow label="Name"     val={partner.emergencyName} />
              <InfoRow label="Relation" val={partner.emergencyRelation} />
              <InfoRow label="Phone"    val={partner.emergencyPhone} />
            </Section>

            <Section title="Bank Details">
              <InfoRow label="Account Holder" val={partner.bankHolderName} />
              <InfoRow label="Bank Name"      val={partner.bankName} />
              <InfoRow label="Account No."    val={partner.accountNumber} />
              <InfoRow label="IFSC Code"      val={partner.ifscCode} />
              <InfoRow label="UPI ID"         val={partner.upiId} />
            </Section>

            <Section title="Vehicle & Documents">
              <InfoRow label="Vehicle Type"   val={partner.vehicleType} />
              <InfoRow label="Vehicle Number" val={partner.vehicleNumber} />
              <InfoRow label="Aadhaar No."    val={partner.aadhaarNumber} />
              <InfoRow label="DL Number"      val={partner.drivingLicenseNumber} />
            </Section>

            <Section title="Meta">
              <InfoRow label="Partner ID"  val={partner._id} />
              <InfoRow label="User ID"     val={partner.userId} />
              <InfoRow label="Registered"  val={new Date(partner.createdAt).toLocaleString()} />
              <InfoRow label="Last Login"  val={partner.lastLogin ? new Date(partner.lastLogin).toLocaleString() : "Never"} />
            </Section>

            {partner.rejectionReason && (
              <div className="ad-rejection-box">
                <p>Rejection Reason</p>
                <p>{partner.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* RIGHT — documents */}
          <div>
            <Section title="Documents">
              <DocImg src={partner.profilePhoto}        label="Profile Photo" />
              <DocImg src={partner.aadhaarFront}        label="Aadhaar Front" />
              <DocImg src={partner.aadhaarBack}         label="Aadhaar Back" />
              <DocImg src={partner.drivingLicenseImage} label="Driving License" />
              <DocImg src={partner.vehicleRC}           label="Vehicle RC" />
            </Section>
          </div>
        </div>

        {/* Actions */}
        <div className="ad-modal-actions">
          {partner.approvalStatus === "Pending" && partner.isActive !== false && (
            <>
              <button className="ad-btn ad-btn-lg ad-btn-approve" onClick={() => onAction(partner._id, "approve")}>
                ✓ Approve
              </button>
              <button className="ad-btn ad-btn-lg ad-btn-reject" onClick={() => setShowReject(v => !v)}>
                ✕ Reject
              </button>
            </>
          )}
          {partner.approvalStatus === "Approved" && partner.isActive !== false && (
            <button className="ad-btn ad-btn-lg ad-btn-reject" onClick={() => setShowReject(v => !v)}>
              ✕ Reject
            </button>
          )}
          {partner.isActive !== false
            ? <button className="ad-btn ad-btn-lg ad-btn-block"   onClick={() => onAction(partner._id, "block")}>⊘ Block</button>
            : <button className="ad-btn ad-btn-lg ad-btn-unblock" onClick={() => onAction(partner._id, "unblock")}>↺ Unblock</button>
          }
        </div>

        {showReject && (
          <div className="ad-reject-area">
            <textarea
              className="ad-reject-textarea"
              placeholder="Enter rejection reason…"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <button
              className="ad-btn ad-btn-lg ad-btn-reject"
              onClick={() => { onAction(partner._id, "reject", reason); setShowReject(false); }}
            >
              Confirm Rejection
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function AdminDelivery() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState(null);

  const fetchPartners = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/delivery-partners`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPartners(data.partners || data || []);
    } catch {
      showToast("Failed to load delivery partners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (id, action, reason = "") => {
    const map = {
      approve: `/api/admin/delivery-partners/${id}/approve`,
      reject:  `/api/admin/delivery-partners/${id}/reject`,
      block:   `/api/admin/delivery-partners/${id}/block`,
      unblock: `/api/admin/delivery-partners/${id}/unblock`,
    };
    try {
      const res = await fetch(`${API}${map[action]}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(action === "reject" ? { rejectionReason: reason } : {}),
      });
      if (!res.ok) throw new Error();
      showToast(`Partner ${action}d successfully`);
      setSelected(null);
      fetchPartners();
    } catch {
      showToast(`Failed to ${action} partner`, "error");
    }
  };

  const FILTERS  = ["All", "Pending", "Approved", "Rejected", "Blocked"];
  const getStatus = p => p.isActive === false ? "Blocked" : p.approvalStatus;

  const filtered = partners.filter(p => {
    const matchFilter = filter === "All" || getStatus(p) === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.fullName?.toLowerCase().includes(q) ||
      p.mobile?.includes(q) ||
      p.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? partners.length : partners.filter(p => getStatus(p) === f).length;
    return acc;
  }, {});

  return (
    <div className="ad-page">

      {toast && <div className={`ad-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="ad-header">
        <h1>Delivery Partners</h1>
        <p>Manage registrations, approvals, and access control</p>
      </div>

      <div className="ad-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`ad-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="ad-filter-count">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="ad-search-wrap">
        <span className="ad-search-icon">🔍</span>
        <input
          className="ad-search"
          placeholder="Search by name, mobile, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="ad-state">
          <div className="ad-state-icon">⏳</div>
          Loading delivery partners…
        </div>
      ) : filtered.length === 0 ? (
        <div className="ad-state">
          <div className="ad-state-icon">🚴</div>
          No partners found.
        </div>
      ) : (
        <div className="ad-table-card">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Mobile</th>
                <th>Vehicle</th>
                <th>Work Type</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="ad-partner-cell">
                      <Avatar src={p.profilePhoto} name={p.fullName} />
                      <div>
                        <p className="ad-partner-name">{p.fullName}</p>
                        <p className="ad-partner-email">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.mobile}</td>
                  <td>
                    {p.vehicleType} <span className="ad-vehicle-sub">· {p.vehicleNumber}</span>
                  </td>
                  <td>{p.workType}</td>
                  <td><Badge status={getStatus(p)} /></td>
                  <td className="ad-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="ad-row-actions">
                      <button className="ad-btn ad-btn-view" onClick={() => setSelected(p)}>View</button>
                      {p.approvalStatus === "Pending" && p.isActive !== false && (
                        <>
                          <button className="ad-btn ad-btn-approve" onClick={() => handleAction(p._id, "approve")}>✓</button>
                          <button className="ad-btn ad-btn-reject"  onClick={() => setSelected(p)}>✕</button>
                        </>
                      )}
                      {p.isActive !== false
                        ? <button className="ad-btn ad-btn-block"   onClick={() => handleAction(p._id, "block")}>⊘</button>
                        : <button className="ad-btn ad-btn-unblock" onClick={() => handleAction(p._id, "unblock")}>↺</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ProfileModal
          partner={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}