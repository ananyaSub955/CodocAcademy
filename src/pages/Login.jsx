import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [token, setToken] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Logging");

    try {
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.requires2FA) {
        setRequires2FA(true);
        setTempUserId(data.tempUserId);
        return;
      }

      if (response.ok && data.success) {
        redirectToDashboard(data);
      } else {
        setError("Unauthorized login");
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };

  const handle2FAVerify = async () => {
    try {
      const res = await fetch(`${url}/verifyToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, tempUserId })
      });

      const data = await res.json();

      if (data.verified) {
        // you may want to re-fetch session or redirect
        const roleResponse = await fetch(`${url}/session`, { credentials: "include" });
        const user = await roleResponse.json();
        redirectToDashboard(user);
      } else {
        setError("Invalid token. Try again.");
      }
    } catch (err) {
      setError("2FA verification failed.");
      console.error(err);
    }
  };

  const redirectToDashboard = ({ individualUser, inGroup, groupLeader, superAdmin }) => {
    if (groupLeader) {
      navigate('/group/dashboard');
    } else if (individualUser || inGroup) {
      navigate('/user/dashboard');
    } else if (superAdmin) {
      navigate('/superAdmin/dashboard');
    } else {
      setError("No role assigned.");
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

        {error && <p className="text-warning">{error}</p>}

        {requires2FA && (
          <div className="mb-3">
            <label htmlFor="token" className="form-label"><b>2FA Code:</b></label>
            <input
              type="text"
              className="bg-lightBlue form-control"
              id="token"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button type="button" className="btn btn-darkFuschia mt-2" onClick={handle2FAVerify}>
              Verify 2FA
            </button>
          </div>
        )}


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
