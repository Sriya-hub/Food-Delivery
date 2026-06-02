import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./AdminSettings.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Convert a UTC ISO string from MongoDB → "YYYY-MM-DDTHH:MM" in LOCAL time
// so datetime-local inputs display correctly.
function toLocalDatetimeInput(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d)) return "";
  // Offset the UTC time by the local timezone offset
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 16);
}

let toastCounter = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const show = useCallback(
    (type, title, message) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, type, title, message, exiting: false }]);
      setTimeout(() => dismiss(id), 4500);
      return id;
    },
    [dismiss]
  );

  return { toasts, show, dismiss };
}

function ToastIcon({ type }) {
  const icons = {
    success: "ti-check",
    error: "ti-x",
    info: "ti-info-circle",
  };
  return (
    <div className={`toast-icon toast-icon--${type}`} aria-hidden="true">
      <i className={`ti ${icons[type] ?? "ti-bell"}`} />
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  return (
    <div className={`toast toast--${toast.type}${toast.exiting ? " toast--out" : ""}`}>
      <ToastIcon type={toast.type} />
      <div className="toast-body">
        <p className="toast-title">{toast.title}</p>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <i className="ti ti-x" aria-hidden="true" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="toggle-switch" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" />
      <div className="toggle-knob" />
    </label>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`status-badge status-badge--${active ? "on" : "off"}`}>
      <span className="status-dot" aria-hidden="true" />
      {active ? "Active" : "Offline"}
    </span>
  );
}

function DurationPill({ start, end }) {
  if (!start || !end) return null;
  const diff = (new Date(end) - new Date(start)) / 1000;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const label = h > 0 ? `Duration: ${h}h ${m}m` : `Duration: ${m}m`;
  return (
    <span className="duration-pill">
      <i className="ti ti-clock" aria-hidden="true" />
      {label}
    </span>
  );
}

export default function AdminSettings() {
  const { toasts, show, dismiss } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceStartDate: "",
    maintenanceEndDate: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/admin/settings`);
        const data = res.data.settings || {};
        setSettings({
          maintenanceMode: data.maintenanceMode ?? false,
          maintenanceStartDate: toLocalDatetimeInput(data.maintenanceStartDate),
          maintenanceEndDate: toLocalDatetimeInput(data.maintenanceEndDate),
        });
      } catch {
        show("error", "Failed to load", "Could not fetch settings. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const patch = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const saveSettings = async () => {
    const { maintenanceStartDate: start, maintenanceEndDate: end } = settings;
    if (start && end && new Date(end) <= new Date(start)) {
      show("error", "Invalid schedule", "End date must be after the start date.");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${API}/api/admin/settings`, {
        maintenanceMode: settings.maintenanceMode,
        maintenanceStartDate: settings.maintenanceStartDate,
        maintenanceEndDate: settings.maintenanceEndDate,
      });
      show("success", "Settings saved", "Maintenance configuration updated successfully.");
    } catch {
      show("error", "Save failed", "Unable to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading" aria-live="polite">
        <div className="settings-loading__spinner" aria-hidden="true" />
        Loading settings…
      </div>
    );
  }

  return (
    <>
      <div className="settings-page">
        <div className="settings-header">
          <div className="settings-header__icon" aria-hidden="true">
            <i className="ti ti-tool" />
          </div>
          <div>
            <h1 className="settings-header__title">Maintenance Settings</h1>
            <p className="settings-header__sub">
              Control site availability and scheduled downtime
            </p>
          </div>
        </div>

        <div className="settings-card">
          {/* Status section */}
          <div className="settings-section">
            <p className="settings-section__label">Status</p>
            <div className="toggle-row">
              <div className="toggle-row__info">
                <h2 className="toggle-row__title">Maintenance Mode</h2>
                <p className="toggle-row__desc">
                  When active, visitors see a maintenance page instead of your site.
                </p>
                <StatusBadge active={settings.maintenanceMode} />
              </div>
              <ToggleSwitch
                label="Enable maintenance mode"
                checked={settings.maintenanceMode}
                onChange={(e) => patch("maintenanceMode", e.target.checked)}
              />
            </div>
          </div>

          {/* Schedule section */}
          <div className="settings-section">
            <p className="settings-section__label">Schedule</p>
            <div className="datetime-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="startDate">
                  <i className="ti ti-calendar" aria-hidden="true" />
                  Start
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  className="field-input"
                  value={settings.maintenanceStartDate}
                  onChange={(e) => patch("maintenanceStartDate", e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="endDate">
                  <i className="ti ti-calendar-check" aria-hidden="true" />
                  End
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  className="field-input"
                  value={settings.maintenanceEndDate}
                  onChange={(e) => patch("maintenanceEndDate", e.target.value)}
                />
              </div>
            </div>
            <DurationPill
              start={settings.maintenanceStartDate}
              end={settings.maintenanceEndDate}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <p className="settings-actions__hint">
            <i className="ti ti-shield-check" aria-hidden="true" />
            Changes apply immediately on save
          </p>
          <button
            className="save-btn"
            onClick={saveSettings}
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? (
              <>
                <span className="save-btn__spinner" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <i className="ti ti-device-floppy" aria-hidden="true" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}