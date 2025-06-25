import React from 'react'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ text = "Back", link = "/signUpPlans" }) => {
    const navigate = useNavigate();
  return (
    <div>
        <div className="mb-3">
                <button
                    className="bg-darkFuschia text-white px-4 py-2 rounded border border-darkFuschia d-flex align-items-center"
                    style={{ marginLeft: '20px' }} // adjust as needed
                    onClick={() => navigate(link)}
                >
                    <i className="fas fa-chevron-left me-2"></i>
                    {text}
                </button>
            </div>
        </div>
  )
}

export default BackButton