const mongoose = require("mongoose");

/*
 * A Product document represents ONE specific SKU at the bottom of the
 * category flow, e.g. "Paddy / Jaya / New / High Quality".
 *
 * Not every category uses every field:
 *  - Paddy            -> category, variety, age, quality
 *  - Ragi / HorseGram  -> category, age, quality        (variety = null)
 *  - Chilli / Groundnuts / Little Millets
 *                      -> category, quality              (variety = null, age = null)
 *
 * sampleImages[] powers the "select a sample before ordering" gallery.
 * Each sample has its own id so the order can record exactly which
 * sample photo the customer picked.
 */

const sampleImageSchema = new mongoose.Schema(
  {
    sampleId: { type: String, required: true }, // e.g. "paddy-jaya-new-high-1"
    url: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // human readable, e.g. "Jaya New High Quality Paddy"
    category: {
      type: String,
      required: true,
      enum: ["paddy", "ragi", "horsegram", "chilli", "groundnuts", "little-millets"],
    },
    variety: { type: String, default: null }, // "jaya" | "narmada" | null
    age: { type: String, default: null }, // "new" | "old" | null
    quality: { type: String, required: true }, // "poor" | "medium" | "high" | "low"
    price: { type: Number, required: true, min: 0 }, // ₹ per kg
    stock: { type: Number, required: true, min: 0 }, // kg available
    mainImage: { type: String, required: true },
    sampleImages: { type: [sampleImageSchema], default: [] },
    isBestSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One SKU per unique combination of category/variety/age/quality
productSchema.index({ category: 1, variety: 1, age: 1, quality: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
