const express = require("express");
const router = express.Router();

const DeliveryPartner = require("../models/DeliveryPartner");

/* =====================================
   GET DELIVERY PARTNER PROFILE STATUS
===================================== */

router.get(
  "/profile/:mobile",

  async (req, res) => {
    try {
      const { mobile } = req.params;

      const partner =
        await DeliveryPartner.findOne({
          mobile,
        });

      /* ==========================
         NOT REGISTERED
      ========================== */

      if (!partner) {
        return res.status(200).json({
          success: true,

          exists: false,

          registrationCompleted:
            false,

          approvalStatus: null,
        });
      }

      /* ==========================
         REGISTERED
      ========================== */

      return res.status(200).json({
        success: true,

        exists: true,

        registrationCompleted:
          partner.registrationCompleted,

        approvalStatus:
          partner.approvalStatus,

        fullName:
          partner.fullName,

        mobile:
          partner.mobile,

        profilePhoto:
          partner.profilePhoto,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

module.exports = router;