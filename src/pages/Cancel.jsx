import React from 'react'
import { useNavigate } from 'react-router-dom'

const Cancel = () => {
    const navigate = useNavigate();
    return (
        <div className='text-center mt-3'>
            <h1>Your payment has failed. </h1>
            <h2 className='m-4'>Please try again or contact us at blank@email.com OR (000)-000-0000</h2>
            <button
                className='d-block mx-auto bg-darkFuschia text-white px-4 py-2 rounded border border-darkFuschia mt-4'
                onClick={() => navigate('/signUpPlans')}
            >
                Go back to Sign up Page
            </button>

        </div>
    )
}

export default Cancel