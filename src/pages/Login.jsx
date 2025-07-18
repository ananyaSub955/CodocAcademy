import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { individualUser, inGroup, groupLeader, superAdmin } = data;

        if (groupLeader) {
          navigate('/group/dashboard');
        } else if (individualUser || inGroup) {
          navigate('/user/dashboard');
        } else if (superAdmin) {
          navigate('/superAdmin/dashboard'); 
        } else {
          setError("Unauthorized login");
        }
      }

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };


  return (
    <div className="container mt-5 " style={{ maxWidth: '400px' }}>
      <h1 className="text-darkFuschia p-3 text-center fw-bold"> <b> Login </b> </h1>
      <form className="bg-ultramarine p-3 rounded  text-light" onSubmit={handleLogin}>
        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label"> <b>Email:</b></label>
          <input
            type="email"
            className="bg-lightBlue form-control"
            id="email"
            placeholder="Enter email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label"> <b>Password:</b></label>
          <input
            type="password"
            className="bg-lightBlue form-control"
            id="pwd"
            placeholder="Enter password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="remember"
            name="remember"
          />
          <label className="form-check-label" htmlFor="remember">
            Remember me
          </label>
        </div> */}

        {error && <p className="text-warning">{error}</p>}

        <button type="submit" className="btn btn-darkFuschia">
          Login
        </button>

        <p className='mt-4'>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signUpPlans')}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign up Here
          </span>
        </p>

      </form>



    </div>
  );
};

export default Login;
