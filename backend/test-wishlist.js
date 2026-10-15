const mongoose = require("mongoose");
const { createMemoryMongoServer, stopMemoryMongoServer } = require("./utils/memoryMongo");
const express = require("express");
const cookieParser = require("cookie-parser");
const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const customerRoutes = require("./routes/customer.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const generateToken = require("./utils/generateToken");

async function runTests() {
  console.log("=== STARTING BACKEND WISHLIST TESTS ===");

  // 1. Setup in-memory MongoDB
  const mongod = await createMemoryMongoServer();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log("Connected to MongoMemoryServer at:", uri);

  // 2. Setup Express test app
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/customers", customerRoutes);
  app.use("/wishlist", wishlistRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  // 3. Seed a test product
  const product = await Product.create({
    name: "Mechanical Keyboard Pro",
    description: "Premium tactile keyboard",
    price: 3499,
    category: "Electronics",
    image: "https://example.com/keyboard.jpg",
    stock: 12,
  });
  console.log("Created test product:", product._id.toString());

  // 4. Create and register a test user
  const customer = await Customer.create({
    fullName: "Alex Rivera",
    email: "alex@shopkart.test",
    password: "hashedpassword123",
    phone: "9876543210",
    wishlist: [],
  });
  console.log("Created test user:", customer._id.toString());

  const token = generateToken(customer._id.toString());
  const authHeader = { Authorization: `Bearer ${token}` };

  let passed = 0;
  let failed = 0;

  const assert = (condition, desc) => {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  };

  // Test 1: Unauthenticated request should return 401
  {
    const res = await fetch(`${baseUrl}/wishlist`);
    assert(res.status === 401, `Unauthenticated GET /wishlist returns 401 (got ${res.status})`);
  }

  // Test 2: Invalid product ID should return 400
  {
    const res = await fetch(`${baseUrl}/wishlist/invalid_mongo_id`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 400 && body.success === false, `Invalid product ID returns 400 (got ${res.status})`);
  }

  // Test 3: Non-existent product ID should return 404
  {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/wishlist/${fakeId}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 404 && body.success === false, `Non-existent product returns 404 (got ${res.status})`);
  }

  // Test 4: Add valid product to wishlist -> 200/201
  {
    const res = await fetch(`${baseUrl}/wishlist/${product._id}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert((res.status === 200 || res.status === 201) && body.success === true, `Add to wishlist returns 200 (got ${res.status})`);
  }

  // Test 5: Duplicate Add should return 409 Conflict
  {
    const res = await fetch(`${baseUrl}/wishlist/${product._id}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 409 && body.success === false, `Duplicate add returns 409 Conflict (got ${res.status})`);
  }

  // Test 6: GET /wishlist should return populated product details and count
  {
    const res = await fetch(`${baseUrl}/wishlist`, {
      headers: authHeader,
    });
    const body = await res.json();
    const hasProduct = body.wishlist && body.wishlist.some(p => p._id === product._id.toString() && p.name === product.name);
    assert(res.status === 200 && body.count === 1 && hasProduct, `GET /wishlist returns populated products (count: ${body.count})`);
  }

  // Test 7: DELETE /wishlist/:productId removes product -> 200
  {
    const res = await fetch(`${baseUrl}/wishlist/${product._id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 200 && body.success === true, `DELETE /wishlist/:productId returns 200 (got ${res.status})`);
  }

  // Test 8: DELETE /wishlist/:productId when not in wishlist -> 404
  {
    const res = await fetch(`${baseUrl}/wishlist/${product._id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 404 && body.success === false, `DELETE when not in wishlist returns 404 (got ${res.status})`);
  }

  // Test 9: BONUS Toggle Wishlist (PATCH /wishlist/:productId/toggle)
  {
    // Toggle 1: Not in wishlist -> Adds it
    const res1 = await fetch(`${baseUrl}/wishlist/${product._id}/toggle`, {
      method: "PATCH",
      headers: authHeader,
    });
    const body1 = await res1.json();
    assert(res1.status === 200 && body1.inWishlist === true, `Toggle adds to wishlist when not present (inWishlist: true)`);

    // Toggle 2: Already in wishlist -> Removes it
    const res2 = await fetch(`${baseUrl}/wishlist/${product._id}/toggle`, {
      method: "PATCH",
      headers: authHeader,
    });
    const body2 = await res2.json();
    assert(res2.status === 200 && body2.inWishlist === false, `Toggle removes from wishlist when present (inWishlist: false)`);
  }

  // Test 10: Cookie authentication verification
  {
    const res = await fetch(`${baseUrl}/wishlist`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    const body = await res.json();
    assert(res.status === 200 && body.success === true, `Cookie-based authentication succeeds on /wishlist`);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);

  server.close();
  await mongoose.disconnect();
  await stopMemoryMongoServer(mongod);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
