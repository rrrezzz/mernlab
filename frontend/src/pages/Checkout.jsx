import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import { createPaymentOrder, verifyPayment } from "../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, refreshCart, clearCart } = useCart();
  const [values, setValues] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!values.fullName.trim()) errors.fullName = "Full name is required";
    if (!values.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(values.phone.trim().replace(/\s+/g, ""))) {
      errors.phone = "Phone should contain a valid 10-digit number";
    }
    if (!values.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!values.city.trim()) errors.city = "City is required";
    if (!values.state.trim()) errors.state = "State is required";
    if (!values.pincode.trim()) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(values.pincode.trim())) {
      errors.pincode = "Pincode must contain 6 digits.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openRazorpayCheckout = async (checkoutData, shippingAddress) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay Checkout. Please try again.");
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        fn(value);
      };

      const paymentObject = new window.Razorpay({
        key: checkoutData.key,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: checkoutData.razorpayOrderId,
        handler: async function (response) {
          try {
            const verified = await verifyPayment({
              shopKartOrderId: checkoutData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            finish(resolve, verified.order);
          } catch (err) {
            finish(
              reject,
              new Error(
                err?.response?.data?.message ||
                  "Payment verification failed. Your cart has not been cleared."
              )
            );
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: { color: "#B89A5A" },
        modal: {
          ondismiss: function () {
            finish(reject, new Error("Payment cancelled. Your cart has not been cleared."));
          },
        },
      });

      paymentObject.on("payment.failed", function () {
        finish(
          reject,
          new Error("Payment failed. Your cart has not been cleared. Please try again.")
        );
      });

      paymentObject.open();
    });
  };

  const handlePlaceOrder = async () => {
    setFormError("");
    if (!validate()) return;

    setPlacing(true);
    const shippingAddress = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim().replace(/\s+/g, ""),
      addressLine1: values.addressLine1.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
    };

    try {
      const checkoutData = await createPaymentOrder({ shippingAddress });
      const confirmedOrder = await openRazorpayCheckout(checkoutData, shippingAddress);
      clearCart();
      navigate(`/order-success/${confirmedOrder._id}`);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Unable to place order. Please try again.";
      setFormError(message);
    } finally {
      setPlacing(false);
    }
  };

  if (!user && !loading) {
    return (
      <div className="cart-page">
        <section className="cart-hero">
          <div className="cart-hero-inner">
            <span className="welcome-eyebrow">Checkout</span>
            <h1 className="cart-hero-title">Checkout</h1>
          </div>
        </section>
        <div className="cart-content">
          <div className="catalog-state-box">
            <div className="catalog-state-icon">🔒</div>
            <h2 className="catalog-state-text">Sign In Required</h2>
            <p className="catalog-state-sub">Please sign in to continue checkout.</p>
            <button className="btn-gold-primary" onClick={() => navigate("/login")} style={{ marginTop: "1rem" }}>
              Sign In to ShopKart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page checkout-page" data-testid="checkout-page">
      <section className="cart-hero">
        <div className="cart-hero-inner">
          <span className="welcome-eyebrow">Secure Checkout</span>
          <h1 className="cart-hero-title">Checkout</h1>
        </div>
      </section>

      <div className="cart-content">
        {loading && (
          <div className="catalog-state-box">
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading checkout...</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-state-box">
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">Something went wrong.</p>
            <p className="catalog-state-sub">{error}</p>
            <button className="catalog-retry-btn" onClick={refreshCart}>
              <RefreshCw size={13} style={{ marginRight: "0.4rem" }} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="catalog-state-box">
            <div className="catalog-state-icon">🛒</div>
            <h2 className="catalog-state-text">Your cart is empty</h2>
            <p className="catalog-state-sub">Add products before proceeding to checkout.</p>
            <button className="btn-gold-primary" onClick={() => navigate("/products")} style={{ marginTop: "1rem" }}>
              <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <>
            {formError && (
              <div className="alert-banner alert-error checkout-alert">
                <AlertCircle size={16} className="alert-icon" />
                <span>{formError}</span>
              </div>
            )}

            <div className="cart-grid-layout">
              <CheckoutForm
                values={values}
                errors={fieldErrors}
                onChange={handleChange}
                disabled={placing}
              />
              <OrderSummary
                items={cartItems}
                total={subtotal}
                onPlaceOrder={handlePlaceOrder}
                placing={placing}
                submitLabel="Pay with Razorpay"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
