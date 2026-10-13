import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { addToWishlist, removeFromWishlist } from "../services/api";

const ProductCard = ({ product, initialInWishlist = false, onWishlistToggle }) => {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setIsInWishlist(initialInWishlist);
  }, [initialInWishlist]);

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

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    // Prevent duplicate clicks while request is in flight
    if (isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist(product._id);
        setIsInWishlist(false);
        if (onWishlistToggle) {
          onWishlistToggle(product._id, false);
        }
      } else {
        // Add to wishlist
        await addToWishlist(product._id);
        setIsInWishlist(true);
        if (onWishlistToggle) {
          onWishlistToggle(product._id, true);
        }
      }
    } catch (err) {
      console.error("Wishlist action error:", err);
      const status = err?.response?.status;
      if (status === 409) {
        // Already in wishlist
        setIsInWishlist(true);
      } else if (status === 401) {
        setErrorMsg("Please sign in to save products.");
      } else {
        setErrorMsg(
          err?.response?.data?.message || "Unable to save product. Please try again."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="pcard product-card" data-testid="product-card">
      {/* Image with overlay tags and heart icon */}
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

        {/* Top-right floating Wishlist heart button */}
        <button
          type="button"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`pcard-heart-floating ${
            isInWishlist ? "pcard-heart-floating--active" : ""
          } ${isSaving ? "pcard-heart-floating--loading" : ""}`}
          onClick={handleWishlistClick}
          disabled={isSaving}
          title={isInWishlist ? "In your Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={18}
            className={`heart-icon ${isInWishlist ? "heart-filled" : ""}`}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>

        <span className="pcard-category-badge">{product.category}</span>
        {isOutOfStock && <span className="pcard-out-badge">Out of stock</span>}
      </div>

      {/* Body */}
      <div className="pcard-body">
        <h3 className="pcard-name">{product.name}</h3>

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

        {errorMsg && (
          <p className="pcard-error-notice" role="alert">
            {errorMsg}
          </p>
        )}

        {/* Action Button Row */}
        <div className="pcard-actions-row">
          <button
            id={`view-product-${product._id}`}
            data-testid={`view-product-${product._id}`}
            className="pcard-btn view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>

          <button
            id={`wishlist-btn-${product._id}`}
            data-testid={`wishlist-btn-${product._id}`}
            className={`pcard-btn pcard-btn-wishlist ${
              isInWishlist ? "pcard-btn-wishlist--saved" : ""
            }`}
            onClick={handleWishlistClick}
            disabled={isSaving}
          >
            {isSaving
              ? "⏳ Saving..."
              : isInWishlist
              ? "♥ Added to Wishlist"
              : "♡ Add to Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
