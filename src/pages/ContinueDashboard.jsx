import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ananya.honor-itsolutions.com/node";

const ContinueDashboard = () => {
    const navigate = useNavigate();
    const [qrCode, setQrCode] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        fetch(`${url}/get2FA`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                if (data.qrCode) setQrCode(data.qrCode);
                else setError(data?.message || "Unable to load QR code.");
            })
            .catch(() => setError("Unable to load QR code."));
    }, []);

    const handleVerify = async () => {
        try {
            const code = (token || '').replace(/\D/g, '').slice(0, 6);
            if (code.length !== 6) {
                setError("Please enter the 6‑digit code.");
                return;
            }
            const res = await fetch(`${url}/verifyToken`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: code }) // session-based flow
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "2FA verification failed.");
                return;
            }
            if (!data.verified) {
                setError("Invalid token. Please try again.");
                return;
            }

            setVerified(true);

            // route from flags (or fetch /session if you prefer)
            const path = data.groupLeader
                ? "/group/dashboard"
                : data.superAdmin
                    ? "/superAdmin/dashboard"
                    : "/user/dashboard";

            setTimeout(() => navigate(path), 1000);
        } catch (e) {
            setError("2FA verification failed. Please try again.");
        }
    };

    return (
        <div className="container my-5">
            <h1 className="text-darkFuschia fs-1 p-3 text-center fw-bold">Thank you</h1>

            {verified ? (
                <div className="text-center mt-5">
                    <h1>✅ 2FA Verified</h1>
                    <p>Redirecting you to your dashboard...</p>
                </div>
            ) : (
                <div className="text-center mt-5">
                    <h1>Please set up Two-Factor Authentication:</h1>
                    <p>Download the <strong>Microsoft</strong> or <strong>Google Authenticator</strong> app and scan this QR code.</p>
                    {qrCode && <img src={qrCode} alt="Scan QR" style={{ margin: 20 }} />}
                    <div className="mt-3">
                        <input
                            className="form-control mb-2"
                            placeholder="Enter 6-digit code"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            inputMode="numeric"
                        />
                        <button className="btn btn-darkFuschia" onClick={handleVerify}>
                            Verify
                        </button>
                        {error && <p className="text-danger mt-2">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContinueDashboard;
