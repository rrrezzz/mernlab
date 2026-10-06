import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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

  return (
    <article className="pcard product-card" data-testid="product-card">
      {/* Image */}
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

        <button
          id={`view-product-${product._id}`}
          className="pcard-btn view-details-btn"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
