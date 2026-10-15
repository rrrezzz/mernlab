import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ShoppingBag } from "lucide-react";
import OrderCard from "../components/OrderCard";
import { getOrders } from "../services/api";

const Orders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="cart-page">
        <section className="cart-hero">
          <div className="cart-hero-inner">
            <span className="welcome-eyebrow">Order History</span>
            <h1 className="cart-hero-title">My Orders</h1>
          </div>
        </section>
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
    <div className="cart-page orders-page" data-testid="orders-page">
      <section className="cart-hero">
        <div className="cart-hero-inner">
          <span className="welcome-eyebrow">Order History</span>
          <h1 className="cart-hero-title">My Orders</h1>
        </div>
      </section>

      <div className="cart-content">
        {loading && (
          <div className="catalog-state-box" data-testid="orders-loading-state">
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-state-box" data-testid="orders-error-state">
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">Something went wrong.</p>
            <p className="catalog-state-sub">{error}</p>
            <button className="catalog-retry-btn" onClick={loadOrders}>
              <RefreshCw size={13} style={{ marginRight: "0.4rem" }} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="catalog-state-box" data-testid="orders-empty-state">
            <h2 className="catalog-state-text">You have not placed any orders yet.</h2>
            <p className="catalog-state-sub">Browse the catalogue and complete checkout to see orders here.</p>
            <button className="btn-gold-primary" onClick={() => navigate("/products")} style={{ marginTop: "1rem" }}>
              <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
