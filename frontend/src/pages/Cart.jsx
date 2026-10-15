import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = ({ user }) => {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalItems, subtotal, refreshCart } = useCart();

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotal);

  // If user is not logged in
  if (!user && !loading) {
    return (
      <div className="cart-page" data-testid="cart-page">
        <section className="cart-hero">
          <div className="cart-hero-inner">
            <span className="welcome-eyebrow">Shopping Cart</span>
            <h1 className="cart-hero-title">My Cart</h1>
          </div>
        </section>

        <div className="cart-content">
          <div className="catalog-state-box" id="cart-auth-state">
            <div className="catalog-state-icon">🔒</div>
            <h2 className="catalog-state-text">Sign In Required</h2>
            <p className="catalog-state-sub">
              Please sign in to access your persistent shopping cart.
            </p>
            <button
              id="cart-signin-btn"
              className="btn-gold-primary"
              onClick={() => navigate("/login")}
              style={{ marginTop: "1rem" }}
            >
              Sign In to ShopKart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" data-testid="cart-page">
      {/* Hero Header */}
      <section className="cart-hero">
        <div className="cart-hero-inner">
          <span className="welcome-eyebrow">Your Selection</span>
          <h1 className="cart-hero-title">My Cart</h1>
          {!loading && !error && (
            <p className="cart-hero-sub" id="cart-count-label">
              {totalItems === 1
                ? "1 unit selected"
                : `${totalItems} units selected across ${cartItems.length} product${cartItems.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </section>

      <div className="cart-content">
        {/* ── Loading State ── */}
        {loading && (
          <div
            className="catalog-state-box"
            id="cart-loading-state"
            data-testid="cart-loading-state"
          >
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading your cart...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div
            className="catalog-state-box"
            id="cart-error-state"
            data-testid="cart-error-state"
          >
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">Something went wrong.</p>
            <p className="catalog-state-sub">{error}</p>
            <button
              id="cart-retry-btn"
              data-testid="cart-retry-btn"
              className="catalog-retry-btn"
              onClick={refreshCart}
            >
              <RefreshCw size={13} style={{ marginRight: "0.4rem" }} />
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && cartItems.length === 0 && (
          <div
            className="catalog-state-box cart-empty-box"
            id="cart-empty-state"
            data-testid="cart-empty-state"
          >
            <div className="cart-empty-icon-wrap">
              <span className="cart-empty-symbol" role="img" aria-label="Cart">
                🛒
              </span>
            </div>
            <h2 className="catalog-state-text">Your cart is empty</h2>
            <p className="catalog-state-sub">
              Looks like you haven't added anything yet. Discover pieces designed to last.
            </p>
            <button
              id="browse-products-btn"
              data-testid="browse-products-btn"
              className="btn-gold-primary cart-browse-btn"
              onClick={() => navigate("/products")}
            >
              <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
              Browse Products
            </button>
          </div>
        )}

        {/* ── Populated Cart Layout ── */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-grid-layout">
            {/* Left: Items List */}
            <div className="cart-items-column" id="cart-items-list">
              <div className="cart-items-header">
                <span>Product Item</span>
                <span>Subtotal</span>
              </div>

              <div className="cart-items-flow">
                {cartItems.map((item) => (
                  <CartItem
                    key={(item.product?._id || item.product).toString()}
                    item={item}
                  />
                ))}
              </div>

              <div className="cart-continue-wrap">
                <Link to="/products" className="cart-continue-link">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="cart-summary-column">
              <div className="cart-summary-card" data-testid="order-summary">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span className="summary-label">Total Items</span>
                    <span className="summary-value" id="summary-total-items">
                      {totalItems} {totalItems === 1 ? "unit" : "units"}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-value" id="summary-subtotal">
                      {formattedSubtotal}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Estimated Delivery</span>
                    <span className="summary-value summary-value--free">
                      COMPLIMENTARY
                    </span>
                  </div>
                </div>

                <div className="summary-divider" />

                <div className="summary-total-row">
                  <span className="summary-total-label">Total</span>
                  <span className="summary-total-value" id="summary-grand-total">
                    {formattedSubtotal}
                  </span>
                </div>

                <p className="summary-taxes-note">
                  Inclusive of all luxury taxes & duty
                </p>

                <button
                  id="checkout-button"
                  data-testid="checkout-button"
                  className="btn-gold-primary summary-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight size={14} style={{ marginLeft: "0.5rem" }} />
                </button>

                <div className="summary-trust-badges">
                  <div className="trust-badge">
                    <ShieldCheck size={14} className="trust-icon" />
                    <span>Secure Encrypted Transaction</span>
                  </div>
                  <div className="trust-badge">
                    <Truck size={14} className="trust-icon" />
                    <span>Insured Express Shipping</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
