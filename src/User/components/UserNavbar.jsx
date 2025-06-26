import React from 'react'
import logo from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';

const UserNavbar = () => {
    return (
        <nav className="navbar navbar-expand-sm px-4" id="navbar">
            <a className="navbar-brand" href="/">
                <img src={logo} alt="Codoc Academy Logo" style={{ width: '200px' }} />
            </a>
            <div className="container-fluid">

                <ul className="navbar-nav ms-auto fs-5">
                    <li className="nav-item">
                        <NavLink className="nav-link bg-darkFuschia text-white rounded px-4" to="/logout">Logout</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default UserNavbar