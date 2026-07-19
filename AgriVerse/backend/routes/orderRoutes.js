const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  acceptOrderAmount,
  setPaymentMethod,
  uploadPaymentScreenshot,
} = require("../controllers/orderController");
const { uploadPaymentScreenshot: uploadMiddleware } = require("../middleware/uploadMiddleware");

router.post("/", createOrder);
router.get("/:id", getOrderById);
router.put("/:id/accept", acceptOrderAmount);
router.put("/:id/payment-method", setPaymentMethod);
router.post("/:id/payment-screenshot", uploadMiddleware.single("screenshot"), uploadPaymentScreenshot);

module.exports = router;
