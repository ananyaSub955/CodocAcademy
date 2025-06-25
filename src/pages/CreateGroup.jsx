import React from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';


const CreateGroup = () => {
    const navigate = useNavigate();
    
    return (
        <div>
            <BackButton text = "Back to Group Choosing" link = '/groupSignUpChoice'/>
        
            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Group Sign up</b>
                </h1>

                <form className="bg-ultramarine p-3 rounded  text-light">
                    <div className="mb-3 mt-3">
                        <label htmlFor="groupName" className="form-label"> <b>Group Name:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="groupName"
                            placeholder="Enter Group Name"
                            name="groupName"
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="email" className="form-label"> <b>Email:</b></label>
                        <input
                            type="email"
                            className="bg-lightBlue form-control"
                            id="email"
                            placeholder="Enter email"
                            name="email"
                        />
                    </div>
                    <div className='d-flex justify-content-center my-4'>
                        <button className="btn btn-darkFuschia text-center fs-5" >
                            Generate Code
                        </button>
                    </div>

                    <div className="mb-3 mt-3 bg-lightBlue rounded" >
                        <p className='text-dark text-center p-2'> Code appears here</p>
                    </div>

                    <div className='d-flex justify-content-center py-4'>
                        <button className="btn btn-darkFuschia text-center fs-4 border border-black" >
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateGroup