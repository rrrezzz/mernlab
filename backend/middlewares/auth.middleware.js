const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read the token from cookie or Authorization: Bearer <token>
    let token = req.cookies ? req.cookies.token : null;
    if (!token && req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. No token → not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 3. Verify the signature using our JWT_SECRET
    const secret = process.env.JWT_SECRET || "shopkart_default_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    // 4. Fetch the customer from DB (minus the password field)
    const userId = decoded.customerId || decoded.id || decoded.userId || decoded._id;
    const customer = await Customer.findById(userId).select("-password");

    // 5. Customer deleted after token was issued?
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 6. Attach to req so the next handler can use it without another DB call
    req.user = customer;
    req.customer = customer;

    // 7. Hand off to the actual route handler
    next();
  } catch (error) {
    // Catches jwt.verify() failures (expired, invalid signature, etc.)
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = authMiddleware;
