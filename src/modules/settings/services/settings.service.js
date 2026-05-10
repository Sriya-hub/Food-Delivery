import Settings from "../models/settings.model.js";

// ✅ GET (ONLY ONE)
export const getSettingsData = async () => {
  let settings = await Settings.findOne();

  // 🔥 If not exists → create default
  if (!settings) {
    settings = await Settings.create({});
  }

  return settings;
};

// 🔥 UPDATE (NOT CREATE)
export const updateSettingsData = async (data) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(data);
  } else {
    settings = await Settings.findOneAndUpdate({}, data, {
      new: true,
      runValidators: true
    });
  }

  return settings;
};