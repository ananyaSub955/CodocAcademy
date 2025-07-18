import React from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';
import { useState } from 'react'

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const JoinGroup = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [code, setCode] = useState('')
    
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };
    

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password || !code) {
            alert("Please fill in all fields.");
            return;
        }

        if (!validatePassword(password)) {
            setError("Password does not meet requirements");
            return;
        }

        try {
            const response = await fetch(`${url}/joinGroup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password, code }),
                credentials: "include",
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                alert(data.message);
                navigate("/user/dashboard");
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("An error occurred while signing up.");
        }
    };
    return (
        <div>
            <BackButton text="Back to Group Choosing" link='/groupSignUpChoice' />

            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Join a Group</b>
                </h1>

                <form className="bg-ultramarine p-3 rounded text-light" onSubmit={handleSignUp}>
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
                    <div className="mb-3 mt-3">
                        <label htmlFor="code" className="form-label"> <b>Code for the Group you are joining:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="code"
                            placeholder="Enter Code:"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-warning">{error}</p>}


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