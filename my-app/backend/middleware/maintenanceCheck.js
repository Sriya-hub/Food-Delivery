const Settings = require("../models/Settings");

const maintenanceCheck = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    /* No settings found */
    if (!settings) {
      return next();
    }

    /* Maintenance disabled */
    if (!settings.maintenanceMode) {
      return next();
    }

    const now = new Date();

    /* Scheduled Maintenance Check */
    if (
      settings.maintenanceStartDate &&
      settings.maintenanceEndDate
    ) {
      const startDate = new Date(
        settings.maintenanceStartDate
      );

      const endDate = new Date(
        settings.maintenanceEndDate
      );

      /* Outside maintenance window */
      if (
        now < startDate ||
        now > endDate
      ) {
        return next();
      }
    }

    /* Allow login route */
    if (
      req.originalUrl.startsWith(
        "/api/auth/login"
      )
    ) {
      return next();
    }

    /* Allow admin routes */
    if (
      req.originalUrl.startsWith(
        "/api/admin"
      )
    ) {
      return next();
    }

    /* Allow health check */
    if (req.originalUrl === "/") {
      return next();
    }

    /* Block everything else */
    return res.status(503).json({
      success: false,
      maintenance: true,
      message:
        "Website is currently under maintenance.",
      startDate:
        settings.maintenanceStartDate,
      endDate:
        settings.maintenanceEndDate,
    });
  } catch (error) {
    console.error(
      "Maintenance Check Error:",
      error
    );

    next();
  }
};

module.exports = maintenanceCheck;