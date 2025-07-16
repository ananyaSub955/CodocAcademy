import React from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';

const CreateJoinGroup = () => {
    const navigate = useNavigate();

    return (
        <div>
            <BackButton text = "Back to Sign Up Options"/>
            
            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Group Sign up</b>
                </h1>
                <div className="bg-ultramarine p-4 rounded text-light">
                    <h1 className='text-center fs-2 text-break lh-base'>
                        Are you creating a group <br /> OR <br /> joining a group?
                    </h1>
                    <div className="d-flex justify-content-center pt-4">
                        <button
                            className="bg-darkFuschia text-white px-4 py-2 mt-2 rounded border border-darkFuschia transition-transform duration-300 hover:scale-105 hover:text-lg fs-3"
                            onClick={() => navigate('/createGroup')}
                        >
                            Create Group <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <h4 className="bg-lightBlue text-dark px-4 py-2 my-5 text-center mx-auto rounded" style={{ width: 'fit-content' }}>
                        OR
                    </h4>
                    <div className="d-flex justify-content-center pb-4">
                        <button
                            className="bg-darkFuschia text-white px-4 py-2 mt-2 rounded border border-darkFuschia transition-transform duration-300 hover:scale-105 hover:text-lg fs-3"
                            onClick={() => navigate('/joinGroup')}
                        >
                            Join a Group <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CreateJoinGroup