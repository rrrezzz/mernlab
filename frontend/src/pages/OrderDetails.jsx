import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { getOrderById } from "../services/api";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderDetails = ({ user, successView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, user]);

  if (!user && !loading) {
    return (
      <div className="cart-page">
        <div className="cart-content">
          <div className="catalog-state-box">
            <div className="catalog-state-icon">🔒</div>
            <h2 className="catalog-state-text">Sign In Required</h2>
            <button className="btn-gold-primary" onClick={() => navigate("/login")} style={{ marginTop: "1rem" }}>
              Sign In to ShopKart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page order-details-page" data-testid="order-details-page">
      <section className="cart-hero">
        <div className="cart-hero-inner">
          <span className="welcome-eyebrow">{successView ? "Confirmation" : "Order"}</span>
          <h1 className="cart-hero-title">{successView ? "Order Placed Successfully" : "Order Details"}</h1>
        </div>
      </section>

      <div className="cart-content">
        {loading && (
          <div className="catalog-state-box">
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading order...</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-state-box">
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">Something went wrong.</p>
            <p className="catalog-state-sub">{error}</p>
            <button className="catalog-retry-btn" onClick={() => window.location.reload()}>
              <RefreshCw size={13} style={{ marginRight: "0.4rem" }} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-confirmation-card">
            {successView && <p className="order-success-mark">✅ Order Placed Successfully</p>}

            <p className="order-meta-line">
              <strong>Order ID:</strong> {order._id}
            </p>
            <p className="order-meta-line">
              <strong>Total:</strong> {formatINR(order.totalAmount)}
            </p>
            <p className="order-meta-line">
              <strong>Status:</strong> {order.status}
            </p>
            <p className="order-meta-line">
              <strong>Payment:</strong> {order.paymentStatus}
            </p>

            {successView && (
              <p className="catalog-state-sub" style={{ margin: "1rem 0 1.5rem" }}>
                Your order has been saved successfully.
              </p>
            )}

            <ul className="order-card-items">
              {(order.items || []).map((item) => (
                <li key={`${item.product}-${item.name}`}>
                  {item.name} × {item.quantity} — {formatINR(item.price * item.quantity)}
                </li>
              ))}
            </ul>

            {order.shippingAddress && (
              <div className="order-shipping-block">
                <h3>Shipping To</h3>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            )}

            <div className="order-card-actions" style={{ marginTop: "1.75rem" }}>
              <Link to="/orders" className="btn-gold-primary order-details-btn">
                View My Orders
              </Link>
              <Link to="/products" className="order-secondary-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
