const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Payment screenshots get saved to backend/uploads/payments
const paymentsDir = path.join(__dirname, "..", "uploads", "payments");
if (!fs.existsSync(paymentsDir)) fs.mkdirSync(paymentsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, paymentsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpg, png, webp) are allowed for payment screenshots"));
};

const uploadPaymentScreenshot = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadPaymentScreenshot };
