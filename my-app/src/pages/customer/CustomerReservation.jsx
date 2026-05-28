import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import axios                   from "axios";
import Header from "../../components/customer/Header";
import "./CustomerReservation.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_TABS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const STATUS_META = {
  pending:   { label: "Pending",   color: "#b45309", bg: "#fef3c7" },
  confirmed: { label: "Confirmed", color: "#047857", bg: "#d1fae5" },
  cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },
  completed: { label: "Completed", color: "#4338ca", bg: "#e0e7ff" },
};

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(day)} ${months[Number(m) - 1]} ${y}`;
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ══════════════════════════════
   RESERVATION CARD
══════════════════════════════ */
function ReservationCard({ reservation }) {
  const meta = STATUS_META[reservation.status] || STATUS_META.pending;
  const restaurant = reservation.merchantId;

  return (
    <div className={`cr-card cr-card--${reservation.status}`}>

      {/* ── TOP ROW: restaurant + status ── */}
      <div className="cr-card__top">
        <div className="cr-card__restaurant">
          <div className="cr-card__icon">🍽</div>
          <div style={{ minWidth: 0 }}>
            <p className="cr-card__name">
              {restaurant?.restaurantName || restaurant?.name || "Restaurant"}
            </p>
            <p className="cr-card__booked">
              Booked {timeAgo(reservation.createdAt)}
            </p>
          </div>
        </div>

        <div className="cr-card__status-wrap">
          <span
            className="cr-card__status"
            style={{ color: meta.color, background: meta.bg }}
          >
            {meta.label}
          </span>
          <span className="cr-card__ref">
            #{reservation._id?.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── DETAIL GRID: date / time / guests ── */}
      <div className="cr-card__details">
        <div className="cr-card__detail">
          <span className="cr-card__detail-icon">📅</span>
          <span className="cr-card__detail-val">{formatDate(reservation.date)}</span>
          <span className="cr-card__detail-key">Date</span>
        </div>
        <div className="cr-card__detail">
          <span className="cr-card__detail-icon">🕐</span>
          <span className="cr-card__detail-val">{formatTime(reservation.time)}</span>
          <span className="cr-card__detail-key">Time</span>
        </div>
        <div className="cr-card__detail">
          <span className="cr-card__detail-icon">👥</span>
          <span className="cr-card__detail-val">
            {reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}
          </span>
          <span className="cr-card__detail-key">Party size</span>
        </div>
      </div>

      {/* ── BOTTOM ROW: note / cancel reason / completed badge ── */}
      <div className="cr-card__bottom">
        {reservation.cancelReason ? (
          <p className="cr-card__cancel-reason">
            <span>⚠️</span>
            <span>Cancelled: {reservation.cancelReason}</span>
          </p>
        ) : reservation.note ? (
          <p className="cr-card__note">
            <span>📝</span>
            <span>{reservation.note}</span>
          </p>
        ) : (
          <p className="cr-card__no-note">No special requests</p>
        )}

        {reservation.status === "completed" && (
          <div className="cr-card__timeline">
            ✓ Visit completed
          </div>
        )}

        {reservation.status === "confirmed" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: "0.75rem", color: "#047857", fontWeight: 600,
            background: "#d1fae5", padding: "4px 12px", borderRadius: 50,
            flexShrink: 0,
          }}>
            🎉 Your table is confirmed!
          </div>
        )}

        {reservation.status === "pending" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: "0.75rem", color: "#b45309", fontWeight: 600,
            background: "#fef3c7", padding: "4px 12px", borderRadius: 50,
            flexShrink: 0,
          }}>
            ⏳ Awaiting confirmation
          </div>
        )}
      </div>

    </div>
  );
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
export default function CustomerReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setFilter]       = useState("All");
  const [error, setError]               = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { navigate("/login"); return; }
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_URL}/api/reservations/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(data.reservations || data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load your reservations.");
    } finally {
      setLoading(false);
    }
  };

  /* Stats */
  const stats = {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
    completed: reservations.filter(r => r.status === "completed").length,
  };

  /* Filtered list — newest first */
  const filtered = (
    activeFilter === "All"
      ? reservations
      : reservations.filter(r => r.status === activeFilter.toLowerCase())
  ).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="cr-page">
      <Header />

      {/* ── HERO ── */}
      <section className="cr-hero">
        <div className="cr-hero__inner">
          <button className="cr-hero__back" onClick={() => navigate(-1)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <h1 className="cr-hero__title">My Table Bookings</h1>
          <p className="cr-hero__sub">Track all your restaurant reservations in one place</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="cr-stats">
        <div className="cr-stat">
          <span className="cr-stat__num">{stats.total}</span>
          <span className="cr-stat__label">Total</span>
        </div>
        <div className="cr-stat cr-stat--pending">
          <span className="cr-stat__num">{stats.pending}</span>
          <span className="cr-stat__label">Pending</span>
        </div>
        <div className="cr-stat cr-stat--confirmed">
          <span className="cr-stat__num">{stats.confirmed}</span>
          <span className="cr-stat__label">Confirmed</span>
        </div>
        <div className="cr-stat cr-stat--cancelled">
          <span className="cr-stat__num">{stats.cancelled}</span>
          <span className="cr-stat__label">Cancelled</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cr-body">

        {/* Filter tabs */}
        <div className="cr-filters">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              className={`cr-filter ${activeFilter === tab ? "cr-filter--active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
              <span className="cr-filter__count">
                {tab === "All"
                  ? stats.total
                  : reservations.filter(r => r.status === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="cr-skeletons">
            {[1,2,3].map(i => <div key={i} className="cr-skeleton" />)}
          </div>
        ) : error ? (
          <div className="cr-empty">
            <span className="cr-empty__icon">⚠️</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="cr-empty__cta" onClick={fetchReservations}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cr-empty">
            <span className="cr-empty__icon">📅</span>
            <h3>
              {activeFilter === "All"
                ? "No reservations yet"
                : `No ${activeFilter.toLowerCase()} reservations`}
            </h3>
            <p>
              {activeFilter === "All"
                ? "Book a table at your favourite restaurant and it'll show up here."
                : `You don't have any ${activeFilter.toLowerCase()} bookings.`}
            </p>
            {activeFilter === "All" && (
              <button className="cr-empty__cta" onClick={() => navigate("/")}>
                Explore restaurants
              </button>
            )}
          </div>
        ) : (
          <div className="cr-list">
            {filtered.map(r => (
              <ReservationCard key={r._id} reservation={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}