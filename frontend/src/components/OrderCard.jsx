import React from "react";
import { useNavigate } from "react-router-dom";

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const statusClass = `order-status order-status--${(order.status || "").toLowerCase()}`;

  return (
    <article className="order-card" data-testid="order-card">
      <div className="order-card-header">
        <div>
          <h3 className="order-card-title">Order #{order._id}</h3>
          <p className="order-card-date">{formatDate(order.createdAt)}</p>
        </div>
        <span className={statusClass}>{order.status}</span>
      </div>

      <ul className="order-card-items">
        {(order.items || []).map((item) => (
          <li key={`${order._id}-${item.product}-${item.name}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <div className="order-card-footer">
        <span className="order-card-total">Total: {formatINR(order.totalAmount)}</span>
        <div className="order-card-actions">
          <button
            type="button"
            className="btn-gold-primary order-details-btn"
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default OrderCard;
