import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import graphic1 from '../assets/graphic1.png';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('');

  useEffect(() => {
    fetch(`${url}/finalizeSignup`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const path = data.groupLeader ? "/group/dashboard" : "/user/dashboard";
          setDashboardPath(path);
          // fetch QR
          fetch(`${url}/get2FA`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
              if (data.qrCode) setQrCode(data.qrCode);
              else setError("Unable to load QR code.");
            });
        } else {
          alert("Payment completed, but account setup failed.");
        }
      });
  }, []);

  const handleVerify = async () => {
    const response = await fetch(`${url}/verifyToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if (data.verified) {
      setVerified(true);
      setTimeout(() => navigate(dashboardPath), 1500);
    } else {
      setError("Invalid token. Please try again.");
    }
  };

  return (
    <div className="container my-5 position-relative py-5">
      <img src={graphic1} className="decorative plus top-left" alt="plus" />
      <img src={graphic1} className="decorative plus bottom-right" alt="plus" />

      <h1 className="text-darkFuschia fs-1 p-3 text-center fw-bold">Thank you</h1>

      {verified ? (
        <div className="text-center mt-5">
          <h1>✅ 2FA Verified</h1>
          <p>Redirecting you to your dashboard...</p>
        </div>
      ) : (
        <div className="text-center mt-5">
          <h1>✅ Payment Successful</h1>
          <p>Please set up Two-Factor Authentication:</p>

          {qrCode && <img src={qrCode} alt="Scan this QR code" style={{ margin: '20px' }} />}

          <div className="mt-3">
            <input
              className="form-control mb-2"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button className="btn btn-darkFuschia" onClick={handleVerify}>Verify</button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
