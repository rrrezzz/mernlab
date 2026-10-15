const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const { seedProducts } = require("./seed");
const { createMemoryMongoServer } = require("./utils/memoryMongo");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);
app.use("/auth", customerRoutes); // Alias for auth routes compatibility
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

const startServer = async () => {
  const PORT = process.env.PORT || 5000;

  try {
    if (process.env.MONGO_URI) {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("MongoDB Atlas connected successfully!");
    } else {
      throw new Error("MONGO_URI not configured");
    }
  } catch (error) {
    console.warn("MongoDB Atlas connection failed:", error.message);
    console.log("Starting in-memory MongoDB fallback for local development...");
    try {
      const mongod = await createMemoryMongoServer();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("In-memory MongoDB connected successfully at:", uri);
    } catch (fallbackError) {
      console.error("Failed to start in-memory MongoDB:", fallbackError.message);
    }
  }

  // Auto-seed initial catalogue if database has 0 products
  if (mongoose.connection.readyState === 1) {
    await seedProducts();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
