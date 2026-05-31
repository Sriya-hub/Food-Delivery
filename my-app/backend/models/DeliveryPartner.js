const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
{
    fullName: String,
    mobile: String,
    email: String,
    dob: String,
    gender: String,

    profilePhoto: String,

    address: {
        houseNo: String,
        street: String,
        area: String,
        city: String,
        state: String,
        pincode: String
    },

    aadhaarNumber: String,
    aadhaarFront: String,
    aadhaarBack: String,

    drivingLicenseNumber: String,
    drivingLicenseImage: String,

    vehicleType: String,
    vehicleNumber: String,
    vehicleRC: String,

    bankHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,

    emergencyName: String,
    emergencyRelation: String,
    emergencyPhone: String,

    workType: String,
    preferredArea: String,
    workingHours: String,

    locationPermission: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        default: "Pending"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    "DeliveryPartner",
    deliveryPartnerSchema
);