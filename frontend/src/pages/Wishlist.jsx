import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import WishlistCard from "../components/WishlistCard";
import { getWishlist } from "../services/api";

const Wishlist = ({ _user, onWishlistChange }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      const wishlistItems = data.wishlist || [];
      setItems(wishlistItems);
      if (onWishlistChange) {
        onWishlistChange(wishlistItems.length);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setError("Please sign in to view your wishlist.");
      } else {
        setError("Something went wrong. We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  }, [onWishlistChange]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleItemRemoved = (removedId) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => item._id !== removedId);
      if (onWishlistChange) {
        onWishlistChange(updated.length);
      }
      return updated;
    });
  };

  return (
    <div className="wishlist-page" data-testid="wishlist-page">
      {/* Hero Header */}
      <section className="wishlist-hero">
        <div className="wishlist-hero-inner">
          <span className="welcome-eyebrow">Personal Curation</span>
          <h1 className="wishlist-hero-title">My Wishlist</h1>
          {!loading && !error && (
            <p className="wishlist-hero-sub" id="wishlist-count-label">
              {items.length === 1
                ? "1 product saved"
                : `${items.length} products saved`}
            </p>
          )}
        </div>
      </section>

      <div className="wishlist-content">
        {/* ── Loading State ── */}
        {loading && (
          <div
            className="catalog-state-box"
            id="wishlist-loading-state"
            data-testid="wishlist-loading-state"
          >
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading your wishlist...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div
            className="catalog-state-box"
            id="wishlist-error-state"
            data-testid="wishlist-error-state"
          >
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">Something went wrong.</p>
            <p className="catalog-state-sub">{error}</p>
            {error.includes("sign in") ? (
              <button
                id="wishlist-login-btn"
                className="catalog-retry-btn"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            ) : (
              <button
                id="wishlist-retry-btn"
                data-testid="wishlist-retry-btn"
                className="catalog-retry-btn"
                onClick={fetchWishlist}
              >
                <RefreshCw size={13} style={{ marginRight: "0.4rem" }} />
                Try Again
              </button>
            )}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && items.length === 0 && (
          <div
            className="catalog-state-box wishlist-empty-box"
            id="wishlist-empty-state"
            data-testid="wishlist-empty-state"
          >
            <div className="wishlist-empty-icon-wrap">
              <span className="wishlist-heart-symbol" role="img" aria-label="Heart">
                ❤️
              </span>
            </div>
            <h2 className="catalog-state-text">Your wishlist is empty</h2>
            <p className="catalog-state-sub">
              Save products you love and find them here later.
            </p>
            <button
              id="browse-products-btn"
              data-testid="browse-products-btn"
              className="btn-gold-primary wishlist-browse-btn"
              onClick={() => navigate("/products")}
            >
              <ShoppingBag size={14} style={{ marginRight: "0.4rem" }} />
              Browse Products
            </button>
          </div>
        )}

        {/* ── Wishlist Grid ── */}
        {!loading && !error && items.length > 0 && (
          <>
            <div
              className="pcard-grid wishlist-grid"
              id="wishlist-grid"
              data-testid="wishlist-grid"
            >
              {items.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleItemRemoved}
                />
              ))}
            </div>

            <div className="wishlist-continue-bar">
              <button
                className="catalog-retry-btn"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
                <ArrowRight size={13} style={{ marginLeft: "0.4rem" }} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
