import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ananya.honor-itsolutions.com";

const TwoFactorSetup = () => {
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(null);

    useEffect(() => {
        fetch(`${url}/generate`)
            .then((res) => res.json())
            .then((data) => {
                setQrCode(data.qr);
                setSecret(data.secret);
            })
            .catch((err) => console.error("Error generating QR:", err));
    }, []);

    const handleVerify = async () => {
        try {
            const response = await fetch(`${url}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, secret }),
            });

            const data = await response.json();
            setVerified(data.verified);
            //navigate("/")
        } catch (err) {
            console.error("Verification error:", err);
        }
    };

    return (
        <div className="p-4">
            <h2 className="mb-3">Set Up Two-Factor Authentication</h2>

            {qrCode && (
                <div>
                    <p>Scan this QR code with your Google Authenticator app:</p>
                    <img src={qrCode} alt="QR Code" />
                </div>
            )}

            <div className="mt-4">
                <label>Enter the 6-digit code from your app:</label>
                <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    maxLength={6}
                    className="form-control my-2"
                />
                <button className="btn btn-primary" onClick={handleVerify}>
                    Verify Token
                </button>
            </div>

            {verified !== null && (
                <div className={`alert mt-3 ${verified ? "alert-success" : "alert-danger"}`}>
                    {verified ? "✅ Token is valid!" : "❌ Invalid token"}
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
