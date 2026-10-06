import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Books",
  "Home",
];

const SearchBar = ({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef(null);

  // Synchronize local input state if parent search state changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Clean up debounce timer on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceRef.current);
      onSearchChange(localSearch);
    }
  };

  const handleClear = () => {
    setLocalSearch("");
    clearTimeout(debounceRef.current);
    onSearchChange("");
  };

  return (
    <div className="search-bar-wrapper">
      {/* Search Input */}
      <div className="search-input-wrap">
        <Search size={15} className="search-icon" />
        <input
          id="product-search-input"
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={localSearch}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
        />
        {localSearch && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: "0 4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="search-select-wrap">
        <select
          id="product-category-filter"
          className="search-select"
          value={category}
          onChange={(e) =>
            onCategoryChange(e.target.value === "All Categories" ? "" : e.target.value)
          }
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat === "All Categories" ? "" : cat}>
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="select-chevron" />
      </div>

      {/* Sort Dropdown (Bonus Challenge) */}
      <div className="search-select-wrap">
        <select
          id="product-sort-filter"
          className="search-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <ChevronDown size={13} className="select-chevron" />
      </div>
    </div>
  );
};

export default SearchBar;
