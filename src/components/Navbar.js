import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }} onClick={closeMenu}>
        <h2 className="logo">
          <span style={{ fontSize: "28px", marginRight: "8px" }}>🏥</span>
          Sai Hospital
        </h2>
      </Link>

      <div className={`hamburger ${isOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        {location.pathname !== "/" && location.pathname !== "/dashboard" && (
          <Link to="/" onClick={closeMenu}>Home</Link>
        )}
        
        {!["/dashboard", "/login", "/admin"].includes(location.pathname) && (
          <>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
            <Link to="/login" className="admin-btn" onClick={closeMenu}>Admin Portal</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;