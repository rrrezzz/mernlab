const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All wishlist endpoints are protected — user identity comes from authMiddleware
router.post("/:productId", authMiddleware, addToWishlist);
router.get("/", authMiddleware, getWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);
router.patch("/:productId/toggle", authMiddleware, toggleWishlist);

module.exports = router;
