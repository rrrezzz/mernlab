const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Utility to escape regex special characters to prevent ReDoS / query syntax errors
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─── CREATE PRODUCT ───────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check presence of required string fields
    if (
      !name ||
      !description ||
      !category ||
      !image ||
      !String(name).trim() ||
      !String(description).trim() ||
      !String(category).trim() ||
      !String(image).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "name, description, category and image are required",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "price is required",
      });
    }

    if (stock === undefined || stock === null || stock === "") {
      return res.status(400).json({
        success: false,
        message: "stock is required",
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative and must be an integer",
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Mongoose validation or cast errors
    if (error.name === "ValidationError" || error.name === "CastError") {
      const messages = error.errors
        ? Object.values(error.errors).map((e) => e.message)
        : [error.message];
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── GET ALL PRODUCTS (with search, category filter & sort) ───────────────────
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (search && search.trim()) {
      // Case-insensitive partial match on product name with regex escaping
      const escapedSearch = escapeRegex(search.trim());
      filter.name = { $regex: escapedSearch, $options: "i" };
    }

    if (
      category &&
      category.trim() &&
      category.trim().toLowerCase() !== "all" &&
      category.trim().toLowerCase() !== "all categories"
    ) {
      const escapedCat = escapeRegex(category.trim());
      filter.category = { $regex: new RegExp(`^${escapedCat}$`, "i") };
    }

    // Build sort option (BONUS: price sorting)
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    // Do not return unnecessary fields (__v) for product listing
    const products = await Product.find(filter).sort(sortOption).select("-__v");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ─── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).select("-__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
