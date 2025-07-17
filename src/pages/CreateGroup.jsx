import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton';


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
    

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleGroupCreation = async (e) => {
        e.preventDefault();
        if (!groupName || !email || !password|| !code) {
            alert("Please fill in all fields.");
            return;
        }

         if (!validatePassword(password)) {
            setError("Password does not meet requirements");
            return;
        }


        try {
            const response = await fetch(`${url}/createGroup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupName, email, password, code }),
                credentials: "include",
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                alert(data.message);
                navigate("/group/dashboard");
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error("Signup error:", error);
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


    return (
        <div>
            <BackButton text="Back to Group Choosing" link='/groupSignUpChoice' />

            <div className="container mt-4" style={{ maxWidth: '500px' }}>
                <h1 className="text-darkFuschia p-3 text-center fw-bold">
                    <b>Group Sign up</b>
                </h1>

                <form className="bg-ultramarine p-3 rounded  text-light" onSubmit={handleGroupCreation}>
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