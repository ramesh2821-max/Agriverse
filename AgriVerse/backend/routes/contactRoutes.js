const express = require("express");
const router = express.Router();
const { submitContactMessage } = require("../controllers/contactController");

// Public - anyone visiting the Contact page can submit this
router.post("/", submitContactMessage);

module.exports = router;
