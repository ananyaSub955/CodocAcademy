import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // const [isCollapsed, setIsCollapsed] = useState(true);

  // const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  return (
    <nav className="navbar navbar-expand-sm px-4 bg-white" id="navbar">
      <div className="container-fluid">
        {/* Brand */}
        <a className="navbar-brand" href="/">
          <img src={logo} alt="Codoc Academy Logo" style={{ width: '200px' }} />
        </a>

        {/* Hamburger Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarUserLinks"
          aria-controls="navbarUserLinks"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
       <div className="collapse navbar-collapse mb-2" id="navbarUserLinks">
          <ul className="navbar-nav ms-auto fs-5">
            <li className="nav-item">
              <NavLink className="nav-link rounded px-4 loginHover me-2" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link rounded px-4 loginHover" to="/contact">Contact Us</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link rounded px-4 loginHover" to="/login">Login</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
