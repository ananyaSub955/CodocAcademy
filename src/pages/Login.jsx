import React from 'react';

const Login = () => {
  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h1> Login </h1>
      <form>
        <div className="mb-3 mt-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter email"
            name="email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pwd" className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
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
        <button type="submit" className="btn btn-one">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
