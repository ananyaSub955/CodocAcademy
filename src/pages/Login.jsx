import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="container mt-5 " style={{ maxWidth: '400px' }}>
      <h1 className="text-darkFuschia p-3 text-center fw-bold"> <b> Login </b> </h1>
      <form className="bg-ultramarine p-3 rounded  text-light">
        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label"> <b>Email:</b></label>
          <input
            type="email"
            className="bg-lightBlue form-control"
            id="email"
            placeholder="Enter email"
            name="email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label"> <b>Password:</b></label>
          <input
            type="password"
            className="bg-lightBlue form-control"
            id="pwd"
            placeholder="Enter password"
            name="pswd"
          />
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="remember"
            name="remember"
          />
          <label className="form-check-label" htmlFor="remember">
            Remember me
          </label>
        </div>
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
