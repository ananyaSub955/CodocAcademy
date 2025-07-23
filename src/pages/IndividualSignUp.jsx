import React, { useState } from 'react'
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';
import { validatePassword } from '../components/ValidatePassword';


const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";


const IndividualSignUp = () => {

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const [result, setResult] = useState('');
    const [frequency, setFrequency] = useState('monthly');



    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch(`${url}/individualSignup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password }),
                credentials: "include",
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                const checkoutRes = await fetch(`${url}/createCheckoutSession`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        planType: 'individual',
                        frequency,
                        navigationPath: 'user/dashboard'
                       // sucessUrl: `${url}/user/dashboard`
                    }),
                });

                const checkoutData = await checkoutRes.json();
                if (checkoutRes.ok) {
                    window.location.href = checkoutData.url;
                } else {
                    alert("Signup succeeded but payment failed. Please try again.");
                    console.error("Stripe error:", checkoutData);
                }
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("An error occurred while signing up.");
        }
    };

    const result = validatePassword(password);


    return (
        <div>
            <BackButton text="Back to Sign Up Options" />

            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Individual Sign up </b>
                </h1>

                <form className="bg-ultramarine p-3 rounded  text-light" onSubmit={handleSignUp}>
                    <div className="mb-3 mt-3">
                        <label htmlFor="firstName" className="form-label"> <b>First Name:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="firstName"
                            placeholder="Enter First Name"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
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
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 mt-3">
                        <label htmlFor="password" className="form-label"> <b>Password:</b></label>
                        <input
                            type="password"
                            className="bg-lightBlue form-control"
                            id="password"
                            placeholder="Enter Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mt-2">
                        <p className="mb-1 text-light"><b>Password must include:</b></p>
                        <ul className="list-unstyled">
                            <li style={{ opacity: result.checks.length ? 0.4 : 1 }} className="text-warning">• At least 8 characters</li>
                            <li style={{ opacity: result.checks.lowercase ? 0.4 : 1 }} className="text-warning">• A lowercase letter</li>
                            <li style={{ opacity: result.checks.uppercase ? 0.4 : 1 }} className="text-warning">• An uppercase letter</li>
                            <li style={{ opacity: result.checks.number ? 0.4 : 1 }} className="text-warning">• A number</li>
                            <li style={{ opacity: result.checks.special ? 0.4 : 1 }} className="text-warning">• A special character (@$!%*?&)</li>
                        </ul>
                    </div>

                    <div className="mb-3 mt-3">
                        <label htmlFor="frequency" className="form-label"><b>Billing Frequency:</b></label>
                        <select
                            id="frequency"
                            className="bg-lightBlue form-control"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>



                    <div className='d-flex justify-content-center py-4'>
                        <button className="btn btn-darkFuschia text-center fs-4 border border-black" >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default IndividualSignUp