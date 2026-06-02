import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ══════════════════════════════════════
   MAINTENANCE TICKER
══════════════════════════════════════ */
const MAINTENANCE_MESSAGES = [
  "🔧  Scheduled maintenance in progress — some features may be temporarily unavailable",
  "⚙️  Our engineering team is upgrading infrastructure to serve you better",
  "🛡️  Your data is fully safe and secure during this maintenance window",
  "🕐  Services will be fully restored shortly — thank you for your patience",
  "📧  For urgent assistance contact support@foodie.in",
  "🚀  We're working hard to bring you an even faster Foodie experience",
];

function MaintenanceTicker({ settings }) {
  const text = MAINTENANCE_MESSAGES.join("     ·     ");

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date)) return null;
    return date.toLocaleString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const end = formatDate(settings?.maintenanceEndDate);

  return (
    <div className="maint-ticker" role="alert" aria-live="polite">
      <div className="maint-ticker__badge">
        <span className="maint-ticker__dot" aria-hidden="true" />
        <span>Maintenance</span>
      </div>
      <div className="maint-ticker__scroll" aria-label="Maintenance notice">
        <div className="maint-ticker__track">
          <span aria-hidden="true">{text}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
          <span aria-hidden="true">{text}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>
      {end && (
        <div className="maint-ticker__eta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span>Back by {end}</span>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════
   MAP LOCATION MODAL  (Leaflet — mock)
══════════════════════════════════════ */
let leafletLoaded = false;

function MapLocationModal({ onClose, onSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);

  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [detecting, setDetect]  = useState(false);
  const [tab, setTab]           = useState("search"); // "search" | "map"
  const [pinLabel, setPinLabel] = useState("Drag the pin to your location");
  const [confirming, setConfirm]= useState(false);
  const [pinLatLon, setPinLatLon] = useState(null);

  const RECENT = JSON.parse(localStorage.getItem("foodie_recent") || "[]");

  /* ── Load Leaflet CSS + JS once ── */
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!leafletLoaded) {
      const script = document.createElement("script");
      script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js";
      script.onload = () => { leafletLoaded = true; if (tab === "map") initMap(); };
      document.head.appendChild(script);
    }
  }, []);

  /* ── Init map when tab switches to "map" ── */
  useEffect(() => {
    if (tab === "map" && leafletLoaded) {
      setTimeout(initMap, 80); // let DOM paint
    }
  }, [tab]);

  const initMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;
    const L   = window.L;
    const lat  = 19.076, lon = 72.877; // Mumbai default

    mapRef.current = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapRef.current);

    /* Custom orange pin icon */
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:36px;height:44px;
        background:linear-gradient(135deg,#ff6b35,#f7931e);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 4px 16px rgba(0,0,0,0.28);
        display:flex;align-items:center;justify-content:center;
      "><div style="
        width:12px;height:12px;
        background:#fff;border-radius:50%;
        transform:rotate(45deg);
      "></div></div>`,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
    });

    markerRef.current = L.marker([lat, lon], { icon, draggable: true })
      .addTo(mapRef.current);

    setPinLatLon({ lat, lon });
    reverseGeocode(lat, lon);

    markerRef.current.on("dragend", (e) => {
      const { lat: la, lng: lo } = e.target.getLatLng();
      setPinLatLon({ lat: la, lon: lo });
      reverseGeocode(la, lo);
    });

    mapRef.current.on("click", (e) => {
      const { lat: la, lng: lo } = e.latlng;
      markerRef.current.setLatLng([la, lo]);
      setPinLatLon({ lat: la, lon: lo });
      reverseGeocode(la, lo);
    });
  };

  const reverseGeocode = async (lat, lon) => {
    setPinLabel("Locating…");
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const label = data.display_name?.split(",").slice(0, 3).join(", ") || "Selected location";
      setPinLabel(label);
      setPinLatLon({ lat, lon, label });
    } catch {
      setPinLabel("Selected location");
      setPinLatLon({ lat, lon, label: "Selected location" });
    }
  };

  /* ── Confirm map pin ── */
  const confirmPin = () => {
    if (!pinLatLon?.label) return;
    onSelect({ label: pinLatLon.label, lat: pinLatLon.lat, lon: pinLatLon.lon });
  };

  /* ── Search ── */
  const search = async (q) => {
    setQuery(q);
    if (!q) return setResults([]);
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
      );
      setResults(data);
    } catch { setResults([]); }
  };

  /* ── GPS detect ── */
  const detectLocation = () => {
    setDetect(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        onSelect({ label: data.display_name?.split(",").slice(0, 3).join(", "), lat, lon });
      } catch { onSelect({ label: "Current Location", lat, lon }); }
      setDetect(false);
    }, () => setDetect(false));
  };

  const pick = (r) =>
    onSelect({ label: r.display_name.split(",").slice(0, 3).join(", "), lat: +r.lat, lon: +r.lon });

  /* ── Cleanup map on unmount ── */
  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div className="loc-overlay" onClick={onClose}>
      <div className="loc-modal loc-modal--map" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="loc-modal__head">
          <div className="loc-modal__head-left">
            <div className="loc-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <div>
              <h3>Set delivery location</h3>
              <p>Search or pin your exact spot on the map</p>
            </div>
          </div>
          <button className="loc-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="loc-tabs">
          <button
            className={`loc-tab ${tab === "search" ? "loc-tab--active" : ""}`}
            onClick={() => setTab("search")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
          <button
            className={`loc-tab ${tab === "map" ? "loc-tab--active" : ""}`}
            onClick={() => setTab("map")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            Pick on map
          </button>
        </div>

        {/* ══ SEARCH TAB ══ */}
        {tab === "search" && (
          <div className="loc-search-panel">
            {/* GPS detect */}
            <button className="loc-detect" onClick={detectLocation} disabled={detecting}>
              <div className="loc-detect__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                </svg>
              </div>
              <div className="loc-detect__text">
                <span className="loc-detect__label">{detecting ? "Detecting your location…" : "Use current location"}</span>
                <span className="loc-detect__sub">Uses device GPS</span>
              </div>
              {!detecting && (
                <svg className="loc-detect__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
              {detecting && <div className="loc-spinner" />}
            </button>

            {/* Divider */}
            <div className="loc-divider"><span>or search manually</span></div>

            {/* Search input */}
            <div className="loc-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                placeholder="Search area, street, city…"
                value={query}
                onChange={e => search(e.target.value)}
                autoFocus
              />
              {query && (
                <button className="loc-search__clear" onClick={() => { setQuery(""); setResults([]); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="loc-list">
                {results.map((r, i) => (
                  <li key={i} onClick={() => pick(r)}>
                    <div className="loc-list__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                    </div>
                    <div className="loc-list__text">
                      <span className="loc-list__name">{r.display_name.split(",")[0]}</span>
                      <span className="loc-list__sub">{r.display_name.split(",").slice(1, 3).join(", ")}</span>
                    </div>
                    <svg className="loc-list__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </li>
                ))}
              </ul>
            )}

            {/* Recent */}
            {!query && RECENT.length > 0 && (
              <>
                <p className="loc-label">Recent searches</p>
                <ul className="loc-list">
                  {RECENT.map((r, i) => (
                    <li key={i} onClick={() => onSelect(r)}>
                      <div className="loc-list__icon loc-list__icon--recent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                      </div>
                      <div className="loc-list__text">
                        <span className="loc-list__name">{r.label}</span>
                      </div>
                      <svg className="loc-list__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {!query && RECENT.length === 0 && results.length === 0 && (
              <div className="loc-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p>Search for your area or street</p>
              </div>
            )}
          </div>
        )}

        {/* ══ MAP TAB ══ */}
        {tab === "map" && (
          <div className="loc-map-panel">
            {/* Map container */}
            <div className="loc-map-wrap">
              <div ref={mapContainerRef} className="loc-map" />

              {/* Center crosshair hint */}
              <div className="loc-map__hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                </svg>
                <span>Click on map or drag pin to set location</span>
              </div>
            </div>

            {/* Pin address + confirm */}
            <div className="loc-map-footer">
              <div className="loc-map-footer__addr">
                <div className="loc-map-footer__pin">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </div>
                <div className="loc-map-footer__label">
                  <span className="loc-map-footer__tag">Delivery to</span>
                  <span className="loc-map-footer__addr-text">{pinLabel}</span>
                </div>
              </div>
              <button
                className="loc-map-footer__confirm"
                onClick={confirmPin}
                disabled={pinLabel === "Locating…" || pinLabel === "Drag the pin to your location"}
              >
                Confirm location
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   CART ICON
══════════════════════════════════════ */
function CartIcon() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const sync = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
  };

  useEffect(() => {
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("cart-updated", sync);
    };
  }, []);

  return (
    <button className="header__cart" onClick={() => navigate("/cart")} aria-label="View cart">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {count > 0 && <span className="header__cart-badge">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}


/* ══════════════════════════════════════
   CENTER MARQUEE
══════════════════════════════════════ */
const MARQUEE_ITEMS = [
  "🍕 Free delivery on orders above ₹299",
  "🎉 New restaurants added every week",
  "⚡ Lightning-fast delivery in 30 mins",
  "🍔 Exclusive deals — up to 40% off today",
  "🌮 Order now & earn loyalty points",
  "🍣 Premium picks from top-rated chefs",
];

function CenterMarquee() {
  const text = MARQUEE_ITEMS.join("   •   ");
  return (
    <div className="header__marquee" aria-label="Promotions ticker">
      <div className="header__marquee-track">
        <span aria-hidden="true">{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
        <span aria-hidden="true">{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════
   USER DROPDOWN
══════════════════════════════════════ */
function UserDropdown({ user, onClose, menuRef }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    onClose();
    navigate("/login");
  };

  const go = (path) => { onClose(); navigate(path); };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="hd-dropdown" ref={menuRef}>
      <div className="hd-dropdown__card">
        <div className="hd-dropdown__avatar">{initials}</div>
        <div className="hd-dropdown__info">
          <p className="hd-dropdown__name">{user?.name}</p>
          <p className="hd-dropdown__email">{user?.email}</p>
        </div>
      </div>

      <div className="hd-dropdown__divider" />

      <ul className="hd-dropdown__list">
        <li onClick={() => go("/profile")}>
          <span className="hd-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </span>
          <span>My Profile</span>
          <span className="hd-dropdown__arrow">›</span>
        </li>

        <li onClick={() => go("/my-orders")}>
          <span className="hd-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
          </span>
          <span>My Orders</span>
          <span className="hd-dropdown__arrow">›</span>
        </li>

        <li onClick={() => go("/reservations")}>
          <span className="hd-dropdown__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
            </svg>
          </span>
          <span>Table Bookings</span>
          <span className="hd-dropdown__arrow">›</span>
        </li>
      </ul>

      <div className="hd-dropdown__divider" />

      <button className="hd-dropdown__logout" onClick={logout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  );
}


/* ══════════════════════════════════════
   MAIN HEADER
══════════════════════════════════════ */
export default function Header() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [location, setLocation] = useState(null);
  const [showLoc, setShowLoc]   = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const [maintenance, setMaintenance]     = useState(false);
  const [maintSettings, setMaintSettings] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    const loc = localStorage.getItem("foodie_location");
    if (loc) setLocation(JSON.parse(loc));
    fetchMaintenanceStatus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/settings`);
      const s = data?.settings;
      if (!s || !s.maintenanceMode) return;
      if (s.maintenanceStartDate && s.maintenanceEndDate) {
        const now = new Date(), start = new Date(s.maintenanceStartDate), end = new Date(s.maintenanceEndDate);
        if (now >= start && now <= end) { setMaintenance(true); setMaintSettings(s); }
      } else { setMaintenance(true); setMaintSettings(s); }
    } catch (err) {
      if (err.response?.status === 503) { setMaintenance(true); setMaintSettings({ maintenanceMode: true }); }
    }
  };

  const handleLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem("foodie_location", JSON.stringify(loc));
    const recent = JSON.parse(localStorage.getItem("foodie_recent") || "[]");
    localStorage.setItem("foodie_recent", JSON.stringify(
      [loc, ...recent.filter(r => r.label !== loc.label)].slice(0, 4)
    ));
    setShowLoc(false);
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="header-wrapper">
        {maintenance && <MaintenanceTicker settings={maintSettings} />}

        <header className="header">
          <div className="header__brand" onClick={() => navigate("/")}>
            <span className="header__logo">🍽</span>
            <span className="header__name">Foodie</span>
          </div>

          <button className="header__loc" onClick={() => setShowLoc(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span>{location ? location.label : "Set location"}</span>
            <svg className="header__loc-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
            </svg>
          </button>

          {maintenance ? (
            <div className="header__maint-center">
              <span className="header__maint-center-text">
                ⚙️ &nbsp;Scheduled maintenance in progress — we'll be back shortly
              </span>
            </div>
          ) : (
            <CenterMarquee />
          )}

          <div className="header__right">
            <CartIcon />
            {user ? (
              <div className="header__user" style={{ position: "relative" }}>
                <button
                  className="header__avatar"
                  onClick={() => setShowMenu(v => !v)}
                  aria-label="Open user menu"
                  aria-expanded={showMenu}
                >
                  <span>{initials}</span>
                </button>
                <span className="header__username">{user.name?.split(" ")[0]}</span>
                {showMenu && (
                  <UserDropdown user={user} onClose={() => setShowMenu(false)} menuRef={menuRef} />
                )}
              </div>
            ) : (
              <button className="header__login" onClick={() => navigate("/login")}>
                Sign in
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </header>
      </div>

      {showLoc && (
        <MapLocationModal onClose={() => setShowLoc(false)} onSelect={handleLocation} />
      )}
    </>
  );
}