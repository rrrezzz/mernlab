const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const cookieParser = require("cookie-parser");
const Customer = require("./models/customer.model");
const Product = require("./models/product.model");
const customerRoutes = require("./routes/customer.routes");
const cartRoutes = require("./routes/cart.routes");
const generateToken = require("./utils/generateToken");

async function runCartTests() {
  console.log("=== STARTING BACKEND CART TESTS ===");

  // 1. Setup in-memory MongoDB with generous startup timeout
  const mongod = await MongoMemoryServer.create({
    instance: {
      startupTimeout: 60000,
    },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log("Connected to MongoMemoryServer at:", uri);

  // 2. Setup Express test app
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/customers", customerRoutes);
  app.use("/cart", cartRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  // 3. Seed a test product with stock = 5
  const product = await Product.create({
    name: "Mechanical Keyboard",
    description: "RGB Mechanical Keyboard",
    price: 2999,
    category: "Electronics",
    image: "https://example.com/keyboard.jpg",
    stock: 5,
  });
  console.log("Created test product (stock: 5):", product._id.toString());

  // 4. Create a test customer
  const customer = await Customer.create({
    fullName: "Jordan Lee",
    email: "jordan@shopkart.test",
    password: "hashedpassword123",
    phone: "9876543210",
    cart: [],
    wishlist: [],
  });
  console.log("Created test customer:", customer._id.toString());

  const token = generateToken(customer._id.toString());
  const authHeader = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

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
    const res = await fetch(`${baseUrl}/cart`);
    assert(res.status === 401, `Unauthenticated GET /cart returns 401 (got ${res.status})`);
  }

  // Test 2: Invalid product ID returns 400
  {
    const res = await fetch(`${baseUrl}/cart/invalid_mongo_id`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 400 && body.success === false, `Invalid product ID returns 400 (got ${res.status})`);
  }

  // Test 3: Non-existent product ID returns 404
  {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/cart/${fakeId}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    assert(res.status === 404 && body.success === false, `Non-existent product returns 404 (got ${res.status})`);
  }

  // Test 4: Add new item to cart -> quantity should be 1
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    const cartItem = body.cart && body.cart.find(
      (item) => (item.product._id || item.product).toString() === product._id.toString()
    );
    assert(
      res.status === 200 && cartItem && cartItem.quantity === 1,
      `Add new item to cart results in quantity = 1 (got quantity: ${cartItem?.quantity})`
    );
  }

  // Test 5: Add same item again -> quantity should increment to 2
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "POST",
      headers: authHeader,
    });
    const body = await res.json();
    const cartItem = body.cart && body.cart.find(
      (item) => (item.product._id || item.product).toString() === product._id.toString()
    );
    assert(
      res.status === 200 && cartItem && cartItem.quantity === 2,
      `Add same item again increments quantity to 2 (got quantity: ${cartItem?.quantity})`
    );
  }

  // Test 6: GET /cart populates Product info
  {
    const res = await fetch(`${baseUrl}/cart`, {
      headers: authHeader,
    });
    const body = await res.json();
    const item = body.cart && body.cart[0];
    const isPopulated = item && item.product && item.product.name === product.name && item.product.price === 2999;
    assert(
      res.status === 200 && isPopulated && item.quantity === 2,
      `GET /cart returns populated product info (name: ${item?.product?.name}, price: ${item?.product?.price})`
    );
  }

  // Test 7: Update quantity (PATCH /cart/:productId) -> set quantity = 3
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "PATCH",
      headers: authHeader,
      body: JSON.stringify({ quantity: 3 }),
    });
    const body = await res.json();
    const item = body.cart && body.cart.find(
      (i) => (i.product._id || i.product).toString() === product._id.toString()
    );
    assert(
      res.status === 200 && item && item.quantity === 3,
      `Update quantity to 3 succeeds (got quantity: ${item?.quantity})`
    );
  }

  // Test 8: Quantity < 1 rejects with 400
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "PATCH",
      headers: authHeader,
      body: JSON.stringify({ quantity: 0 }),
    });
    const body = await res.json();
    assert(
      res.status === 400 && body.success === false,
      `Update quantity < 1 returns 400 Bad Request (got ${res.status})`
    );
  }

  // Test 9: Exceed stock limits rejects with 400 (stock is 5, requested 10)
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "PATCH",
      headers: authHeader,
      body: JSON.stringify({ quantity: 10 }),
    });
    const body = await res.json();
    assert(
      res.status === 400 && body.success === false,
      `Exceeding product stock returns 400 Bad Request (got ${res.status})`
    );
  }

  // Test 10: DELETE /cart/:productId removes item
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const body = await res.json();
    const itemExists = body.cart && body.cart.some(
      (i) => (i.product._id || i.product).toString() === product._id.toString()
    );
    assert(
      res.status === 200 && !itemExists,
      `DELETE /cart/:productId removes product from cart (cart length: ${body.cart?.length})`
    );
  }

  // Test 11: DELETE item not in cart returns 404
  {
    const res = await fetch(`${baseUrl}/cart/${product._id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    const body = await res.json();
    assert(
      res.status === 404 && body.success === false,
      `DELETE item not in cart returns 404 (got ${res.status})`
    );
  }

  // Test 12: Cookie-based auth verification
  {
    const res = await fetch(`${baseUrl}/cart`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    const body = await res.json();
    assert(res.status === 200 && body.success === true, `Cookie-based authentication succeeds on /cart`);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);

  server.close();
  await mongoose.disconnect();
  await mongod.stop();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCartTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
