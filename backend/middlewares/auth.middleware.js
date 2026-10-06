const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read the token from the HttpOnly cookie
    const token = req.cookies.token;

    // 2. No cookie → not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 3. Verify the signature using our JWT_SECRET
    //    If the token was tampered with or has expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the customer from DB (minus the password field)
    const customer = await Customer.findById(decoded.customerId).select(
      "-password"
    );

    // 5. Customer deleted after token was issued?
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 6. Attach to req so the next handler can use it without another DB call
    req.user = customer;

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
