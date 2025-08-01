import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';
import { validatePassword } from '../components/ValidatePassword';


const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";


const CreateGroup = () => {
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [size, setSize] = useState('lt10');



    const handleGroupCreation = async (e) => {
        e.preventDefault();
        if (!groupName) return alert("Please enter a group name.");
        if (!email) return alert("Please enter an email address.");
        if (!password) return alert("Please enter a password.");
        if (!code) return alert("Please generate or enter a group code.");
        if (!size) return alert("Please select a group size.");
        if (!frequency) return alert("Please select a billing frequency.");


        try {
            const response = await fetch(`${url}/createGroup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupName, email, password, code, frequency, groupSize: size }),
                credentials: "include",
            });

            const data = await response.json();
            if (response.ok && data.url) {
                window.location.href = data.url; // Stripe checkout
            } else {
                setError(data.message || "Group signup failed.");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("An error occurred while signing up.");
        }
    };


    const handleGenerateCode = async () => {
        try {
            const response = await fetch(`${url}/generateGroupCode`, {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();
            if (response.ok && data.code) {
                setCode(data.code);
            } else {
                alert("Failed to generate code");
            }
        } catch (err) {
            console.error("Error generating code:", err);
        }
    };


    const result = validatePassword(password);

    return (
        <div>
            <BackButton text="Back to Group Choices" link='/groupSignUpChoice' />

            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Group Sign up</b>
                </h1>

                <form className="bg-ultramarine p-3 rounded text-light" onSubmit={handleGroupCreation}>
                    <div className="mb-3 mt-3">
                        <label htmlFor="groupName" className="form-label"> <b>Group Name:</b></label>
                        <input
                            type="text"
                            className="bg-lightBlue form-control"
                            id="groupName"
                            placeholder="Enter Group Name"
                            name="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
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



                    <div className='d-flex justify-content-center my-4'>
                        <button
                            type="button"
                            className="btn btn-darkFuschia text-center fs-5"
                            onClick={handleGenerateCode}
                        >
                            Generate Code
                        </button>
                    </div>

                    <div className="mb-3 mt-3 bg-lightBlue rounded" >
                        <p className='text-dark text-center p-2'>
                            {code ? `Your group code: ${code}` : "Code appears here"}
                        </p>
                    </div>

                    <hr className='border-t-2' />

                    <div className="mb-3 mt-3">
                        <label htmlFor="size" className="form-label"><b>Group Size:</b></label>
                        <select
                            id="size"
                            className="bg-lightBlue form-control"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                        >
                            <option value="lt10">Less than 10 members</option>
                            <option value="gt10">10 or more members</option>
                        </select>
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

                    {error && (
                        <ul style={{ color: 'text-warning' }}>
                            {Array.isArray(error)
                                ? error.map((msg, idx) => <li key={idx}>{msg}</li>)
                                : <li>{error}</li>
                            }
                        </ul>
                    )}



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