import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import { getMyProfile, getWishlist } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Restore authenticated customer profile on initial mount if cookie exists
  useEffect(() => {
    getMyProfile()
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Sync wishlist count from backend whenever user session changes
  useEffect(() => {
    if (user) {
      getWishlist()
        .then((data) => {
          const count = typeof data.count === "number" ? data.count : (data.wishlist || []).length;
          setWishlistCount(count);
        })
        .catch(() => setWishlistCount(0));
    } else {
      setWishlistCount(0);
    }
  }, [user]);

  return (
    <BrowserRouter>
      <CartProvider user={user}>
        <div className="app-layout">
          <Navbar user={user} setUser={setUser} wishlistCount={wishlistCount} />
          <main className="main-content">
            <Routes>
              {/* Route Summary as per Lab Specifications */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/home" element={<Home user={user} setUser={setUser} />} />

              {/* Product Catalogue Routes */}
              <Route
                path="/products"
                element={<Products user={user} onWishlistChange={setWishlistCount} />}
              />
              <Route
                path="/products/:id"
                element={<ProductDetails user={user} onWishlistChange={setWishlistCount} />}
              />

              {/* Wishlist Route */}
              <Route
                path="/wishlist"
                element={<Wishlist user={user} onWishlistChange={setWishlistCount} />}
              />

              {/* Shopping Cart Route (Lab 05) */}
              <Route
                path="/cart"
                element={<Cart user={user} />}
              />

              {/* Default Route redirects to /home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              {/* Catch-all unknown routes */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
