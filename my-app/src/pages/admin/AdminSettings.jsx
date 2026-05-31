import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminSettings.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function AdminSettings() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [settings, setSettings] =
    useState({
      maintenanceMode: false,

      maintenanceStartDate: "",

      maintenanceEndDate: "",
    });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await axios.get(
        `${API}/api/admin/settings`
      );

      const data =
        res.data.settings || {};

      setSettings({
        maintenanceMode:
          data.maintenanceMode || false,

        maintenanceStartDate:
          data.maintenanceStartDate
            ? data.maintenanceStartDate
                .slice(0, 16)
            : "",

        maintenanceEndDate:
          data.maintenanceEndDate
            ? data.maintenanceEndDate
                .slice(0, 16)
            : "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await axios.put(
        `${API}/api/admin/settings`,
        {
          maintenanceMode:
            settings.maintenanceMode,

          maintenanceStartDate:
            settings.maintenanceStartDate,

          maintenanceEndDate:
            settings.maintenanceEndDate,
        }
      );

      alert(
        "Settings updated successfully"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to update settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-card">

        <h2>
          Website Maintenance Settings
        </h2>

        <div className="setting-row">
          <label>
            Maintenance Mode
          </label>

          <input
            type="checkbox"
            checked={
              settings.maintenanceMode
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                maintenanceMode:
                  e.target.checked,
              })
            }
          />
        </div>

        <div className="setting-group">

          <label>
            Maintenance Start
          </label>

          <input
            type="datetime-local"
            value={
              settings.maintenanceStartDate
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                maintenanceStartDate:
                  e.target.value,
              })
            }
          />

        </div>

        <div className="setting-group">

          <label>
            Maintenance End
          </label>

          <input
            type="datetime-local"
            value={
              settings.maintenanceEndDate
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                maintenanceEndDate:
                  e.target.value,
              })
            }
          />

        </div>

        <button
          className="save-btn"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>

      </div>
    </div>
  );
}