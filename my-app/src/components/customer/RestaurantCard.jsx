import "./RestaurantCard.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop";

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ✅ isOnline=false means merchant manually went offline → always Closed
function isOpen(opening, closing, isOnline) {
  if (isOnline === false) return false;        // manually offline
  if (!opening || !closing) return null;
  const now = new Date();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

export default function RestaurantCard({ restaurant: r }) {
  const navigate = useNavigate();

  // ✅ Pass r.isOnline as third argument
  const open = isOpen(r.openingTime, r.closingTime, r.isOnline);
  const cuisines = (r.cuisineType || r.restaurantType || "").toString();

  const imgSrc = r.restaurantImage
    ? r.restaurantImage.startsWith("http")
      ? r.restaurantImage
      : `${API_URL}/${r.restaurantImage.replace(/^\//, "")}`
    : DEFAULT_IMG;

  return (
    <div className="rc" onClick={() => navigate(`/restaurant/${r._id}`)}>

      {/* Image */}
      <div className="rc__img">
        <img
          src={imgSrc}
          alt={r.restaurantName}
          loading="lazy"
        />
        {open !== null && (
          <span className={`rc__status ${open ? "rc__status--open" : "rc__status--closed"}`}>
            <span className="rc__status-dot" />
            {open ? "Open Now" : "Closed"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="rc__body">

        <h3 className="rc__name">{r.restaurantName}</h3>

        {cuisines && (
          <p className="rc__cuisine">
            <span className="rc__cuisine-icon">🍽</span>
            {cuisines}
          </p>
        )}

        <div className="rc__timing">
          <div className="rc__timing-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="rc__timing-text">
            <span className="rc__timing-label">Hours</span>
            <span className="rc__timing-value">
              {formatTime(r.openingTime)} &mdash; {formatTime(r.closingTime)}
            </span>
          </div>
        </div>

        <p className="rc__address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {r.restaurantAddress}
        </p>

        <div className="rc__footer">
          <span className="rc__rating">⭐ {r.rating || "4.5"}</span>
          <span className="rc__cta">View Menu →</span>
        </div>

      </div>
    </div>
  );
}