import React from 'react';
import logo from '../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
// import './Navbar.css'; 

const Navbar = () => {
  //const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-sm bg-light px-4" id= "navbar">
      <a className="navbar-brand" href="/">
        <img src={logo} alt="CSN logo" style={{ width: '200px' }} />
      </a>
      <div className="container-fluid">

        <ul className="navbar-nav ms-auto fs-5">
          <li className="nav-item">
            <NavLink className="nav-link" to="/">Login</NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink className="nav-link" to="/logentry">Log an Entry</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/history">Student History</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/jobs">Jobs</NavLink>
          </li> */}
        </ul>
{/* 
        <button className="btn btn-primary" onClick={() => navigate('/history')}>
          Get started
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
