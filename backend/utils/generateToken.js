const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
  return jwt.sign(
    { customerId },
    process.env.JWT_SECRET || "shopkart_default_jwt_secret_key_2026",
    { expiresIn: "1d" }
  );
};

module.exports = generateToken;
