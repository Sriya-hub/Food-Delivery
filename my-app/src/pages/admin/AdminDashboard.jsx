import "./AdminDashboard.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ─── Reveal hook ───────────────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible, delay];
}

/* ─── Animated number ───────────────────────────── */
/* ─── Animated number ───────────────────────────── */
function CountUp({ target, duration = 900 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  const num = Math.max(0, parseInt(target, 10) || 0);

  useEffect(() => {
    started.current = false;
    setVal(0);
  }, [num]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          if (cancelled) return;
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * num));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(num);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => { cancelled = true; obs.disconnect(); };
  }, [num, duration]);

  return <span ref={ref}>{val ?? 0}</span>;
}

/* ─── Reveal wrapper ────────────────────────────── */
function Reveal({ children, delay = 0, from = "bottom" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms = {
    bottom: "translateY(28px)",
    left:   "translateX(-24px)",
    right:  "translateX(24px)",
    scale:  "scale(0.95) translateY(16px)",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : (transforms[from] || transforms.bottom),
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(.22,.68,0,1.2) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
function AdminDashboard() {
  const [merchants, setMerchants] = useState([]);
  const [filter, setFilter]       = useState("all");

  const fetchMerchants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/merchants`);
      setMerchants(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/approve/${id}`);
      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/reject/${id}`);
      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  const filtered = merchants.filter((m) => {
    if (filter === "approved") return m.isApproved === true;
    if (filter === "pending")  return m.isApproved === false;
    return true;
  });

  const counts = {
    all:      merchants.length,
    approved: merchants.filter((m) =>  m.isApproved).length,
    pending:  merchants.filter((m) => !m.isApproved).length,
  };

  return (
    <div className="admin-content">

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: "Total Merchants", value: counts.all,      cls: "",           delay: 0   },
          { label: "Approved",        value: counts.approved, cls: "stat-green", delay: 80  },
          { label: "Pending",         value: counts.pending,  cls: "stat-amber", delay: 160 },
        ].map(({ label, value, cls, delay }) => (
          <Reveal key={label} delay={delay} from="bottom">
            <div className={`stat-card ${cls}`}>
              <span className="stat-num"><CountUp target={value} /></span>
              <span className="stat-lbl">{label}</span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Filter Tabs */}
      <Reveal delay={100} from="left">
        <div className="filter-tabs">
          {["all", "approved", "pending"].map((f) => (
            <button
              key={f}
              className={`tab-btn ${filter === f ? "tab-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="tab-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Table */}
      <Reveal delay={160} from="bottom">
        <div className="merchant-table-wrap">
          <table className="merchant-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Restaurant</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((merchant, i) => (
                <tr
                  key={merchant._id}
                  className="merchant-row"
                  style={{
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <td className="row-num">{i + 1}</td>
                  <td className="row-name">{merchant.restaurantName}</td>
                  <td className="row-muted">{merchant.email}</td>
                  <td className="row-muted">{merchant.phoneNumber}</td>
                  <td>
                    <span className={merchant.isApproved ? "badge-approved" : "badge-pending"}>
                      {merchant.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-approve" onClick={() => handleApprove(merchant._id)}>Approve</button>
                      <button className="btn-reject"  onClick={() => handleReject(merchant._id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="empty-row">No merchants found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

    </div>
  );
}

export default AdminDashboard;