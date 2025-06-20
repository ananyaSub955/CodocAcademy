import React from 'react'
import { useNavigate } from 'react-router-dom'

const IndividualSignUp = () => {
    const navigate = useNavigate();
    return (
        <div>
            <button
                onClick={() => navigate('/signUpPlans')}
            >
                Back to Sign up Options
            </button>
        </div>
    )
}

export default IndividualSignUp