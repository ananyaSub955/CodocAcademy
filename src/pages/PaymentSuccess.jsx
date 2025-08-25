import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import graphic1 from '../assets/graphic1.png';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const formatSecret = (s) =>
  (s || "").replace(/\s+/g, "").toUpperCase().match(/.{1,4}/g)?.join(" ") || s;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [secret, setSecret] = useState('');
  const [copied, setCopied] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('');

  useEffect(() => {
    fetch(`${url}/finalizeSignup`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Setup failed");

        const path = data.groupLeader ? "/group/dashboard" : "/user/dashboard";
        localStorage.setItem("postTOSRedirect", path);

        const r = await fetch(`${url}/get2FA`, { credentials: "include" });
        const twofa = await r.json();
        if (!r.ok) throw new Error(twofa.message || "Unable to load 2FA");

        if (twofa.qrCode) setQrCode(twofa.qrCode);
        if (twofa.secret) setSecret(twofa.secret); 
      })
      .catch((e) => setError(e.message || "Unable to initialize"));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Couldn’t copy. Long-press or select the key manually.");
    }
  };

  const handleVerify = async () => {
    try {
      const code = (token || "").trim();
      if (code.length !== 6) return setError("Please enter the 6-digit code.");

      const res = await fetch(`${url}/verifyToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: code })
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        return setError(data?.message || "2FA verification failed.");
      }

      setVerified(true);
      // after verify, stop showing the secret
      setSecret("");
      setTimeout(() => navigate("/termsandconditions", { replace: true }), 1200);
    } catch {
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
          <p>Redirecting you to our terms and conditions...</p>
        </div>
      ) : (
        <div className="text-center mt-5">
          <h1>✅ Payment Successful</h1>
          <p>Please set up Two-Factor Authentication:</p>

          <p> Download the <strong>Microsoft or Google Authenticator App</strong> on your mobile device and scan this QR code.</p>

          {qrCode && <img src={qrCode} alt="Scan this QR code" style={{ margin: '20px' }} />}

          {secret && (
            <div className="mt-3">
              <p className="mb-1"><strong>Can’t scan?</strong> Enter this setup key:</p>
              <div
                className="d-inline-flex align-items-center gap-2 bg-light p-2 rounded"
                style={{ wordBreak: "break-all", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              >
                <span className="select-all">{formatSecret(secret)}</span>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="text-muted small mt-2">
                In your authenticator app, choose “Enter a setup key”. Account name = your email. Issuer = CoDoc Academy.
              </div>
            </div>
          )}

          <div className="mt-3">
            <input
              className="form-control my-4 d-inline-block text-center"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              // inputMode="numeric"
              pattern="\d*"
              style={{ width: '400px' }}
            />
            <button
              className="btn btn-darkFuschia"
              onClick={handleVerify}
              disabled={(token || "").trim().length !== 6}
            >
              Verify</button>
            {error && <p className="text-danger mt-2">{error}</p>}
            {/* <p className='text-danger mt-3' style={{ overflowWrap: 'break-word' }}>The authentication key may not appear to work, but please log in. Your account has been created successfully. The software is currently being modified</p> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
