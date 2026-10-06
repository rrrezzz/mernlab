import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import { getMyProfile } from "./services/api";

function App() {
  const [user, setUser] = useState(null);

  // Restore authenticated customer profile on initial mount if cookie exists
  useEffect(() => {
    getMyProfile()
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            {/* Route Summary as per Lab Specifications */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />

            {/* Product Catalogue Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Default Route redirects to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Catch-all unknown routes */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

