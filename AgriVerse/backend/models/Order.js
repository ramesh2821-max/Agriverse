const mongoose = require("mongoose");

// One line item inside a cart checkout - e.g. "5kg of Jaya New High Quality Paddy".
// A single Order can now contain several of these (one per grain the customer
// added to their cart before checking out).
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true }, // snapshot at order time
    category: { type: String, required: true },
    variety: { type: String, default: null },
    age: { type: String, default: null },
    quality: { type: String, required: true },
    selectedImage: { type: String, required: true }, // the sample image URL the customer chose
    quantity: { type: Number, required: true, min: 1 }, // kg
    pricePerKg: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Customer details (also mirrored into the User collection)
    customerName: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    village: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    // Cart contents - every grain the customer added before checking out
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    // Pricing (computed across all items)
    itemsTotal: { type: Number, default: 0 }, // sum of (pricePerKg * quantity) across items
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }, // itemsTotal + deliveryCharge

    // Admin workflow:
    // pending_review -> order request just came in, awaiting admin approval
    // approved       -> admin approved the request, can now set delivery charge
    // amount_sent    -> admin sent the final amount, awaiting customer acceptance
    // accepted       -> customer accepted the amount, proceeding to payment
    // confirmed      -> payment method chosen / screenshot uploaded
    // shipped / delivered / cancelled
    orderStatus: {
      type: String,
      enum: [
        "pending_review",
        "approved",
        "amount_sent",
        "accepted",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending_review",
    },

    // Payment
    paymentMethod: { type: String, enum: ["cod", "scanner", null], default: null },
    paymentScreenshot: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["not_applicable", "pending_verification", "verified", "cod_pending", "cod_collected"],
      default: "not_applicable",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
