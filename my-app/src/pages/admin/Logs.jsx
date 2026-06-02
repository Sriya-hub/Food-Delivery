import { useEffect, useState, useRef } from "react";
import "./Logs.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ── Animated Counter ── */
function CountUp({ target, duration = 900 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  const num = Math.max(0, parseInt(target, 10) || 0);

  useEffect(() => { started.current = false; setVal(0); }, [num]);

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
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * num));
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

/* ── Role config ── */
const ROLE_CONFIG = {
  admin:    { label: "Admin",    cls: "role-admin"    },
  merchant: { label: "Merchant", cls: "role-merchant" },
  customer: { label: "Customer", cls: "role-customer" },
  delivery: { label: "Delivery", cls: "role-delivery" },
};

const STATUS_CONFIG = {
  Success: { cls: "status-success", icon: <SuccessIcon /> },
  Warning: { cls: "status-warning", icon: <WarningIcon /> },
  Failed:  { cls: "status-failed",  icon: <FailedIcon  /> },
};

const FILTERS = ["All", "Success", "Warning", "Failed"];
const ROLES   = ["All Roles", "Admin", "Merchant", "Customer", "Delivery"];

export default function Logs() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("All");
  const [roleF, setRoleF]       = useState("All Roles");

  useEffect(() => {
    fetch(`${API}/api/admin/logs`)
      .then((res) => res.json())
      .then((data) => { setLogs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  /* ── counts ── */
  const counts = {
    total:   logs.length,
    success: logs.filter((l) => l.status === "Success").length,
    warning: logs.filter((l) => l.status === "Warning").length,
    failed:  logs.filter((l) => l.status === "Failed").length,
  };

  /* ── filtered ── */
  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.user?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.role?.toLowerCase().includes(q);
    const matchStatus = statusF === "All" || l.status === statusF;
    const matchRole   = roleF === "All Roles" || l.role?.toLowerCase() === roleF.toLowerCase();
    return matchSearch && matchStatus && matchRole;
  });

  const formatTime = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="logs-page">

      {/* ── Header ── */}
      <div className="logs-header">
        <div className="logs-header__left">
          <h1 className="logs-title">System Logs</h1>
          <p className="logs-sub">Monitor customer, merchant, delivery and admin activities across the platform.</p>
        </div>
        <div className="logs-live">
          <span className="logs-live__dot" />
          Live
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="logs-stats">
        {[
          { label: "Total Logs",   value: counts.total,   cls: "lsc-blue",    icon: <LogsIcon />,   delay: 0   },
          { label: "Success",      value: counts.success, cls: "lsc-green",   icon: <SuccessIcon />,delay: 70  },
          { label: "Warnings",     value: counts.warning, cls: "lsc-amber",   icon: <WarningIcon />,delay: 140 },
          { label: "Failed",       value: counts.failed,  cls: "lsc-red",     icon: <FailedIcon />, delay: 210 },
        ].map(({ label, value, cls, icon, delay }) => (
          <div key={label} className={`lsc-card ${cls}`} style={{ animationDelay: `${delay}ms` }}>
            <div className="lsc-icon">{icon}</div>
            <div className="lsc-body">
              <span className="lsc-num"><CountUp target={value} /></span>
              <span className="lsc-lbl">{label}</span>
            </div>
            <div className="lsc-glow" />
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="logs-toolbar">
        {/* Status filter pills */}
        <div className="logs-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`lpill ${statusF === f ? "lpill-active lpill-" + f.toLowerCase() : ""}`}
              onClick={() => setStatusF(f)}
            >
              {f}
              {f !== "All" && (
                <span className="lpill-count">{counts[f.toLowerCase()] ?? 0}</span>
              )}
            </button>
          ))}
        </div>

        <div className="logs-toolbar__right">
          {/* Role select */}
          <div className="logs-role-wrap">
            <RoleIcon />
            <select
              className="logs-role-select"
              value={roleF}
              onChange={(e) => setRoleF(e.target.value)}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="logs-search-wrap">
            <SearchIcon />
            <input
              className="logs-search"
              type="text"
              placeholder="Search user, action…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="logs-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="logs-card">
        {loading ? (
          <div className="logs-loading">
            <div className="logs-spinner" />
            <span>Loading logs…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="logs-empty">
            <EmptyIcon />
            <span>No logs match your filters.</span>
          </div>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Time</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const role   = ROLE_CONFIG[(log.role || "").toLowerCase()] || { label: log.role, cls: "role-default" };
                const status = STATUS_CONFIG[log.status] || { cls: "status-failed", icon: <FailedIcon /> };
                return (
                  <tr key={log._id} className="log-row" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="td-num">{i + 1}</td>
                    <td className="td-time">
                      <ClockIcon />
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="td-user">
                      <div className={`log-avatar role-avatar-${(log.role || "").toLowerCase()}`}>
                        {(log.user || "?")[0].toUpperCase()}
                      </div>
                      <span>{log.user}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${role.cls}`}>{role.label}</span>
                    </td>
                    <td className="td-action">{log.action}</td>
                    <td>
                      <span className={`status-badge ${status.cls}`}>
                        {status.icon}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer count ── */}
      {!loading && filtered.length > 0 && (
        <div className="logs-footer">
          Showing <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> logs
        </div>
      )}
    </div>
  );
}

/* ── Icons ── */
function LogsIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function SuccessIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12" strokeWidth="2.2"/></svg>; }
function WarningIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function FailedIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }
function SearchIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function ClockIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function RoleIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function EmptyIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }