const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} = require("../controllers/productController");
const {
  getAllOrders,
  approveOrder,
  setDeliveryChargeAndAmount,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  getAllContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} = require("../controllers/contactController");

// Every route below requires a valid admin JWT
router.use(protectAdmin);

// Products
router.get("/products", getAllProductsAdmin);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/approve", approveOrder);
router.put("/orders/:id/amount", setDeliveryChargeAndAmount);
router.put("/orders/:id/status", updateOrderStatus);

// Contact messages
router.get("/contact-messages", getAllContactMessages);
router.put("/contact-messages/:id/read", markContactMessageRead);
router.delete("/contact-messages/:id", deleteContactMessage);

module.exports = router;
