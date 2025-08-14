import React, { useState } from 'react'
import { MdLocationOn, MdPhone, MdEmail } from "react-icons/md";

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ananya.honor-itsolutions.com/";



const ContactUs = () => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('None');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const [error, setError] = useState('');

    const messageSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email) {
            alert("Please fill in the required fields.");
            return;
        }

        try {
            const response = await fetch(`${url}/contactMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, company, message }),
                credentials: "include",
            });

            //const data = await response.json();

            setSuccess(true);
            
            setFirstName('');
            setLastName('');
            setEmail('');
            setCompany('');
            setMessage('');

        } catch (err) {
            console.error("Signup error:", err);
            setError("An error occurred during signup.");
        }
    };


    return (
        <div className="container mt-5">
            <div className="row align-items-stretch contact-wrap g-4">
                <div className="col-md-8">
                    <div className="form h-100 me-2">
                        <h3>Send us a message</h3>
                        <form className="mb-5" method="post" id="contactForm" name="contactForm" onSubmit={messageSubmit}>
                            <div className="row">
                                <div className="col-md-6 form-group mb-4">
                                    <label htmlFor="firstName" className="col-form-label">First Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="firstName"
                                        id="firstName"
                                        placeholder="Your First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 form-group mb-4">
                                    <label htmlFor="lastName" className="col-form-label">Last Name *</label>
                                    <input type="text"
                                        className="form-control"
                                        name="lastName"
                                        id="lastName"
                                        placeholder="Your Last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 form-group mb-4">
                                    <label htmlFor="email" className="col-form-label">Email *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        id="email"
                                        placeholder="Your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 form-group mb-4">
                                    <label htmlFor="company" className="col-form-label">Company (If applicable)</label>
                                    <input type="text"
                                        className="form-control"
                                        name="company"
                                        id="company"
                                        placeholder="Company name"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 form-group mb-4">
                                    <label htmlFor="message" className="col-form-label">Message *</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        id="message"
                                        cols="30"
                                        rows="4"
                                        placeholder="Write your message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>

                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 form-group">
                                    <input
                                        type="submit"
                                        value="Send Message"
                                        className="btn btn-darkFuschia text-center fs-4 border border-black" />
                                    <span className="submitting"></span>
                                </div>
                            </div>
                        </form>

                        {error && (
                            <ul style={{ color: 'text-warning' }}>
                                {Array.isArray(error)
                                    ? error.map((msg, idx) => <li key={idx}>{msg}</li>)
                                    : <li>{error}</li>
                                }
                            </ul>
                        )}
                        {success && (
                            <div id="form-message-success" className="alert alert-success mt-4">
                                Your message was sent, thank you!
                            </div>
                        )}

                    </div>
                </div>

                <div className="col-md-4 bg-ultramarine text-white rounded px-3">
                    <div className="contact-info h-100 pt-2">
                        <h3>Contact Information</h3>
                        <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestias, magnam!</p>
                        <ul className="list-unstyled">
                            <li className="d-flex mb-2">
                                <MdLocationOn size={20} className="me-2" />
                                <span>9757 Aspen Lane South Richmond Hill, NY 11419</span>
                            </li>
                            <li className="d-flex mb-2">
                                <MdPhone size={20} className="me-2" />
                                <span>+1 (291) 939 9321</span>
                            </li>
                            <li className="d-flex mb-2">
                                <MdEmail size={20} className="me-2" />
                                <span>info@mywebsite.com</span>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
