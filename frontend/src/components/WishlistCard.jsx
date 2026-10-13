import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ExternalLink } from "lucide-react";
import { removeFromWishlist } from "../services/api";

const WishlistCard = ({ product, onRemove }) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock === 1
      ? "1 unit left"
      : `${product.stock} units left`;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleRemove = async (e) => {
    e.stopPropagation();
    setIsRemoving(true);
    setRemoveError(null);

    try {
      await removeFromWishlist(product._id);
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (err) {
      console.error("Failed to remove product from wishlist:", err);
      setRemoveError(
        err?.response?.data?.message || "Failed to remove item. Please try again."
      );
      setIsRemoving(false);
    }
  };

  return (
    <article
      className="pcard wishlist-card"
      data-testid={`wishlist-card-${product._id}`}
      id={`wishlist-card-${product._id}`}
    >
      {/* Product Image */}
      <div className="pcard-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="pcard-image"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";
          }}
        />
        <span className="pcard-category-badge">{product.category}</span>
        {isOutOfStock && <span className="pcard-out-badge">Out of stock</span>}
      </div>

      {/* Card Content */}
      <div className="pcard-body">
        <h3 className="pcard-name" title={product.name}>
          {product.name}
        </h3>

        <div className="pcard-footer">
          <span className="pcard-price">{formattedPrice}</span>
          <span
            className={`pcard-stock ${
              isOutOfStock
                ? "pcard-stock--empty"
                : isLowStock
                ? "pcard-stock--low"
                : "pcard-stock--ok"
            }`}
          >
            {stockLabel}
          </span>
        </div>

        {removeError && (
          <p className="wishlist-card-error" role="alert">
            {removeError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="wishlist-card-actions">
          <button
            id={`view-details-${product._id}`}
            data-testid={`view-details-${product._id}`}
            className="pcard-btn wishlist-btn-view"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            <ExternalLink size={13} style={{ marginRight: "0.3rem" }} />
            View Details
          </button>

          <button
            id={`remove-wishlist-${product._id}`}
            data-testid={`remove-wishlist-${product._id}`}
            className="pcard-btn wishlist-btn-remove"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <Trash2 size={13} style={{ marginRight: "0.3rem" }} />
            {isRemoving ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
