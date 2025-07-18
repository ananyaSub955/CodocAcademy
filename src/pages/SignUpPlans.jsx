import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPlans = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 className="text-darkFuschia p-3 text-center fw-bold">
                <b>Which Plan?</b>
            </h1>
            <div className="row justify-content-center m-3">
                <div className="col-12 col-md-3 bg-ultramarine mx-md-3 mb-3 mb-md-0 rounded">
                    {/* fs = font size  fw = font weight*/}
                    <h2 className="bg-lightBlue rounded p-3 text-center my-4 fs-3 fs-md-2 fw-bold" style = {{maxHeight: '100px', textWrap:'nowrap'}}>
                        Company Group Plan
                    </h2>

                    <div className="text-center mb-5">
                        <h2 className="bg-lightBlue rounded p-3 text-center my-2 fs-5 d-inline-block">
                            Price: $--.--/year
                        </h2>

                        <ul className='list-group bg-transparent border-0'>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 1</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 2</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 3</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 4</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 5</li>

                        </ul>

                        <button
                            className="bg-darkFuschia text-white px-4 py-2 mt-2 rounded border border-darkFuschia transition-transform duration-300 hover:scale-105 hover:text-lg fs-3"
                            onClick={() => navigate('/groupSignUpChoice')}
                        >
                            Create/Join Group <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                </div>
                <div className="col-12 col-md-3 bg-ultramarine mx-md-3 mb-3 mb-md-0 rounded">
                    {/* fs = font size  fw = font weight*/}
                    <h2 className="bg-lightBlue rounded p-3 text-center my-4 fs-3 fs-md-2 fw-bold">
                        Individual Plan
                    </h2>

                    <div className="text-center mb-5">
                        <h2 className="bg-lightBlue rounded p-3 text-center my-2 fs-5 d-inline-block">
                            Price: $--.--/year
                        </h2>

                        <ul className='list-group bg-transparent border-0'>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 1</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 2</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 3</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 4</li>
                            <li className='list-group-item bg-transparent border-0 text-white fs-4'>✓ Benefit 5</li>

                        </ul>

                        <button
                            className="bg-darkFuschia text-white px-4 py-2 mt-2 rounded border border-darkFuschia transition-transform duration-300 hover:scale-105 hover:text-lg fs-3"
                            onClick={() => navigate('/individualSignUp')}
                        >
                            Create Account <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SignUpPlans;
