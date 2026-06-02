import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AdminCustomers.css";

const API_URL = import.meta.env.VITE_API_URL;

/* ── Animated Counter ── */
function CountUp({ target, duration = 1000 }) {
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

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/customers`);
      setCustomers(res.data.customers);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleBlock = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/customers/block/${id}`);
      fetchCustomers();
    } catch (err) { console.log(err); }
  };

  const handleUnblock = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/customers/unblock/${id}`);
      fetchCustomers();
    } catch (err) { console.log(err); }
  };

  const counts = {
    all:     customers.length,
    active:  customers.filter((c) => !c.isBlocked).length,
    blocked: customers.filter((c) =>  c.isBlocked).length,
  };

  const filtered = customers
    .filter((c) => {
      if (filter === "active")  return !c.isBlocked;
      if (filter === "blocked") return  c.isBlocked;
      return true;
    })
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phoneNumber?.toLowerCase().includes(q)
      );
    });

  const initials  = (name = "") => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const STAT_CARDS = [
    { label: "Total Customers", value: counts.all,     cls: "cst-blue",  icon: <UsersIcon />,  delay: 0   },
    { label: "Active",          value: counts.active,  cls: "cst-green", icon: <CheckIcon />,  delay: 80  },
    { label: "Blocked",         value: counts.blocked, cls: "cst-red",   icon: <BlockIcon />,  delay: 160 },
  ];

  const TABS = [
    { key: "all",     label: "All Customers" },
    { key: "active",  label: "Active" },
    { key: "blocked", label: "Blocked" },
  ];

  return (
    <div className="cust-content">

      {/* ── Header ── */}
      <div className="cust-header">
        <div>
          <h1 className="cust-title">Customers</h1>
          <p className="cust-sub">Manage all registered users on the platform.</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cust-stats">
        {STAT_CARDS.map(({ label, value, cls, icon, delay }) => (
          <div
            key={label}
            className={`cst-card ${cls}`}
            style={{ animationDelay: `${delay}ms` }}
          >
            <div className="cst-icon">{icon}</div>
            <div className="cst-body">
              <span className="cst-num"><CountUp target={value} /></span>
              <span className="cst-lbl">{label}</span>
            </div>
            <div className="cst-glow" />
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="cust-toolbar">
        <div className="cust-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`ctab ${filter === key ? "ctab-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="ctab-count">{counts[key] ?? customers.length}</span>
            </button>
          ))}
        </div>

        <div className="cust-search-wrap">
          <SearchIcon />
          <input
            className="cust-search"
            type="text"
            placeholder="Search by name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="cust-loading">
          <div className="cust-spinner" />
          <span>Loading customers…</span>
        </div>
      ) : (
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c._id}
                  className={`cust-row ${c.isBlocked ? "row-blocked" : ""}`}
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <td className="td-num">{i + 1}</td>

                  <td>
                    <div className="cust-identity">
                      <div className={`cust-avatar ${c.isBlocked ? "avatar-blocked" : ""}`}>
                        {initials(c.name)}
                      </div>
                      <span className="cust-name">{c.name}</span>
                    </div>
                  </td>

                  <td className="td-muted">{c.email}</td>
                  <td className="td-muted">{c.phoneNumber || "—"}</td>
                  <td className="td-muted">{formatDate(c.createdAt)}</td>

                  <td>
                    <span className={`cbadge ${c.isBlocked ? "cbadge-blocked" : "cbadge-active"}`}>
                      {c.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  <td>
                    {c.isBlocked ? (
                      <button className="btn-unblock" onClick={() => handleUnblock(c._id)}>
                        <UnlockIcon /> Unblock
                      </button>
                    ) : (
                      <button className="btn-block" onClick={() => handleBlock(c._id)}>
                        <LockIcon /> Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="cust-empty">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Icons ── */
function UsersIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function CheckIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>; }
function BlockIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function LockIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UnlockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>; }

export default AdminCustomers;