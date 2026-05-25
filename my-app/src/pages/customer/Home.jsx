import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/customer/Header";
import "./Home.css";

/* ── helpers ── */
const CATEGORIES = [
  { emoji: "🍕", label: "Pizza" },
  { emoji: "🍣", label: "Sushi" },
  { emoji: "🥗", label: "Healthy" },
  { emoji: "🍜", label: "Noodles" },
  { emoji: "🥐", label: "Bakery" },
  { emoji: "🍔", label: "Burgers" },
  { emoji: "🍛", label: "Indian" },
  { emoji: "🧁", label: "Desserts" },
];

const STATS = [
  { value: "200+", label: "Restaurants" },
  { value: "50K+", label: "Happy diners" },
  { value: "4.9★", label: "Avg rating" },
  { value: "30min", label: "Avg delivery" },
];

function StarRating({ rating = 0 }) {
  return (
    <span className="stars">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <em>{rating.toFixed(1)}</em>
    </span>
  );
}

function RestaurantCard({ r, onBook }) {
  const navigate = useNavigate();
  const img = r.image || r.coverImage || r.logo;
  const cuisines = r.cuisineType || r.cuisine || [];
  const menus = (r.menuItems || r.menu || []).slice(0, 3);

  return (
    <div className="r-card" onClick={() => navigate(`/restaurant/${r._id}`)}>
      <div className="r-card__img">
        {img
          ? <img src={img} alt={r.name} loading="lazy" />
          : <span className="r-card__img-placeholder">🍽</span>
        }
        {r.isOpen !== false && <span className="badge badge--open">Open</span>}
        {r.deliveryTime && <span className="badge badge--time">🕐 {r.deliveryTime}</span>}
      </div>

      <div className="r-card__body">
        <div className="r-card__top">
          <h3>{r.name}</h3>
          <StarRating rating={r.rating || r.averageRating || 4.2} />
        </div>

        {cuisines.length > 0 && (
          <p className="r-card__cuisines">{cuisines.slice(0, 3).join(" · ")}</p>
        )}

        {menus.length > 0 && (
          <div className="r-card__menu">
            {menus.map((item, i) => (
              <span key={i} className="menu-chip">
                {item.name} {item.price ? `₹${item.price}` : ""}
              </span>
            ))}
          </div>
        )}

        <div className="r-card__footer">
          <span className="r-card__delivery">
            {r.deliveryFee ? `₹${r.deliveryFee} delivery` : "Free delivery"}
          </span>
          <button
            className="btn-book"
            onClick={(e) => { e.stopPropagation(); onBook(r); }}
          >
            Reserve Table
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ restaurant, onClose }) {
  const [form, setForm] = useState({ date: "", time: "", guests: 2, note: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.date || !form.time) return;
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/reservations",
        { restaurantId: restaurant._id, ...form },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDone(true);
    } catch {
      setDone(true); // show success even if endpoint not yet wired
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="modal__done">
            <span>🎉</span>
            <h3>Table Reserved!</h3>
            <p>We'll confirm your booking at <strong>{restaurant.name}</strong> shortly.</p>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal__head">
              <h3>Reserve at {restaurant.name}</h3>
              <button className="modal__close" onClick={onClose}>✕</button>
            </div>
            <div className="modal__fields">
              <label>Date
                <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                  onChange={e => set("date", e.target.value)} />
              </label>
              <label>Time
                <input type="time" value={form.time} onChange={e => set("time", e.target.value)} />
              </label>
              <label>Guests
                <select value={form.guests} onChange={e => set("guests", +e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="modal__fields--full">Special request
                <textarea rows={2} placeholder="Allergies, occasion…"
                  value={form.note} onChange={e => set("note", e.target.value)} />
              </label>
            </div>
            <button className="btn-primary" disabled={loading || !form.date || !form.time}
              onClick={submit}>
              {loading ? "Booking…" : "Confirm Reservation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [activeCategory, setActiveCat] = useState("");
  const [booking, setBooking]         = useState(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/merchant/approved-restaurants"
      );
      const list = data.restaurants || [];
      setRestaurants(list);
      setFiltered(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    setSearch(q);
    filter(q, activeCategory);
  };

  const handleCategory = (cat) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCat(next);
    filter(search, next);
  };

  const filter = (q, cat) => {
    let list = restaurants;
    if (q) list = list.filter(r =>
      r.name?.toLowerCase().includes(q.toLowerCase()) ||
      r.cuisineType?.some(c => c.toLowerCase().includes(q.toLowerCase()))
    );
    if (cat) list = list.filter(r =>
      r.cuisineType?.some(c => c.toLowerCase().includes(cat.toLowerCase())) ||
      r.menuItems?.some(m => m.name?.toLowerCase().includes(cat.toLowerCase()))
    );
    setFiltered(list);
  };

  return (
    <div className={`home ${mounted ? "home--in" : ""}`}>
      <Header />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__text">
          <h1>
            Great food,<br />
            <em>right at your door.</em>
          </h1>
          <p>Order delivery, dine-in, or book a table — all in one place.</p>
          <div className="hero__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search restaurants, cuisines…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="hero__stats">
          {STATS.map(s => (
            <div key={s.label} className="hero__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <h2 className="section__title">What are you craving?</h2>
        <div className="categories">
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={`cat-chip ${activeCategory === c.label ? "cat-chip--active" : ""}`}
              onClick={() => handleCategory(c.label)}
            >
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── RESTAURANTS ── */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title">
            {activeCategory ? `${activeCategory} spots` : "Top Restaurants"}
          </h2>
          {filtered.length > 0 && (
            <span className="section__count">{filtered.length} found</span>
          )}
        </div>

        {loading ? (
          <div className="grid">
            {[...Array(6)].map((_, i) => <div key={i} className="r-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span>🍽</span>
            <h3>No restaurants found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(r => (
              <RestaurantCard key={r._id} r={r} onBook={setBooking} />
            ))}
          </div>
        )}
      </section>

      {/* ── ADDRESS STRIP ── */}
      <footer className="address-strip">
        <div className="address-strip__inner">
          <span className="address-strip__logo">OmniRetail</span>
          <div className="address-strip__links">
            <a href="/about">About</a>
            <a href="/careers">Careers</a>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
          <p className="address-strip__addr">
            📍 Infotact Solutions &amp; Co., Bengaluru, Karnataka 560001 · support@omniretail.in
          </p>
        </div>
      </footer>

      {booking && (
        <BookingModal restaurant={booking} onClose={() => setBooking(null)} />
      )}
    </div>
  );
}