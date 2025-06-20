import React from 'react';

const Footer = () => {
    return (
        <div className='pt-5'>
            <footer className="bg-ultramarine text-white">
                <div className="container p-4">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 mb-4">
                            <h5 className="mb-3 text-light font-weight-bold">Codoc Academy</h5>
                            <p>
                                CoDoc supports providers in creating
                                better patient health outcomes and strives to
                                empower and educate providers through training
                                to optimize patient visits
                            </p>
                        </div>

                        <div className="col-lg-3 col-md-6 ">
                            <h5 className="mb-3 text-light font-bold">Contact Us</h5>
                            <div className="flex text-2xl mb-2">
                                <a
                                    href="https://www.facebook.com/people/CoDoc-Academy/61558952303145/"
                                    className=" text-white p-2 hover:bg-white hover:text-darkFuschia transition"
                                    // style={{ width: '64px', height: '64px' }}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <i className="fab fa-facebook-f text-3xl"></i>
                                </a>
                                <a
                                    href="https://www.instagram.com/codocacademy/?hl=en"
                                    className=" text-white p-2 hover:bg-white hover:darkFuschia transition"
                                    // style={{ width: '64px', height: '64px' }}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <i className="fab fa-instagram text-3xl"></i>
                                </a>
                                <a
                                    href="https://www.linkedin.com/company/codoc-academy/about/"
                                    className=" text-white p-2 hover:bg-white hover:darkFuschia transition"
                                    // style = {{width: '64px', height: '64px'}}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    <i className="fab fa-linkedin-in text-3xl"></i>
                                </a>
                            </div>
                        </div>


                        <div className="col-lg-3 col-md-6 mb-4">
                            <h5 className="mb-1 text-light font-weight-bold">Opening Hours</h5>
                            <table className="w-full text-sm text-left text-white">
                                <tbody>
                                    <tr>
                                        <td className="pr-4">Mon - Fri:</td>
                                        <td>8am - 9pm</td>
                                    </tr>
                                    <tr>
                                        <td className="pr-4">Sat - Sun:</td>
                                        <td>8am - 1am</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="text-center p-3 bg-deepTeal">
                    Copyright © 2024 Codoc Academy. All Rights Reserved. Powered By Skyvista360
                    {/* <a className="text-white ml-1" href="https://mdbootstrap.com/">MDBootstrap.com</a> */}
                </div>
            </footer>
        </div>
    );
};

export default Footer;
