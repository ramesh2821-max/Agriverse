const mongoose = require("mongoose");

// Lightweight customer record. AgriVerse allows guest ordering, so a User
// is created/updated automatically whenever someone places an order using
// their mobile number as the unique identifier.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    address: { type: String },
    village: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
