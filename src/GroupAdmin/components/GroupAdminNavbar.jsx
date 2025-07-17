import React from 'react'
import logo from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const GroupAdminNavbar = () => {
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
        <nav className="navbar navbar-expand-sm px-4" id="navbar">
            <a className="navbar-brand" href="/group/dashboard">
                <img src={logo} alt="Codoc Academy Logo" style={{ width: '200px' }} />
            </a>
            <div className="container-fluid">

                <ul className="navbar-nav ms-auto fs-5">
                    <li className="nav-item">
                        <button
                            className="nav-link bg-darkFuschia text-white rounded px-4"
                            onClick={() => logoutUser()}
                            >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default GroupAdminNavbar