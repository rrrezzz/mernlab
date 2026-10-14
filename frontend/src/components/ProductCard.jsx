import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { addToWishlist, removeFromWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, initialInWishlist = false, onWishlistToggle }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, actionLoadingId } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cartError, setCartError] = useState(null);

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

  const cartItemEntry = (cartItems || []).find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const isAddingToCart = actionLoadingId === product._id;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAddingToCart || isOutOfStock) return;
    setCartError(null);
    try {
      await addToCart(product._id);
    } catch (err) {
      setCartError(err.message);
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

        {cartError && (
          <p className="pcard-error-notice" role="alert">
            {cartError}
          </p>
        )}

        {/* Action Button Row: View Details & Wishlist */}
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
              ? "♥ In Wishlist"
              : "♡ Wishlist"}
          </button>
        </div>

        {/* Add to Cart Primary Button */}
        <button
          id={`add-to-cart-btn-${product._id}`}
          data-testid="add-to-cart-btn"
          className={`pcard-btn pcard-btn-cart ${
            cartItemEntry ? "pcard-btn-cart--incart" : ""
          }`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
        >
          <ShoppingBag size={14} style={{ marginRight: "0.35rem" }} />
          {isOutOfStock
            ? "Out of Stock"
            : isAddingToCart
            ? "Adding..."
            : cartItemEntry
            ? `Add Another (${cartItemEntry.quantity} in cart)`
            : "Add to Cart"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
