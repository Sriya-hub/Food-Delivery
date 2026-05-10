import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeInfo: {
      storeName: String,
      storeId: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      phone: String,
      email: String,
      openingTime: String,
      closingTime: String
    },

    taxSettings: {
      enableSalesTax: Boolean,
      taxRate: Number,
      taxId: String,
      taxInclusive: Boolean
    },

    paymentMethods: {
      cash: Boolean,
      card: Boolean,
      mobile: Boolean,
      giftCards: Boolean
    },

    cardProcessing: {
      merchantId: String,
      terminalId: String,
      contactless: Boolean
    }
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);