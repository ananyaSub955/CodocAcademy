import React from 'react';
import { useNavigate } from 'react-router-dom';
import graphic1 from '../assets/graphic1.png';

const GroupConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="position-relative py-5">
      {/* Decorative Plus Signs */}
      <img src={graphic1} className="decorative plus top-left" alt="plus" />
      <img src={graphic1} className="decorative plus bottom-right" alt="plus" />

      <h1 className="text-darkFuschia fs-1 p-3 text-center fw-bold">Thank you</h1>

      <h2 className="text-center p-3 fs-2 fw-bold">
        You have now created a Group!
      </h2>
      <h2 className="text-center mt-4 fs-2">
        Check your email for your group’s code.
      </h2>

      <div className="my-5 d-flex justify-content-center">
        <button
          className="bg-darkFuschia text-white px-4 py-2 rounded border border-darkFuschia d-flex align-items-center"
          onClick={() => navigate('/xx')}
        >
          Continue to Group’s Dashboard
          <i className="fas fa-chevron-right ms-2"></i>
        </button>
      </div>
    </div>
  );
};

export default GroupConfirmation;
