const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    canteenName: {
      type: String,
      default: "College Smart Canteen",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    orderAcceptance: {
      type: Boolean,
      default: true,
    },
    openingTime: {
      type: String,
      default: "08:00 AM",
    },
    closingTime: {
      type: String,
      default: "06:30 PM",
    },
    announcement: {
      type: String,
      default: "Welcome to Smart Canteen! Pre-order your meals & skip the waiting line.",
    },
    pickupSlots: {
      type: [String],
      default: [
        "Immediate (10-15 mins)",
        "12:30 PM - 01:00 PM (Lunch Slot 1)",
        "01:00 PM - 01:30 PM (Lunch Slot 2)",
        "01:30 PM - 02:00 PM (Lunch Slot 3)",
        "04:00 PM - 04:30 PM (Snacks Break)",
        "05:00 PM - 05:30 PM (Evening Slot)",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Method to get or initialize settings singleton
settingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
