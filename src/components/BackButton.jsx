import React from 'react'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ text = "Back", link = "/signUpPlans" , marginLeft = '20px'}) => {
    const navigate = useNavigate();
    return (
        <div className="mb-3">
            <button
                className="bg-darkFuschia text-white px-4 py-2 rounded border border-darkFuschia d-flex align-items-center mt-4"
                style={{ marginLeft: marginLeft }}
                onClick={() => navigate(link)}
            >
                <i className="fas fa-chevron-left me-2"></i>
                {text}
            </button>
        </div>

    )
}

export default BackButton