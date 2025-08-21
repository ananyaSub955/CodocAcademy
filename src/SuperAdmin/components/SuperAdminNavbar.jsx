import React from 'react'

import logo from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ananya.honor-itsolutions.com/node";

const SuperAdminNavbar = () => {
    const navigate = useNavigate();

    const logoutUser = async () => {
        try {
            const response = await fetch(`${url}/logout`, {
                credentials: "include",
            });
            if (response.ok) {
                // setUserId(false);
                // setIsLoggedIn(false);
                navigate("/login");
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg px-4 mb-2">
            <a className="navbar-brand" href="/superAdmin/dashboard">
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

            {/* Collapsible Nav */}
            <div className="collapse navbar-collapse mb-2" id="navbarUserLinks">
                <ul className="navbar-nav ms-auto fs-5 gap-2">
                    <li className="nav-item">
                        <NavLink className="nav-link rounded px-4 loginHover me-2" to="/superAdmin/dashboard">Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link rounded px-4 loginHover me-2" to="/superAdmin/contact">Contact Us</NavLink>
                    </li>
                    <li className="nav-item">
                        <span
                            className="nav-link rounded px-4 loginHover me-2"
                            role="button"
                            onClick={logoutUser}
                            style={{ cursor: 'pointer' }}
                        >
                            Logout
                        </span>
                    </li>

                </ul>
            </div>
        </nav>
    );
};
export default SuperAdminNavbar