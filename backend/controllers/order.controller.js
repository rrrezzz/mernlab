const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const getRazorpay = require("../config/razorpay");

const PHONE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    return "Shipping address is required";
  }

  const fullName = trimValue(shippingAddress.fullName);
  const phone = trimValue(shippingAddress.phone).replace(/\s+/g, "");
  const addressLine1 = trimValue(shippingAddress.addressLine1);
  const city = trimValue(shippingAddress.city);
  const state = trimValue(shippingAddress.state);
  const pincode = trimValue(shippingAddress.pincode);

  if (!fullName) return "Full name is required";
  if (!phone) return "Phone number is required";
  if (!PHONE_PATTERN.test(phone)) return "Phone should contain a valid 10-digit number";
  if (!addressLine1) return "Address is required";
  if (!city) return "City is required";
  if (!state) return "State is required";
  if (!pincode) return "Pincode is required";
  if (!PINCODE_PATTERN.test(pincode)) return "Pincode must contain 6 digits.";

  return null;
};

const normalizeShippingAddress = (shippingAddress) => ({
  fullName: trimValue(shippingAddress.fullName),
  phone: trimValue(shippingAddress.phone).replace(/\s+/g, ""),
  addressLine1: trimValue(shippingAddress.addressLine1),
  city: trimValue(shippingAddress.city),
  state: trimValue(shippingAddress.state),
  pincode: trimValue(shippingAddress.pincode),
});

const buildOrderFromCart = async (user) => {
  const cart = user.cart || [];

  if (cart.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const items = [];
  let totalAmount = 0;

  for (const cartItem of cart) {
    const productId = cartItem.product?._id || cartItem.product;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Cart contains an invalid product");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("One or more products are no longer available");
      error.statusCode = 400;
      throw error;
    }

    if (product.stock < cartItem.quantity) {
      const error = new Error(`Insufficient stock for ${product.name}.`);
      error.statusCode = 400;
      throw error;
    }

    const lineTotal = product.price * cartItem.quantity;
    totalAmount += lineTotal;

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.image,
    });
  }

  return { items, totalAmount };
};

// POST /orders/create-payment-order
const createPaymentOrder = async (req, res) => {
  try {
    const shippingError = validateShippingAddress(req.body.shippingAddress);
    if (shippingError) {
      return res.status(400).json({
        success: false,
        message: shippingError,
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay Test Mode keys are not configured on the server",
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { items, totalAmount } = await buildOrderFromCart(user);

    const shopKartOrder = await Order.create({
      user: user._id,
      items,
      shippingAddress: normalizeShippingAddress(req.body.shippingAddress),
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    try {
      const razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });

      shopKartOrder.razorpayOrderId = razorpayOrder.id;
      await shopKartOrder.save();

      return res.status(201).json({
        success: true,
        shopKartOrderId: shopKartOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (razorpayError) {
      console.error("Razorpay order creation failed:", razorpayError);
      await Order.findByIdAndDelete(shopKartOrder._id);
      return res.status(500).json({
        success: false,
        message: razorpayError?.error?.description || "Unable to create Razorpay order",
      });
    }
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
    const signatureMatches =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureMatches) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Claim the pending order atomically. If the payment callback is retried or
    // delivered twice, only the first request can confirm it and reduce stock.
    const confirmedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        paymentStatus: "PENDING",
        status: "PENDING_PAYMENT",
      },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PLACED",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    if (!confirmedOrder) {
      const currentOrder = await Order.findById(order._id);
      if (currentOrder?.paymentStatus === "PAID") {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          order: currentOrder,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Order status changed before payment could be verified",
      });
    }

    const user = await Customer.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    for (const item of confirmedOrder.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      order: confirmedOrder,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};
