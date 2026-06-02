const Log = require("../models/Log");

const createLog = async ({
  user,
  role,
  action,
  status = "Success",
}) => {
  try {
    await Log.create({
      user,
      role,
      action,
      status,
    });
  } catch (err) {
    console.error("Log Error:", err);
  }
};

module.exports = createLog;