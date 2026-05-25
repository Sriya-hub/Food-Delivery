import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./RestaurantDetails.css";

/* ── mock recommended tags per category ── */
const DELIVERY_TIMES = { Starter: 15, Main: 30, Dessert: 20, Beverage: 10, Snack: 12, default: 25 };
const getDelivery = (cat) => DELIVERY_TIMES[cat] || DELIVERY_TIMES.default;

/* ── BOOKING MODAL ── */
function BookingModal({ restaurant, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "", guests: "2", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleBook = () => {
    if (!form.name || !form.date || !form.time || !form.guests) return alert("Please fill required fields.");
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1400);
  };

  return (
    <div className="rd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rd-modal">
        {!submitted ? (
          <>
            <div className="rd-modal__head">
              <div>
                <span className="rd-modal__tag">Reserve a Table</span>
                <h3>{restaurant || "Restaurant"}</h3>
              </div>
              <button className="rd-modal__close" onClick={onClose}>✕</button>
            </div>
            <div className="rd-modal__grid">
              <label>Full Name *<input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" /></label>
              <label>Email<input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@mail.com" /></label>
              <label>Phone<input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" /></label>
              <label>Guests *
                <select value={form.guests} onChange={e => set("guests", e.target.value)}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label>Date *<input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></label>
              <label>Time *
                <select value={form.time} onChange={e => set("time", e.target.value)}>
                  <option value="">Select time</option>
                  {["12:00","12:30","13:00","13:30","19:00","19:30","20:00","20:30","21:00"].map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="rd-modal__full">Special Requests<textarea rows={2} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Allergies, occasion, seating preference…" /></label>
            </div>
            <button className="rd-btn-primary" onClick={handleBook} disabled={loading}>
              {loading ? <span className="rd-spinner" /> : "Confirm Reservation"}
            </button>
          </>
        ) : (
          <div className="rd-modal__done">
            <div className="rd-done-icon">🎉</div>
            <h3>Table Booked!</h3>
            <p>Your table for <strong>{form.guests} guest{form.guests > 1 ? "s" : ""}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong> is confirmed.</p>
            <p className="rd-done-sub">A confirmation will be sent to {form.email || "your email"}.</p>
            <button className="rd-btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── FOOD CARD ── */
function FoodCard({ food, onAdd, badge }) {
  return (
    <div className={`rd-card ${badge ? "rd-card--featured" : ""}`}>
      {badge && <div className="rd-card__badge">{badge}</div>}
      <div className="rd-card__img">
        <img
          src={food.image ? `http://localhost:5000${food.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"}
          alt={food.name}
        />
        <div className="rd-card__overlay">
          <button className="rd-card__quick" onClick={() => onAdd(food)}>+ Add</button>
        </div>
      </div>
      <div className="rd-card__body">
        <div className="rd-card__top">
          <h3>{food.name}</h3>
          <span className="rd-card__price">₹{food.price}</span>
        </div>
        <span className="rd-card__cat">{food.category}</span>
        <p className="rd-card__desc">{food.description}</p>
        <div className="rd-card__footer">
          <span className="rd-card__time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {getDelivery(food.category)}–{getDelivery(food.category) + 5} min
          </span>
          <button className="rd-card__btn" onClick={() => onAdd(food)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function RestaurantDetails() {
  const navigate = useNavigate();
  const { merchantId } = useParams();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  /* mock restaurant meta */
  const meta = { name: "The Grand Table", rating: 4.7, reviews: 318, cuisine: "Multi-Cuisine", avgTime: "25–35 min" };

  useEffect(() => { if (merchantId) fetchFoods(); }, [merchantId]);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/merchant-food/foods/${merchantId}`);
      setFoods(res.data.foods || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const addToCart = (food) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const ex = cart.find(i => i._id === food._id);
    ex ? ex.quantity++ : cart.push({ ...food, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`"${food.name}" added to cart!`);
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  /* categories */
  const cats = ["All", ...new Set(foods.map(f => f.category))];

  /* filter */
  const filtered = foods.filter(f =>
    (activeTab === "All" || f.category === activeTab) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) || (f.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  /* recommended = top 3 non-active-tab or highest price mock */
  const recommended = [...foods].sort(() => 0.5 - Math.random()).slice(0, 3);

  /* ── SKELETON ── */
  if (loading) return (
    <div className="rd-page">
      <div className="rd-skeleton-hero" />
      <div className="rd-skeleton-grid">
        {[1,2,3,4,5,6].map(i => <div key={i} className="rd-skeleton-card" />)}
      </div>
    </div>
  );

  return (
    <div className="rd-page">
      {/* HERO BANNER */}
      <div className="rd-hero">
        <div className="rd-hero__bg" />
        <div className="rd-hero__content">
          <div className="rd-hero__left">
            <div className="rd-hero__status">
              <span className="rd-dot" />Open Now
            </div>
            <h1>{meta.name}</h1>
            <p className="rd-hero__cuisine">{meta.cuisine}</p>
            <div className="rd-hero__meta">
              <span>⭐ {meta.rating} <em>({meta.reviews} reviews)</em></span>
              <span className="rd-sep">·</span>
              <span>🕐 {meta.avgTime}</span>
              <span className="rd-sep">·</span>
              <span>🛵 Free Delivery</span>
            </div>
          </div>
          <div className="rd-hero__actions">
            <button className="rd-btn-book" onClick={() => setShowBooking(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Reserve Table
            </button>
            <button className="rd-btn-ghost" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </div>
      </div>

      <div className="rd-main">
        {/* RECOMMENDED STRIP */}
        {recommended.length > 0 && (
          <section className="rd-section">
            <div className="rd-section__head">
              <h2>⚡ Chef's Picks</h2>
              <span>{recommended.length} items</span>
            </div>
            <div className="rd-recommended">
              {recommended.map(f => (
                <div className="rd-rec-card" key={f._id + "_rec"}>
                  <img
                    src={f.image ? `http://localhost:5000${f.image}` : "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop"}
                    alt={f.name}
                  />
                  <div className="rd-rec-card__body">
                    <h4>{f.name}</h4>
                    <div className="rd-rec-card__row">
                      <span className="rd-rec-card__time">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {getDelivery(f.category)} min
                      </span>
                      <span className="rd-rec-card__price">₹{f.price}</span>
                    </div>
                    <button onClick={() => addToCart(f)}>Add +</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MENU SECTION */}
        <section className="rd-section">
          <div className="rd-section__head">
            <h2>🍽 Full Menu</h2>
            <span>{filtered.length} items</span>
          </div>

          {/* SEARCH + TABS */}
          <div className="rd-controls">
            <div className="rd-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…" />
              {search && <button onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="rd-tabs">
              {cats.map(c => (
                <button key={c} className={`rd-tab ${activeTab === c ? "rd-tab--active" : ""}`} onClick={() => setActiveTab(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* FOOD GRID */}
          {filtered.length === 0 ? (
            <div className="rd-empty">
              <span>🍽</span>
              <h3>No dishes found</h3>
              <p>Try a different category or search term.</p>
            </div>
          ) : (
            <div className="rd-grid">
              {filtered.map((f, i) => (
                <FoodCard key={f._id} food={f} onAdd={addToCart} badge={i === 0 && activeTab === "All" ? "🔥 Bestseller" : null} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* BOOKING MODAL */}
      {showBooking && <BookingModal restaurant={meta.name} onClose={() => setShowBooking(false)} />}

      {/* TOAST */}
      {toast && <div className="rd-toast">{toast}</div>}
    </div>
  );
}