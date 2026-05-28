import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./RestaurantDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

const DELIVERY_TIMES = {
  Starter: 15, Main: 30, Dessert: 20,
  Beverage: 10, Snack: 12, default: 25,
};
const getDelivery = (cat) => DELIVERY_TIMES[cat] || DELIVERY_TIMES.default;
const IMG_FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";
const imgSrc = (p) =>
  p ? (p.startsWith("http") ? p : `${API_URL}${p}`) : IMG_FALLBACK;

function isOpen(opening, closing) {
  if (!opening || !closing) return null;
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ══════════════════════════════════════
   BOOKING MODAL
   - Real API call to POST /api/reservations
   - Checks availability before confirming
   - Shows total tables & max guests info
══════════════════════════════════════ */
function BookingModal({ restaurant, onClose }) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    guests: "2",
    note: "",
  });
  const [step, setStep]               = useState("form"); // "form" | "checking" | "full" | "done" | "error"
  const [availableTables, setAvail]   = useState(null);   // number | null
  const [checkedSlot, setCheckedSlot] = useState(null);   // "date|time" last checked
  const [loading, setLoading]         = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    // Reset availability when date/time changes
    if (k === "date" || k === "time") {
      setAvail(null);
      setCheckedSlot(null);
    }
  };

  /* Check availability whenever date + time are both filled */
  useEffect(() => {
    if (!form.date || !form.time) return;
    const slot = `${form.date}|${form.time}`;
    if (slot === checkedSlot) return;

    const check = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reservations/availability`, {
          params: {
            restaurantId: restaurant._id,
            date: form.date,
            time: form.time,
          },
        });
        setAvail(res.data.availableTables ?? null);
        setCheckedSlot(slot);
      } catch {
        // If endpoint doesn't exist yet, silently skip — don't block booking
        setAvail(null);
        setCheckedSlot(slot);
      }
    };
    check();
  }, [form.date, form.time, checkedSlot, restaurant._id]);

  const submit = async () => {
    if (!form.date || !form.time) return;

    // If we know there are 0 tables available, block submission
    if (availableTables === 0) {
      setStep("full");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/reservations`,
        {
          restaurantId: restaurant._id,
          date:         form.date,
          time:         form.time,
          guests:       Number(form.guests),
          note:         form.note,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStep("done");
    } catch (err) {
      // Handle "no tables available" from server
      const msg = err?.response?.data?.message || "";
      if (
        err?.response?.status === 409 ||
        msg.toLowerCase().includes("no tables") ||
        msg.toLowerCase().includes("fully booked") ||
        msg.toLowerCase().includes("not available")
      ) {
        setStep("full");
      } else {
        setStep("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const isReady = form.date && form.time;

  /* Availability pill */
  const AvailBadge = () => {
    if (!form.date || !form.time || availableTables === null) return null;
    if (availableTables === 0)
      return (
        <div className="rd-avail rd-avail--full">
          <span>🚫</span> No tables available for this slot
        </div>
      );
    return (
      <div className="rd-avail rd-avail--ok">
        <span>✅</span> {availableTables} table{availableTables !== 1 ? "s" : ""} available
      </div>
    );
  };

  return (
    <div
      className="rd-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rd-modal">

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="rd-modal__done">
            <div className="rd-done-icon">🎉</div>
            <h3>Table Booked!</h3>
            <p>
              Your table for <strong>{form.guests} guest{form.guests > 1 ? "s" : ""}</strong> on{" "}
              <strong>{form.date}</strong> at <strong>{form.time}</strong> has been confirmed.
            </p>
            <p className="rd-modal__sub">
              You can view or manage this booking under <strong>My Bookings</strong>.
            </p>
            <button className="rd-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {/* ── FULLY BOOKED ── */}
        {step === "full" && (
          <div className="rd-modal__done rd-modal__done--full">
            <div className="rd-done-icon">😔</div>
            <h3>No Tables Available</h3>
            <p>
              All tables at <strong>{restaurant.restaurantName}</strong> are fully booked
              for <strong>{form.date}</strong> at <strong>{form.time}</strong>.
            </p>
            <p className="rd-modal__sub">Please try a different date or time slot.</p>
            <div className="rd-modal__done-actions">
              <button
                className="rd-btn-ghost"
                onClick={() => {
                  setStep("form");
                  setForm((p) => ({ ...p, date: "", time: "" }));
                  setAvail(null);
                  setCheckedSlot(null);
                }}
              >
                Try Another Slot
              </button>
              <button className="rd-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="rd-modal__done rd-modal__done--error">
            <div className="rd-done-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>We couldn't complete your reservation. Please try again in a moment.</p>
            <div className="rd-modal__done-actions">
              <button className="rd-btn-ghost" onClick={() => setStep("form")}>
                Try Again
              </button>
              <button className="rd-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── FORM ── */}
        {step === "form" && (
          <>
            <div className="rd-modal__head">
              <div>
                <span className="rd-modal__tag">Reserve a Table</span>
                <h3>{restaurant.restaurantName}</h3>
              </div>
              <button className="rd-modal__close" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Restaurant reservation info bar */}
            <div className="rd-modal__info-bar">
              {restaurant.totalTables && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  {restaurant.totalTables} tables total
                </span>
              )}
              {restaurant.maxGuestsPerTable && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Up to {restaurant.maxGuestsPerTable} guests / table
                </span>
              )}
              {restaurant.reservationSlotDuration && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {restaurant.reservationSlotDuration} min slots
                </span>
              )}
              {restaurant.advanceBookingDays && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Book up to {restaurant.advanceBookingDays} days ahead
                </span>
              )}
            </div>

            <div className="rd-modal__grid">
              <label>
                Date *
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    restaurant.advanceBookingDays
                      ? new Date(
                          Date.now() +
                            restaurant.advanceBookingDays * 86400000
                        )
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  onChange={(e) => set("date", e.target.value)}
                />
              </label>

              <label>
                Time *
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                />
              </label>

              <label>
                Guests *
                <select
                  value={form.guests}
                  onChange={(e) => set("guests", e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option
                      key={n}
                      disabled={
                        restaurant.maxGuestsPerTable
                          ? n > restaurant.maxGuestsPerTable
                          : false
                      }
                    >
                      {n}
                      {restaurant.maxGuestsPerTable && n > restaurant.maxGuestsPerTable
                        ? " (exceeds limit)"
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rd-modal__full">
                Special Requests
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Allergies, occasion, seating preference…"
                />
              </label>
            </div>

            {/* Availability badge */}
            <AvailBadge />

            <button
              className="rd-btn-primary"
              onClick={submit}
              disabled={loading || !isReady || availableTables === 0}
            >
              {loading ? <span className="rd-spinner" /> : "Confirm Reservation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FOOD CARD
══════════════════════════════════════ */
function FoodCard({ food, onAdd, isClosed, badge }) {
  const [adding, setAdding] = useState(false);

  const handle = () => {
    if (isClosed) return;
    setAdding(true);
    onAdd(food);
    setTimeout(() => setAdding(false), 700);
  };

  return (
    <div
      className={`rd-card ${badge ? "rd-card--featured" : ""} ${
        isClosed ? "rd-card--closed" : ""
      }`}
    >
      {badge && <div className="rd-card__badge">{badge}</div>}
      {isClosed && <div className="rd-card__closed-tag">Closed</div>}

      <div className="rd-card__img">
        <img src={imgSrc(food.image)} alt={food.name} loading="lazy" />
        {!isClosed && (
          <div className="rd-card__overlay">
            <button className="rd-card__quick" onClick={handle}>
              + Quick Add
            </button>
          </div>
        )}
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
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {getDelivery(food.category)}–{getDelivery(food.category) + 5} min
          </span>
          <button
            className={`rd-card__btn ${adding ? "rd-card__btn--added" : ""}`}
            onClick={handle}
            disabled={isClosed}
          >
            {isClosed ? "Unavailable" : adding ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN — RESTAURANT DETAILS
══════════════════════════════════════ */
export default function RestaurantDetails() {
  const navigate     = useNavigate();
  const { merchantId } = useParams();

  const [restaurant, setRestaurant]   = useState(null);
  const [foods, setFoods]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("All");
  const [search, setSearch]           = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [toast, setToast]             = useState(null);
  const [cart, setCart]               = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchAll();
  }, [merchantId]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cart]);

  const fetchAll = async () => {
    try {
      const [restRes, foodRes] = await Promise.all([
        // Use merchant-settings endpoint to get ALL reservation fields
        axios.get(`${API_URL}/api/merchant-settings/settings/${merchantId}`),
        axios.get(`${API_URL}/api/merchant-food/foods/${merchantId}`),
      ]);

      // merchant-settings returns { merchant: {...} }
      setRestaurant(restRes.data.merchant || null);
      setFoods(foodRes.data.foods || []);
    } catch (e) {
      console.error(e);
      // Fallback: try approved-restaurants list if settings endpoint fails
      try {
        const listRes = await axios.get(
          `${API_URL}/api/merchant/approved-restaurants`
        );
        const found = (listRes.data.restaurants || []).find(
          (r) => r._id === merchantId
        );
        setRestaurant(found || null);
      } catch {
        setRestaurant(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (food) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === food._id);
      if (ex)
        return prev.map((i) =>
          i._id === food._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...food, quantity: 1 }];
    });
    showToastMsg(`"${food.name}" added!`);
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const open       = restaurant ? isOpen(restaurant.openingTime, restaurant.closingTime) : null;
  const cartCount  = cart.reduce((s, c) => s + c.quantity, 0);
  const cats       = ["All", ...new Set(foods.map((f) => f.category).filter(Boolean))];
  const filtered   = foods.filter(
    (f) =>
      (activeTab === "All" || f.category === activeTab) &&
      (f.name?.toLowerCase().includes(search.toLowerCase()) ||
        (f.description || "").toLowerCase().includes(search.toLowerCase()))
  );
  const recommended = [...foods].sort(() => 0.5 - Math.random()).slice(0, 3);

  /* ── SKELETON ── */
  if (loading)
    return (
      <div className="rd-page">
        <div className="rd-skeleton-hero" />
        <div className="rd-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rd-skeleton-card" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="rd-page">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <div className="rd-hero">
        <div className="rd-hero__bg" />
        {restaurant?.restaurantImage && (
          <div className="rd-hero__cover">
            <img
              src={imgSrc(restaurant.restaurantImage)}
              alt={restaurant.restaurantName}
            />
          </div>
        )}

        <div className="rd-hero__content">
          <div className="rd-hero__left">
            <div
              className={`rd-hero__status ${
                open === false ? "rd-hero__status--closed" : ""
              }`}
            >
              <span className="rd-dot" />
              {open === null ? "Hours unknown" : open ? "Open Now" : "Closed"}
            </div>

            <h1>{restaurant?.restaurantName || "Restaurant"}</h1>
            <p className="rd-hero__cuisine">
              {restaurant?.restaurantType || "Multi-Cuisine"}
            </p>

            <div className="rd-hero__meta">
              <span>⭐ {restaurant?.rating || "4.5"}</span>
              <span className="rd-sep">·</span>
              <span>
                🕐 {formatTime(restaurant?.openingTime)} –{" "}
                {formatTime(restaurant?.closingTime)}
              </span>
              <span className="rd-sep">·</span>
              <span>📍 {restaurant?.restaurantAddress}</span>
            </div>
          </div>

          <div className="rd-hero__actions">
            {/* Cart button */}
            <button className="rd-btn-cart" onClick={() => navigate("/cart")}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="rd-cart-count">{cartCount}</span>
              )}
              Cart
            </button>

            {/* ✅ Reserve Table — only when tableReservationEnabled is true */}
            {restaurant?.tableReservationEnabled && (
              <button
                className="rd-btn-book"
                onClick={() => setShowBooking(true)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Reserve Table
              </button>
            )}

            <button className="rd-btn-ghost" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="rd-main">

        {/* ══════════════════════════════════
            CHEF'S PICKS
        ══════════════════════════════════ */}
        {recommended.length > 0 && (
          <section className="rd-section">
            <div className="rd-section__head">
              <h2>⚡ Chef's Picks</h2>
              <span>{recommended.length} items</span>
            </div>
            <div className="rd-picks">
              {recommended.map((f) => (
                <div className="rd-pick" key={f._id + "_rec"}>
                  <div className="rd-pick__img">
                    <img src={imgSrc(f.image)} alt={f.name} loading="lazy" />
                    <div className="rd-pick__overlay">
                      {!open ? (
                        <span className="rd-pick__closed">Closed</span>
                      ) : (
                        <button onClick={() => addToCart(f)}>
                          + Add to Cart
                        </button>
                      )}
                    </div>
                    <div className="rd-pick__info">
                      <span className="rd-pick__name">{f.name}</span>
                      <span className="rd-pick__price">₹{f.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════
            FULL MENU
        ══════════════════════════════════ */}
        <section className="rd-section">
          <div className="rd-section__head">
            <h2>🍽 Full Menu</h2>
            <span>{filtered.length} items</span>
          </div>

          <div className="rd-controls">
            <div className="rd-search">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
              />
              {search && (
                <button onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            <div className="rd-tabs">
              {cats.map((c) => (
                <button
                  key={c}
                  className={`rd-tab ${activeTab === c ? "rd-tab--active" : ""}`}
                  onClick={() => setActiveTab(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rd-empty">
              <span>🍽</span>
              <h3>No dishes found</h3>
              <p>Try a different filter.</p>
            </div>
          ) : (
            <div className="rd-grid">
              {filtered.map((f, i) => (
                <FoodCard
                  key={f._id}
                  food={f}
                  onAdd={addToCart}
                  isClosed={open === false}
                  badge={
                    i === 0 && activeTab === "All" ? "🔥 Bestseller" : null
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── BOOKING MODAL ── */}
      {showBooking && restaurant && (
        <BookingModal
          restaurant={restaurant}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && <div className="rd-toast">{toast}</div>}
    </div>
  );
}