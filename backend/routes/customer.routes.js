const express = require("express");
const {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
} = require("../controllers/customer.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes — no auth needed
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected routes — must pass authMiddleware first
// Express calls handlers left-to-right:  authMiddleware → getMyProfile
router.get("/me", authMiddleware, getMyProfile);
router.post("/logout", authMiddleware, logoutCustomer);

module.exports = router;
