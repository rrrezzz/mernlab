const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

const router = express.Router();

// Open routes — no auth required for this lab
router.post("/", createProduct);         // POST   /products
router.get("/", getAllProducts);          // GET    /products?search=&category=&sort=
router.get("/:id", getProductById);      // GET    /products/:id

module.exports = router;
