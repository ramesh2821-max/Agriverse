const express = require("express");
const router = express.Router();
const {
  getProducts,
  getBestSaleProducts,
  getProductById,
} = require("../controllers/productController");

// Public, customer-facing routes
router.get("/best-sale", getBestSaleProducts);
router.get("/:id", getProductById);
router.get("/", getProducts);

module.exports = router;
