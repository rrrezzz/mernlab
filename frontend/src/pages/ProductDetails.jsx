import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { getProductById } from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        if (mounted) setProduct(data.product || data);
      } catch (err) {
        if (mounted) {
          const status = err?.response?.status;
          if (status === 404) {
            setError("Product not found.");
          } else if (status === 400) {
            setError("Invalid product ID.");
          } else {
            setError("Something went wrong while loading the product.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { mounted = false; };
  }, [id]);

  const formattedPrice = product
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(product.price)
    : "";

  const stockLabel =
    product?.stock === 0
      ? "Out of stock"
      : product?.stock === 1
      ? "1 unit left"
      : `${product?.stock} units left`;

  const isOutOfStock = product?.stock === 0;

  return (
    <div className="details-page">
      {/* Back button */}
      <div className="details-back-bar">
        <button
          id="back-to-products"
          className="details-back-btn"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={14} />
          <span>Back to catalogue</span>
        </button>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="catalog-state-box" id="product-loading-state" data-testid="product-loading-state">
          <div className="pulse-spinner" />
          <p className="catalog-state-text">Loading product...</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="catalog-state-box" id="product-error-state" data-testid="product-error-state">
          <div className="catalog-state-icon catalog-state-icon--error">!</div>
          <p className="catalog-state-text">{error}</p>
          <button className="catalog-retry-btn" onClick={() => navigate("/products")}>
            Return to catalogue
          </button>
        </div>
      )}

      {/* ── Product Detail ── */}
      {!loading && !error && product && (
        <div className="details-wrapper">
          {/* Left: Image */}
          <div className="details-image-col">
            <div className="details-image-frame">
              <img
                src={product.image}
                alt={product.name}
                className="details-image"
                id="product-detail-image"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                }}
              />
            </div>
            <span className="details-category-pill">{product.category}</span>
          </div>

          {/* Right: Info */}
          <div className="details-info-col">
            <span className="welcome-eyebrow">Product Details</span>
            <h1 className="details-name" id="product-detail-name">{product.name}</h1>
            <p className="details-description" id="product-detail-description">{product.description}</p>

            <div className="details-meta-grid">
              <div className="details-meta-item">
                <span className="detail-key">Price</span>
                <span className="details-price" id="product-detail-price">{formattedPrice}</span>
              </div>
              <div className="details-meta-item">
                <span className="detail-key">Category</span>
                <span className="detail-val" id="product-detail-category">{product.category}</span>
              </div>
              <div className="details-meta-item">
                <span className="detail-key">Availability</span>
                <span
                  className={`detail-val ${
                    isOutOfStock
                      ? "pcard-stock--empty"
                      : product.stock <= 5
                      ? "pcard-stock--low"
                      : "pcard-stock--ok"
                  }`}
                  id="product-detail-stock"
                >
                  {stockLabel}
                </span>
              </div>
              <div className="details-meta-item">
                <span className="detail-key">Product ID</span>
                <span className="detail-val-mono">{product._id}</span>
              </div>
            </div>

            {/* Add to Cart — UI only for this lab */}
            <button
              id="add-to-cart-btn"
              data-testid="add-to-cart-btn"
              className={`details-cart-btn ${isOutOfStock ? "details-cart-btn--disabled" : ""}`}
              disabled={isOutOfStock}
              onClick={() => alert("Cart functionality coming in Lab 04!")}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
            {isOutOfStock && (
              <p className="details-oos-note">
                This item is currently unavailable. Check back soon.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
