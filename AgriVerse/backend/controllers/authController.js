const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// @route POST /api/auth/login
// @desc  Admin login - returns a JWT used for all /api/admin/* routes
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (admin && (await admin.matchPassword(password))) {
    return res.json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      token: generateToken(admin._id),
    });
  }

  return res.status(401).json({ message: "Invalid email or password" });
};

// @route GET /api/auth/me
const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};

module.exports = { loginAdmin, getAdminProfile };
