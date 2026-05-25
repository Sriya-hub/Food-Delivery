import "./RestaurantCard.css";
import { useNavigate } from "react-router-dom";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop";

function isOpen(opening, closing) {
  if (!opening || !closing) return null;
  const now = new Date();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

export default function RestaurantCard({ restaurant: r }) {
  const navigate = useNavigate();
  const open = isOpen(r.openingTime, r.closingTime);
  const cuisines = (r.cuisineType || r.restaurantType || "").toString();

  return (
    <div className="rc" onClick={() => navigate(`/restaurant/${r._id}`)}>

      {/* Image */}
      <div className="rc__img">
        <img
          src={r.restaurantImage || r.image || DEFAULT_IMG}
          alt={r.restaurantName}
          loading="lazy"
        />
        {open !== null && (
          <span className={`rc__badge ${open ? "rc__badge--open" : "rc__badge--closed"}`}>
            {open ? "Open" : "Closed"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="rc__body">
        <div className="rc__row">
          <h3 className="rc__name">{r.restaurantName}</h3>
          <span className="rc__rating">⭐ {r.rating || "4.5"}</span>
        </div>

        {cuisines && <p className="rc__cuisine">{cuisines}</p>}

        <p className="rc__address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          {r.restaurantAddress}
        </p>

        <div className="rc__footer">
          <span className="rc__time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
            {r.openingTime} – {r.closingTime}
          </span>
          <span className="rc__cta">View Menu →</span>
        </div>
      </div>

    </div>
  );
}