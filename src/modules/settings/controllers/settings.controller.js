import {
  getSettingsData,
  updateSettingsData
} from "../services/settings.service.js";

// ✅ GET
const getSettings = async (req, res, next) => {
  try {
    const data = await getSettingsData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// 🔥 UPDATE
const updateSettings = async (req, res, next) => {
  try {
    const updated = await updateSettingsData(req.body);

    res.json({
      success: true,
      message: "Settings updated",
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getSettings,
  updateSettings
};