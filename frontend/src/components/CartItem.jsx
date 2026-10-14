import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, actionLoadingId } = useCart();
  const [localError, setLocalError] = useState(null);

  const product = item.product || {};
  const productId = product._id || item.product;
  const quantity = item.quantity || 1;
  const stock = product.stock ?? 99;
  const isBusy = actionLoadingId === productId;

  const formattedUnitPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price || 0);

  const formattedLineTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((product.price || 0) * quantity);

  const handleDecrease = async () => {
    if (quantity <= 1 || isBusy) return;
    setLocalError(null);
    try {
      await updateQuantity(productId, quantity - 1);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= stock || isBusy) return;
    setLocalError(null);
    try {
      await updateQuantity(productId, quantity + 1);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleRemove = async () => {
    if (isBusy) return;
    setLocalError(null);
    try {
      await removeFromCart(productId);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <article
      className="cart-item"
      data-testid={`cart-item-${productId}`}
      id={`cart-item-${productId}`}
    >
      {/* Product Image */}
      <div className="cart-item-image-wrap">
        <Link to={`/products/${productId}`}>
          <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
            loading="lazy"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
            }}
          />
        </Link>
      </div>

      {/* Item Details */}
      <div className="cart-item-details">
        <div className="cart-item-header">
          <div className="cart-item-meta">
            <span className="cart-item-category">{product.category}</span>
            <h3 className="cart-item-name">
              <Link to={`/products/${productId}`}>{product.name}</Link>
            </h3>
            <span className="cart-item-unit-price">
              {formattedUnitPrice} each
            </span>
          </div>

          <div className="cart-item-line-total">
            <span className="cart-item-price-label">Total</span>
            <span className="cart-item-price-val">{formattedLineTotal}</span>
          </div>
        </div>

        {/* Stock note */}
        <div className="cart-item-stock-bar">
          <span
            className={`cart-stock-badge ${
              stock <= 3 ? "cart-stock-badge--low" : "cart-stock-badge--ok"
            }`}
          >
            {stock <= 5 ? `Only ${stock} left in stock` : `${stock} available`}
          </span>
          {quantity >= stock && (
            <span className="cart-stock-limit-note">Max stock reached</span>
          )}
        </div>

        {localError && (
          <div className="cart-item-error" role="alert">
            <AlertCircle size={13} style={{ marginRight: "0.3rem" }} />
            {localError}
          </div>
        )}

        {/* Controls: Stepper & Remove */}
        <div className="cart-item-actions">
          <div className="cart-stepper" aria-label="Quantity controls">
            <button
              type="button"
              id={`decrease-qty-${productId}`}
              data-testid={`decrease-qty-${productId}`}
              className="cart-stepper-btn"
              onClick={handleDecrease}
              disabled={quantity <= 1 || isBusy}
              aria-label="Decrease quantity"
              title={quantity <= 1 ? "Minimum quantity is 1 (use Remove to delete)" : "Decrease quantity"}
            >
              <Minus size={13} />
            </button>

            <span
              id={`cart-qty-${productId}`}
              data-testid={`cart-qty-${productId}`}
              className="cart-stepper-qty"
            >
              {quantity}
            </span>

            <button
              type="button"
              id={`increase-qty-${productId}`}
              data-testid={`increase-qty-${productId}`}
              className="cart-stepper-btn"
              onClick={handleIncrease}
              disabled={quantity >= stock || isBusy}
              aria-label="Increase quantity"
              title={quantity >= stock ? "Maximum stock limit reached" : "Increase quantity"}
            >
              <Plus size={13} />
            </button>
          </div>

          <button
            type="button"
            id={`remove-cart-item-${productId}`}
            data-testid={`remove-cart-item-${productId}`}
            className="cart-remove-btn"
            onClick={handleRemove}
            disabled={isBusy}
          >
            <Trash2 size={13} style={{ marginRight: "0.35rem" }} />
            {isBusy ? "Updating..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
