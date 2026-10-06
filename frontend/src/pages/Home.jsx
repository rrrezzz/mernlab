import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Package, ShoppingBag } from "lucide-react";
import { getMyProfile, logoutCustomer } from "../services/api";

// Curated catalog objects — editorial product listing feel
const CATALOG = [
  {
    id: 1,
    category: "Horological Objects",
    name: "Tourbillon Skeleton",
    price: "9 400",
    status: "Made to order",
  },
  {
    id: 2,
    category: "Writing Instruments",
    name: "Grand Meisterstück Noir",
    price: "1 250",
    status: "Limited edition",
  },
  {
    id: 3,
    category: "Travel Edit",
    name: "Cuir de Russie Holdall",
    price: "3 800",
    status: "In stock",
  },
  {
    id: 4,
    category: "Atelier Editions",
    name: "Obsidian Marble Objet",
    price: "2 100",
    status: "Reserved",
  },
];

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        if (mounted) {
          setUser(data);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          navigate("/login", { replace: true });
        }
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [navigate, setUser]);

  const handleLogout = async () => {
    try { await logoutCustomer(); } catch { /* continue */ }
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="home-loading-screen">
        <div className="loader-box">
          <div className="pulse-spinner" />
          <h3>One moment</h3>
          <p>Preparing your atelier</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "G";

  return (
    <>
      {/* Welcome strip */}
      <section className="welcome-strip">
        <div className="welcome-strip-inner">
          <span className="welcome-eyebrow">Your Atelier</span>
          <h1 className="welcome-headline">
            Good to have you,{" "}
            <span className="welcome-name">{user.fullName?.split(" ")[0] || "Guest"}</span>.
          </h1>
        </div>
        <div className="welcome-strip-actions" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/products" className="btn-browse-catalogue">
            <ShoppingBag size={13} />
            Browse Catalogue
          </Link>
          <button id="home-logout-button" onClick={handleLogout} className="btn-ghost">
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </section>

      <hr className="gold-rule" />

      {/* Dashboard content */}
      <div className="dashboard-wrapper">

        {/* Left: Profile card */}
        <aside className="profile-column">
          <div className="profile-monogram-block">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-full-name" id="profile-name">{user.fullName}</div>
            <span className="profile-member-tag">Member</span>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-key">Email</span>
              <span className="detail-val" id="profile-email">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Phone</span>
              <span className="detail-val" id="profile-phone">{user.phone}</span>
            </div>
            {user._id && (
              <div className="detail-row">
                <span className="detail-key">Account ref.</span>
                <span className="detail-val-mono" id="profile-id">{user._id}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right: Stats + Catalog */}
        <div className="main-column">

          {/* Stats */}
          <div className="stats-strip">
            <div className="stat-item">
              <span className="stat-num">4</span>
              <span className="stat-label">Active orders</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">12</span>
              <span className="stat-label">Saved objects</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">3</span>
              <span className="stat-label">Appointments</span>
            </div>
          </div>

          {/* Catalog */}
          <div className="catalog-section">
            <div className="catalog-header">
              <div>
                <div className="catalog-heading">A considered selection.</div>
                <div className="catalog-sub">Curated for you</div>
              </div>
              <span className="catalog-label">Atelier Access</span>
            </div>

            <div className="product-grid">
              {CATALOG.map((item) => (
                <div key={item.id} className="product-card">
                  <div className="product-cat">
                    <span>{item.category}</span>
                    <span className="product-dot" />
                  </div>
                  <div className="product-name">{item.name}</div>
                  <div className="product-footer">
                    <span className="product-price">£ {item.price}</span>
                    <span className="product-status">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;
