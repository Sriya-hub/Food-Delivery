import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./Analytics.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─── Helpers ─────────────────────────────────────── */
function fmt(n) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000)     return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + Math.round(n);
}

const COLORS = {
  teal:   "#1D9E75",
  blue:   "#378ADD",
  amber:  "#d97706",
  red:    "#ef4444",
  purple: "#8b5cf6",
  green:  "#16a34a",
  rose:   "#f43f5e",
};

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#94a3b8", font: { size: 11, family: "DM Sans" } }, grid: { color: "rgba(0,0,0,0.03)" } },
    y: { ticks: { color: "#94a3b8", font: { size: 11, family: "DM Sans" } }, grid: { color: "rgba(0,0,0,0.03)" } },
  },
};

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  cutout: "72%",
};

/* ─── Animate on scroll ───────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Animated counter ────────────────────────────── */
function CountUp({ target, duration = 1200, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
        const tick = (now) => {
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
    return () => obs.disconnect();
  }, [target, duration]);

  // If target is already formatted (like ₹1.2L), just display it after reveal
  const isFormatted = typeof target === "string" && /[₹LKCr]/.test(target);

  return <span ref={ref}>{isFormatted ? target : `${prefix}${val.toLocaleString()}${suffix}`}</span>;
}

/* ─── StatCard ────────────────────────────────────── */
function StatCard({ label, value, sub, colorVar, icon, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="stat-card"
      style={{
        "--card-accent": colorVar,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(.22,.68,0,1.2) ${delay}ms`,
      }}
    >
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <div className="stat-card__value">
        <CountUp target={value} />
      </div>
      {sub && <div className="stat-card__sub">{sub}</div>}
      <div className="stat-card__bar" />
    </div>
  );
}

/* ─── SectionTitle ────────────────────────────────── */
function SectionTitle({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <h2
      ref={ref}
      className="section-title"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-18px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      {children}
    </h2>
  );
}

/* ─── ChartCard ───────────────────────────────────── */
function ChartCard({ title, height = 240, children, delay = 0, span = 1 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="chart-card-new"
      style={{
        gridColumn: `span ${span}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(.22,.68,0,1.2) ${delay}ms`,
      }}
    >
      <div className="chart-card-new__title">{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

/* ─── StatusBar ───────────────────────────────────── */
function StatusBar({ label, value, total, color, delay = 0 }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="status-bar" style={{ "--bar-color": color }}>
      <div className="status-bar__header">
        <span>{label}</span>
        <span>{value.toLocaleString()} <em>({pct}%)</em></span>
      </div>
      <div className="status-bar__track">
        <div
          className="status-bar__fill"
          style={{
            width: visible ? `${pct}%` : "0%",
            transition: `width 0.9s cubic-bezier(.22,.68,0,1.2) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ─── LegendRow ───────────────────────────────────── */
function LegendRow({ items }) {
  return (
    <div className="legend-row">
      {items.map((it, i) => (
        <div key={i} className="legend-row__item">
          <span className="legend-row__dot" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetch(`${API}/api/admin/analytics`)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((result) => {
        if (!result.success) throw new Error(result.message || "Failed to load");
        setData(result);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="an-loader">
      <div className="an-spinner" />
      <span>Loading analytics…</span>
    </div>
  );

  if (error) return (
    <div className="an-error">⚠️ {error}</div>
  );

  const { users, orders, payments, revenue } = data;
  const totalUsers   = users.customers + users.merchants + users.deliveryUsers + users.admins;
  const deliveryRate = orders.total > 0 ? ((orders.delivered / orders.total) * 100).toFixed(1) : 0;
  const cancelRate   = orders.total > 0 ? ((orders.cancelled / orders.total) * 100).toFixed(1) : 0;
  const pmTotal      = payments.onlineOrders + payments.codOrders;
  const onlinePct    = pmTotal > 0 ? Math.round((payments.onlineOrders / pmTotal) * 100) : 0;

  return (
    <div className="an-page">

      {/* ── Header ── */}
      <div className="an-header">
        <div>
          <h1 className="an-header__title">Analytics</h1>
          <p className="an-header__sub">Live data · MongoDB</p>
        </div>
        <div className="an-header__badge">
          <span className="an-header__dot" />
          Live
        </div>
      </div>

      {/* ── USERS ── */}
      <SectionTitle delay={0}>👥 Users</SectionTitle>
      <div className="an-grid an-grid--cards">
        {[
          { label: "Customers",        value: users.customers,        icon: "🧑‍💼", colorVar: COLORS.teal,   sub: "registered customers",         delay: 0   },
          { label: "Merchants",        value: users.merchants,        icon: "🏪",  colorVar: COLORS.blue,   sub: "active merchants",              delay: 60  },
          { label: "Delivery Partners",value: users.deliveryPartners, icon: "🛵",  colorVar: COLORS.amber,  sub: "DeliveryPartner collection",    delay: 120 },
          { label: "Delivery Users",   value: users.deliveryUsers,    icon: "🚴",  colorVar: COLORS.purple, sub: "role: delivery in Users",       delay: 180 },
          { label: "Admins",           value: users.admins,           icon: "🛡️", colorVar: COLORS.green,  sub: "admin accounts",                delay: 240 },
          { label: "Total Users",      value: totalUsers,             icon: "👤",  colorVar: "#0f172a",     sub: "all roles combined",            delay: 300 },
        ].map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── ORDERS ── */}
      <SectionTitle delay={0}>📦 Orders</SectionTitle>
      <div className="an-grid an-grid--cards" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Orders", value: orders.total,                                                        icon: "🧾", colorVar: "#0f172a", sub: "all time",                   delay: 0   },
          { label: "Delivered",    value: orders.delivered,                                                    icon: "✅", colorVar: COLORS.green,  sub: `${deliveryRate}% success rate`, delay: 60  },
          { label: "Cancelled",    value: orders.cancelled,                                                    icon: "❌", colorVar: COLORS.red,    sub: `${cancelRate}% cancel rate`,    delay: 120 },
          { label: "Active Now",   value: orders.placed + orders.preparing + orders.outForDelivery,            icon: "🔄", colorVar: COLORS.blue,   sub: "placed + prep + out",           delay: 180 },
        ].map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="an-grid an-grid--2col">
        <ChartCard title="Orders by status" height={220} delay={0}>
          <Bar
            data={{
              labels: ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
              datasets: [{
                data: [orders.placed, orders.preparing, orders.outForDelivery, orders.delivered, orders.cancelled],
                backgroundColor: [COLORS.blue, COLORS.amber, COLORS.purple, COLORS.green, COLORS.red],
                borderRadius: 6,
                borderSkipped: false,
              }],
            }}
            options={CHART_OPTS}
          />
        </ChartCard>

        <ChartCard title="Order status breakdown" height={220} delay={100}>
          <div style={{ display: "flex", gap: 20, height: "100%", alignItems: "center" }}>
            <div style={{ flex: "0 0 130px", height: 130 }}>
              <Doughnut
                data={{
                  labels: ["Delivered", "Cancelled", "Placed", "Preparing", "Out for Delivery"],
                  datasets: [{
                    data: [orders.delivered, orders.cancelled, orders.placed, orders.preparing, orders.outForDelivery],
                    backgroundColor: [COLORS.green, COLORS.red, COLORS.blue, COLORS.amber, COLORS.purple],
                    borderWidth: 0,
                  }],
                }}
                options={PIE_OPTS}
              />
            </div>
            <div style={{ flex: 1, paddingRight: 4 }}>
              {[
                { label: "Delivered",        value: orders.delivered,      color: COLORS.green  },
                { label: "Cancelled",        value: orders.cancelled,      color: COLORS.red    },
                { label: "Placed",           value: orders.placed,         color: COLORS.blue   },
                { label: "Preparing",        value: orders.preparing,      color: COLORS.amber  },
                { label: "Out for Delivery", value: orders.outForDelivery, color: COLORS.purple },
              ].map((it, i) => (
                <StatusBar key={it.label} label={it.label} value={it.value} total={orders.total} color={it.color} delay={i * 80} />
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── REVENUE ── */}
      <SectionTitle delay={0}>💰 Revenue</SectionTitle>
      <div className="an-grid an-grid--cards">
        {[
          { label: "Total Revenue", value: fmt(revenue.totalRevenue),              icon: "💵", colorVar: COLORS.green,  sub: "sum of all orders",       delay: 0   },
          { label: "Paid Orders",   value: payments.paidOrders,                    icon: "✅", colorVar: COLORS.teal,   sub: "paymentStatus: PAID",     delay: 60  },
          { label: "Online Orders", value: payments.onlineOrders,                  icon: "🌐", colorVar: COLORS.blue,   sub: `${onlinePct}% of total`,  delay: 120 },
          { label: "COD Orders",    value: payments.codOrders,                     icon: "💸", colorVar: COLORS.amber,  sub: `${100-onlinePct}% of total`, delay: 180 },
        ].map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── PAYMENTS ── */}
      <SectionTitle delay={0}>💳 Payments</SectionTitle>
      <div className="an-grid an-grid--2col">
        <ChartCard title="Payment method split" height={200} delay={0}>
          <div style={{ display: "flex", gap: 20, height: "100%", alignItems: "center" }}>
            <div style={{ flex: "0 0 130px", height: 130 }}>
              <Doughnut
                data={{
                  labels: ["Online", "COD"],
                  datasets: [{
                    data: [payments.onlineOrders, payments.codOrders],
                    backgroundColor: [COLORS.teal, COLORS.amber],
                    borderWidth: 0,
                  }],
                }}
                options={PIE_OPTS}
              />
            </div>
            <div style={{ flex: 1 }}>
              <LegendRow items={[
                { label: `Online — ${payments.onlineOrders.toLocaleString()}`, color: COLORS.teal  },
                { label: `COD — ${payments.codOrders.toLocaleString()}`,       color: COLORS.amber },
              ]} />
              <StatusBar label="Online" value={payments.onlineOrders} total={pmTotal} color={COLORS.teal}  delay={0}   />
              <StatusBar label="COD"    value={payments.codOrders}    total={pmTotal} color={COLORS.amber} delay={100} />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Payment status vs orders" height={200} delay={100}>
          <div style={{ paddingTop: 8 }}>
            {[
              { label: "Paid",    value: payments.paidOrders,                             color: COLORS.green, delay: 0   },
              { label: "Unpaid",  value: Math.max(0, orders.total - payments.paidOrders), color: COLORS.red,   delay: 80  },
              { label: "Online",  value: payments.onlineOrders,                           color: COLORS.blue,  delay: 160 },
              { label: "COD",     value: payments.codOrders,                              color: COLORS.amber, delay: 240 },
            ].map((it) => (
              <StatusBar key={it.label} label={it.label} value={it.value} total={orders.total} color={it.color} delay={it.delay} />
            ))}
          </div>
        </ChartCard>
      </div>

    </div>
  );
}