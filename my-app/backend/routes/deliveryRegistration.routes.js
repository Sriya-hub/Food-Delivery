const express = require("express");
const router = express.Router();
const DeliveryPartner = require("../models/DeliveryPartner");

router.post("/register", async (req,res) => {
    try {

        const partner =
            await DeliveryPartner.create(req.body);

        res.status(201).json({
            success:true,
            message:"Registration Submitted",
            data:partner
        });

    } catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });
    }
});

module.exports = router;