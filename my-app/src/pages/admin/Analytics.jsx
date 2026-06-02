import { useState, useEffect } from "react";
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
  amber:  "#BA7517",
  red:    "#dc2626",
  purple: "#7F77DD",
  green:  "#16a34a",
};

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#9ca3af", font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.04)" } },
    y: { ticks: { color: "#9ca3af", font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.04)" } },
  },
};

const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

/* ─── Small Components ────────────────────────────── */
function StatCard({ label, value, sub, color = COLORS.teal, icon }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>}
      <div style={{ height: 3, borderRadius: 2, background: color, marginTop: 4, width: "40%" }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 16,
      fontWeight: 700,
      color: "#111",
      margin: "32px 0 16px",
      paddingBottom: 10,
      borderBottom: "2px solid #f3f4f6",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      {children}
    </h2>
  );
}

function ChartCard({ title, height = 240, children }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function LegendRow({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: it.color, display: "inline-block" }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function StatusBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
          {value.toLocaleString()} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────── */
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/admin/analytics`)

      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (!result.success) throw new Error(result.message || "Failed to load");
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#6b7280", gap: 10 }}>
      <div style={{
        width: 20, height: 20, border: "2px solid #e5e7eb",
        borderTopColor: COLORS.teal, borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      Loading analytics…
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: 32, color: COLORS.red, background: "#fef2f2", borderRadius: 12, margin: 24 }}>
      ⚠️ {error}
    </div>
  );

  const { users, orders, payments, revenue } = data;

  // Derived values
  const totalUsers  = users.customers + users.merchants + users.deliveryUsers + users.admins;
  const deliveryRate = orders.total > 0 ? ((orders.delivered / orders.total) * 100).toFixed(1) : 0;
  const cancelRate   = orders.total > 0 ? ((orders.cancelled / orders.total) * 100).toFixed(1) : 0;
  const onlinePct    = (payments.onlineOrders + payments.codOrders) > 0
    ? Math.round((payments.onlineOrders / (payments.onlineOrders + payments.codOrders)) * 100)
    : 0;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111", margin: 0 }}>Analytics</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>Live data from your MongoDB database</p>
      </div>

      {/* ── USERS ── */}
      <SectionTitle>👥 Users</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard icon="🧑‍💼" label="Customers"       value={users.customers.toLocaleString()}        color={COLORS.teal}   sub="registered customers" />
        <StatCard icon="🏪"  label="Merchants"        value={users.merchants.toLocaleString()}         color={COLORS.blue}   sub="active merchants" />
        <StatCard icon="🛵"  label="Delivery Partners" value={users.deliveryPartners.toLocaleString()} color={COLORS.amber}  sub="DeliveryPartner collection" />
        <StatCard icon="🚴"  label="Delivery Users"   value={users.deliveryUsers.toLocaleString()}     color={COLORS.purple} sub="role: delivery in Users" />
        <StatCard icon="🛡️" label="Admins"            value={users.admins.toLocaleString()}            color={COLORS.green}  sub="admin accounts" />
        <StatCard icon="👤"  label="Total Users"      value={totalUsers.toLocaleString()}              color="#111"          sub="all roles combined" />
      </div>

      {/* ── ORDERS ── */}
      <SectionTitle>📦 Orders</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🧾" label="Total Orders" value={orders.total.toLocaleString()}     color="#111" />
        <StatCard icon="✅" label="Delivered"    value={orders.delivered.toLocaleString()} color={COLORS.green}  sub={`${deliveryRate}% success rate`} />
        <StatCard icon="❌" label="Cancelled"    value={orders.cancelled.toLocaleString()} color={COLORS.red}    sub={`${cancelRate}% cancel rate`} />
        <StatCard icon="🔄" label="Active"       value={(orders.placed + orders.preparing + orders.outForDelivery).toLocaleString()} color={COLORS.blue} sub="placed + preparing + out" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Orders by status" height={220}>
          <Bar
            data={{
              labels: ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
              datasets: [{
                data: [orders.placed, orders.preparing, orders.outForDelivery, orders.delivered, orders.cancelled],
                backgroundColor: [COLORS.blue, COLORS.amber, COLORS.purple, COLORS.green, COLORS.red],
                borderRadius: 4,
              }],
            }}
            options={CHART_OPTS}
          />
        </ChartCard>

        <ChartCard title="Order status breakdown" height={220}>
          <div style={{ display: "flex", gap: 24, height: "100%", alignItems: "center" }}>
            <div style={{ flex: "0 0 150px", height: 150 }}>
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
            <div style={{ flex: 1 }}>
              {[
                { label: "Delivered",        value: orders.delivered,      color: COLORS.green },
                { label: "Cancelled",        value: orders.cancelled,      color: COLORS.red },
                { label: "Placed",           value: orders.placed,         color: COLORS.blue },
                { label: "Preparing",        value: orders.preparing,      color: COLORS.amber },
                { label: "Out for Delivery", value: orders.outForDelivery, color: COLORS.purple },
              ].map((it) => (
                <StatusBar key={it.label} label={it.label} value={it.value} total={orders.total} color={it.color} />
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── REVENUE ── */}
      <SectionTitle>💰 Revenue</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard icon="💵" label="Total Revenue" value={fmt(revenue.totalRevenue)}              color={COLORS.green} sub="sum of all order amounts" />
        <StatCard icon="✅" label="Paid Orders"   value={payments.paidOrders.toLocaleString()}   color={COLORS.teal}  sub="paymentStatus: PAID" />
        <StatCard icon="🌐" label="Online Orders" value={payments.onlineOrders.toLocaleString()} color={COLORS.blue}  sub={`${onlinePct}% of total`} />
        <StatCard icon="💸" label="COD Orders"    value={payments.codOrders.toLocaleString()}    color={COLORS.amber} sub={`${100 - onlinePct}% of total`} />
      </div>

      {/* ── PAYMENTS ── */}
      <SectionTitle>💳 Payments</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Payment method split" height={200}>
          <div style={{ display: "flex", gap: 24, height: "100%", alignItems: "center" }}>
            <div style={{ flex: "0 0 150px", height: 150 }}>
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
                { label: `Online — ${payments.onlineOrders.toLocaleString()}`, color: COLORS.teal },
                { label: `COD — ${payments.codOrders.toLocaleString()}`,       color: COLORS.amber },
              ]} />
              <StatusBar label="Online" value={payments.onlineOrders} total={payments.onlineOrders + payments.codOrders} color={COLORS.teal} />
              <StatusBar label="COD"    value={payments.codOrders}    total={payments.onlineOrders + payments.codOrders} color={COLORS.amber} />
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Payment status" height={200}>
          <div style={{ paddingTop: 16 }}>
            <StatusBar label="Paid"   value={payments.paidOrders}                             total={orders.total} color={COLORS.green} />
            <StatusBar label="Unpaid" value={Math.max(0, orders.total - payments.paidOrders)} total={orders.total} color={COLORS.red} />
            <StatusBar label="Online" value={payments.onlineOrders}                           total={orders.total} color={COLORS.blue} />
            <StatusBar label="COD"    value={payments.codOrders}                              total={orders.total} color={COLORS.amber} />
          </div>
        </ChartCard>
      </div>

    </div>
  );
}