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
    try {
      const code = (token || "").trim();

      if (!code || code.length < 6) {
        setError("Please enter the 6‑digit code.");
        return;
      }

      // Try verifying the token
      const res = await fetch(`${url}/verifyToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: code }) 
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        console.log("point 1",res);
        setError(data?.message || "2FA verification failed.");
        return;
      }

      if (!data.verified) {
        setError("Invalid token. Please try again.");
        return;
      }

      setVerified(true);

      // Prefer the path computed from finalizeSignup; if missing, fetch session to decide
      let path = dashboardPath;
      if (!path) {
        const roleResponse = await fetch(`${url}/session`, { credentials: "include" });
        const user = await roleResponse.json();
        path = user?.groupLeader ? "/group/dashboard" : "/user/dashboard";
      }

      setTimeout(() => navigate(path), 1200);
    } catch (err) {
      console.error(err);
      setError("2FA verification failed. Please try again.");
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

          <p> Download the <strong>Microsoft or Google Authenticator App</strong> on your mobile device and scan this QR code.</p>

          {qrCode && <img src={qrCode} alt="Scan this QR code" style={{ margin: '20px' }} />}

          <div className="mt-3">
            <input
              className="form-control mb-2"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={7}
              // inputMode="numeric"
              pattern="\d*"
            />
            <button
              className="btn btn-darkFuschia"
              onClick={handleVerify}
              // disabled={(token || "").trim().length !>= 6}
              >
                Verify</button>
            {error && <p className="text-danger mt-2">{error}</p>}
            <p className='text-danger mt-3' style={{ overflowWrap: 'break-word' }}>The authentication key may not appear to work, but please log in. Your account has been created successfully. The software is currently being modified</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
