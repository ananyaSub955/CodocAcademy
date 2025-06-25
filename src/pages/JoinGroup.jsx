import React from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';


const JoinGroup = () => {
    const navigate = useNavigate();

    return (
        <div>
            <BackButton text="Back to Group Choosing" link='/groupSignUpChoice' />


            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Join a Group</b>
                </h1>

                <form className="bg-ultramarine p-3 rounded  text-light">
                    <div className="mb-3 mt-3">
                        <label htmlFor="firstName" className="form-label"> <b>First Name:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="firstName"
                            placeholder="Enter First Name"
                            name="firstName"
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="lastName" className="form-label"> <b>Last Name:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="lastName"
                            placeholder="Enter Last Name"
                            name="lastName"
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="email" className="form-label"> <b>Email:</b></label>
                        <input
                            type="email"
                            className="bg-lightBlue form-control"
                            id="email"
                            placeholder="Enter Email"
                            name="email"
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="password" className="form-label"> <b>Password:</b></label>
                        <input
                            type="password"
                            className="bg-lightBlue form-control"
                            id="password"
                            placeholder="Enter Username"
                            name="username"
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="groupCode" className="form-label"> <b>Code for the Group you are joining:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="groupCode"
                            placeholder="Enter Code:"
                            name="groupCode"
                        />
                    </div>

                    <div className='d-flex justify-content-center py-4'>
                        <button className="btn btn-darkFuschia text-center fs-4 border border-black" >
                            Join Group
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default JoinGroup