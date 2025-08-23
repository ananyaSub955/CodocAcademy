import React from 'react';
import { useNavigate } from 'react-router-dom';
import landingPageImage from '../assets/landingPageImage.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-ultramarine text-white">
            <div className="container-fluid px-4 py-8 p-5">
                <div className="row d-flex align-items-center">
                    {/* Left Column */}
                    <div className="col-sm-12 col-md-6 mb-4 mb-md-0">
                        <h2 className="text-large font-weight-bold lh-base mb-5">
                            <strong>Codoc App: </strong><br /> Reference Guide To Make Clinical Documentation Easy
                        </h2>
                        <h3 className="pl-3 lh-base d-flex justify-content-center fs-2  ">Sign up Now!</h3>
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mt-4 pl-4 ">
                            <button
                                className="btn btn-darkFuschia fs-3 p-4"
                                onClick={() => navigate('/signUpPlans')}
                            // style = {{textWrap:'nowrap'}}
                            >
                                Company/Group Sign up
                            </button>
                            <span className="font-semibold fs-3">OR</span>
                            <button
                                className="btn btn-darkFuschia fs-3 p-4"
                                onClick={() => navigate('/signUpPlans')}
                            // style = {{textWrap:'nowrap'}}

                            >
                                Individual Sign up
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Image) */}
                    <div className="col-sm-12 col-md-6 d-flex justify-content-center">
                        <img
                            src={landingPageImage}
                            alt="Doctor using Codoc system"
                            className="img-fluid max-w-sm object-contain landingImage"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Section 2 - About Us */}
            <div className="bg-white text-darkFuschia text-center py-5">
                <h1 className="fs-1 fw-bold">About Us</h1>
                <p className="text-black text-center mx-auto py-5 fs-4" style={{ width: '65%' }}>
                    Our mission for the Codoc App is to make clinical documentation simple and easy to operate by providing a comprehensive interface to view ICD-10 codes and their clinical applications. By making this all-in-one accessible platform, we aim to simplify coding guidelines, explain clinical applications, and suggest clinical correlations. We are committed to keeping our platform up-to-date and compliant with the latest coding standards, including the Version 28 a New Rx HCC Model. Our goal is to empower healthcare professionals with accurate descriptions of ICD-10 codes and enhance their understanding of clinical documentation.
                </p>
            </div>

        </div>
    );
};

export default Landing;
