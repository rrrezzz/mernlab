const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ─── ADD PRODUCT TO WISHLIST ────────────────────────────────────────────────
// POST /wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find current authenticated user (req.user populated by authMiddleware)
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Duplicate prevention
    const alreadyInWishlist = user.wishlist && user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 5. Append reference and save
    if (!user.wishlist) {
      user.wishlist = [];
    }
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── GET CURRENT USER'S WISHLIST ─────────────────────────────────────────────
// GET /wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find current user and populate wishlist reference to Product collection
    const user = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter any dangling references if a product was deleted
    const items = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: items.length,
      wishlist: items,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── REMOVE PRODUCT FROM WISHLIST ───────────────────────────────────────────
// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Find current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check if product is currently in user's wishlist
    const index = (user.wishlist || []).findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // 4. Remove reference and save
    user.wishlist.splice(index, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── BONUS: TOGGLE WISHLIST ACTION ───────────────────────────────────────────
// PATCH /wishlist/:productId/toggle
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    if (index !== -1) {
      // Already saved -> Remove
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        inWishlist: false,
      });
    } else {
      // Not saved -> Add
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        inWishlist: true,
      });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
