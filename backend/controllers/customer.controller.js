const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// ─── REGISTER ────────────────────────────────────────────────────────────────
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. All fields must be present
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // 3. Email must be unique (application-level check)
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 4. Hash the password — NEVER store plain-text
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save to MongoDB
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // 6. Return customer WITHOUT the password field
    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Both fields required
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find customer — same generic error for both failure cases (security)
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 3. Compare entered password against stored bcrypt hash
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT and store it in an HttpOnly cookie
    const token = generateToken(customer._id.toString());
    res.cookie("token", token, {
      httpOnly: true,   // JS cannot read this cookie
      secure: false,    // set true in production (HTTPS only)
      sameSite: "lax",  // basic CSRF protection for same-site requests
    });

    // 5. Return success response (token is in HttpOnly cookie)
    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── GET MY PROFILE ───────────────────────────────────────────────────────────
// req.user is already attached by authMiddleware — just send it back
const getMyProfile = async (req, res) => {
  res.json(req.user);
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logoutCustomer = async (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
};
