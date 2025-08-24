import React from 'react'
import { useNavigate } from 'react-router-dom'

const Cancel = () => {
    const navigate = useNavigate();
    return (
        <div className='text-center my-3'>
            <h1>Your payment has failed. </h1>
            <h2 className='my-4'>Please try again or contact us at <a className='text-black' href="mailto:codocacademy@gmail.com">codocacademy@gmail.com.</a></h2>
            <button
                className='d-block mx-auto bg-darkFuschia text-white px-4 py-2 rounded border border-darkFuschia my-4'
                onClick={() => navigate('/signUpPlans')}
            >
                Go back to Sign up Page
            </button>

        </div>
    )
}

export default Cancel