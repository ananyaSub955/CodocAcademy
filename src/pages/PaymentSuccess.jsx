import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import graphic1 from '../assets/graphic1.png';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${url}/finalizeSignup`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const path = data.groupLeader ? "/group/dashboard" : "/user/dashboard";
          setTimeout(() => {
            navigate(path);
          }, 2000);
        } else {
          alert("Payment completed, but account setup failed.");
        }
      });
  }, []);

  return (
    <div className="position-relative py-5">
      {/* Decorative Plus Signs */}
      <img src={graphic1} className="decorative plus top-left" alt="plus" />
      <img src={graphic1} className="decorative plus bottom-right" alt="plus" />

      <h1 className="text-darkFuschia fs-1 p-3 text-center fw-bold">Thank you</h1>

      <div className="text-center mt-5">
        <h1>✅ Payment Successful</h1>
        <p>Your account is being finalized. Redirecting you shortly...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
