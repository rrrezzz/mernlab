import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderSummary = ({ items, total, onPlaceOrder, placing, submitLabel = "Place Order" }) => {
  return (
    <aside className="cart-summary-column">
      <div className="cart-summary-card" data-testid="checkout-order-summary">
        <h2 className="summary-title">Order Summary</h2>

        <div className="checkout-summary-items">
          {items.map((item) => {
            const product = item.product || item;
            const name = product.name || item.name;
            const price = product.price || item.price || 0;
            const quantity = item.quantity || 0;
            const key = (product._id || item.product || name).toString();

            return (
              <div className="summary-row checkout-summary-line" key={key}>
                <span className="summary-label">
                  {name} × {quantity}
                </span>
                <span className="summary-value">{formatINR(price * quantity)}</span>
              </div>
            );
          })}
        </div>

        <div className="summary-divider" />

        <div className="summary-total-row">
          <span className="summary-total-label">Total</span>
          <span className="summary-total-value">{formatINR(total)}</span>
        </div>

        <button
          id="place-order-button"
          data-testid="place-order-button"
          className="btn-gold-primary summary-checkout-btn"
          onClick={onPlaceOrder}
          disabled={placing}
          type="button"
        >
          {placing ? "Processing..." : submitLabel}
          {!placing && <ArrowRight size={14} style={{ marginLeft: "0.5rem" }} />}
        </button>

        <div className="summary-trust-badges">
          <div className="trust-badge">
            <ShieldCheck size={14} className="trust-icon" />
            <span>Pay securely with Razorpay Test Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderSummary;
