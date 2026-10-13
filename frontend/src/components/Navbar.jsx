import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LayoutGrid, Heart, Home as HomeIcon } from "lucide-react";
import { logoutCustomer } from "../services/api";

const Navbar = ({ user, setUser, wishlistCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (setUser) setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">

        {/* Wordmark */}
        <Link to={user ? "/home" : "/login"} className="brand-logo">
          <div className="brand-emblem">
            <span className="brand-emblem-letter">S</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">ShopKart</span>
            <span className="brand-sub">Atelier</span>
          </div>
        </Link>

        {/* Right controls */}
        <nav className="navbar-actions">
          {/* Home link */}
          <Link to="/home" className="nav-link nav-link-home" id="nav-home-link">
            <HomeIcon size={13} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
            Home
          </Link>

          {/* Products link */}
          <Link to="/products" className="nav-link nav-link-catalogue" id="nav-products-link">
            <LayoutGrid size={13} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
            Products
          </Link>

          {/* Wishlist link — with dynamic backend count */}
          <Link to="/wishlist" className="nav-link nav-link-wishlist" id="nav-wishlist-link">
            <Heart size={13} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
            Wishlist {user && typeof wishlistCount === "number" ? `(${wishlistCount})` : ""}
          </Link>

          {user ? (
            <div className="user-controls">
              <div className="user-signature">
                <div className="user-monogram">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "G"}
                </div>
                <div className="user-meta">
                  <span className="user-name-nav">{user.fullName}</span>
                  <span className="user-label">Member</span>
                </div>
              </div>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="btn-logout"
              >
                <LogOut size={13} />
                <span>Leave</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Sign in</Link>
              <Link to="/register" className="btn-nav-primary">Create account</Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;

