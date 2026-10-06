import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutGrid } from "lucide-react";
import { logoutCustomer } from "../services/api";

const Navbar = ({ user, setUser }) => {
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
          {/* Catalogue link — always visible */}
          <Link to="/products" className="nav-link nav-link-catalogue">
            <LayoutGrid size={13} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
            Catalogue
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

