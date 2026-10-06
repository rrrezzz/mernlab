const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches, tactile feedback, and aluminum chassis.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Wireless Ergonomic Mouse",
    description: "Precision wireless mouse with optical tracking, customizable thumb buttons, and ergonomic wrist angle.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    stock: 4, // low stock test
  },
  {
    name: "Ultra HD 4K Monitor",
    description: "27-inch IPS panel with 99% sRGB color gamut, HDR support, and USB-C connectivity.",
    price: 24999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    stock: 8,
  },
  {
    name: "Cotton Oxford Shirt",
    description: "Tailored long-sleeve button-down shirt crafted from 100% organic breathable cotton.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Vintage Leather Jacket",
    description: "Handcrafted distressed lambskin leather motorcycle jacket with quilted lining.",
    price: 6999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    stock: 3, // low stock test
  },
  {
    name: "Minimalist Canvas Sneakers",
    description: "Classic low-profile vulcanized sneakers with cushioned memory foam insole.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Clean Code",
    description: "A Handbook of Agile Software Craftsmanship by Robert C. Martin. Practical principles for writing maintainable code.",
    price: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive guide to the architecture, storage, and processing behind modern reliable distributed systems.",
    price: 1899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    stock: 7,
  },
  {
    name: "Modern Ceramic Table Lamp",
    description: "Sculptural ceramic base with warm linen shade providing soothing ambient luminescence.",
    price: 2199,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    stock: 14,
  },
  {
    name: "Ultrasonic Aroma Diffuser",
    description: "Quiet essential oil aromatherapy diffuser with warm night light and auto-off timer.",
    price: 1199,
    category: "Home",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80",
    stock: 0, // out of stock test
  },
  {
    name: "Stainless Steel Electric Kettle",
    description: "Precision gooseneck electric pour-over kettle with temperature presets and keep-warm function.",
    price: 1699,
    category: "Home",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    stock: 9,
  },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("No products found in DB. Seeding initial catalogue...");
      await Product.insertMany(sampleProducts);
      console.log(`Seeded ${sampleProducts.length} initial products successfully.`);
    } else {
      console.log(`Database already has ${count} products. Skipping auto-seed.`);
    }
  } catch (err) {
    console.error("Failed to seed products:", err.message);
  }
};

// Run standalone if executed directly via node backend/seed.js
if (require.main === module) {
  (async () => {
    try {
      if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      } else {
        throw new Error("MONGO_URI not set");
      }
    } catch (e) {
      console.warn("Atlas connection failed, using MongoMemoryServer for seed test:", e.message);
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
    }

    console.log("Connected to MongoDB for seeding...");
    // Clear and reseed on explicit CLI seed call
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} products!`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

module.exports = {
  sampleProducts,
  seedProducts,
};
