import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { categoryList } from "../config/categoryFlow";
import { media } from "../config/media";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { cartCount } = useCart();

  const closeAll = () => {
    setMobileOpen(false);
    setProductsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeAll}>
          {media.logoText}
          <span>DIRECT GRAIN MARKETPLACE</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>

        <nav className={`navbar-links ${mobileOpen ? "open" : ""}`}>
          <NavLink to="/" end className="nav-link" onClick={closeAll}>
            Home
          </NavLink>

          <div className={`nav-dropdown ${productsOpen ? "open" : ""}`}>
            <button
              className="nav-link"
              onClick={() => setProductsOpen((o) => !o)}
              style={{ background: "none", border: "none", color: "inherit" }}
            >
              Products {productsOpen ? "\u25B4" : "\u25BE"}
            </button>
            <div className="nav-dropdown-panel">
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="nav-dropdown-item"
                  onClick={closeAll}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/best-sale" className="nav-link" onClick={closeAll}>
            Best Sale
          </NavLink>
          <NavLink to="/contact" className="nav-link" onClick={closeAll}>
            Contact
          </NavLink>
          <NavLink to="/admin/login" className="nav-link" onClick={closeAll}>
            Admin
          </NavLink>
          <NavLink to="/cart" className="nav-link nav-cart-link" onClick={closeAll}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
