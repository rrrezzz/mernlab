import React, { useEffect, useState, useCallback } from "react";
import { Package } from "lucide-react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter / sort state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="products-page">
      {/* Page header */}
      <section className="products-hero">
        <div className="products-hero-inner">
          <span className="welcome-eyebrow">Catalogue</span>
          <h1 className="products-hero-title">The Collection</h1>
          <p className="products-hero-sub">
            Discover products curated for every taste and need.
          </p>
        </div>
      </section>

      <div className="products-content">
        {/* Search & Filter controls */}
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {/* Result count when not loading */}
        {!loading && !error && (
          <p className="products-count">
            {products.length === 0
              ? "No results"
              : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div className="catalog-state-box" id="loading-state" data-testid="loading-state">
            <div className="pulse-spinner" />
            <p className="catalog-state-text">Loading products...</p>
          </div>
        )}

        {/* ── Error State ── */}
        {!loading && error && (
          <div className="catalog-state-box" id="error-state" data-testid="error-state">
            <div className="catalog-state-icon catalog-state-icon--error">!</div>
            <p className="catalog-state-text">{error}</p>
            <button className="catalog-retry-btn" onClick={fetchProducts}>
              Try again
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && products.length === 0 && (
          <div className="catalog-state-box" id="empty-state" data-testid="empty-state">
            <Package size={36} className="catalog-empty-icon" />
            <p className="catalog-state-text">No products found.</p>
            <p className="catalog-state-sub">Try a different search or category.</p>
          </div>
        )}

        {/* ── Product Grid ── */}
        {!loading && !error && products.length > 0 && (
          <div className="pcard-grid" id="products-grid" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
