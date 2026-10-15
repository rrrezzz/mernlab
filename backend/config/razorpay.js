const Razorpay = require("razorpay");

let razorpayInstance = null;

const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error("Razorpay Test Mode keys are not configured on the server");
    error.statusCode = 500;
    throw error;
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};

module.exports = getRazorpay;
